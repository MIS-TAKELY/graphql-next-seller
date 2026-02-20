"use client";

import React, { useTransition, useState, useCallback } from "react";
import { EmptyProductsState } from "@/components/product/EmptyProductsState";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductsPageHeader } from "@/components/product/ProductsPageHeader";
import { ProductsTable } from "@/components/product/ProductsTable";
import { ProductStatsCards } from "@/components/product/ProductStatsCards";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useProduct } from "@/hooks/product/useProduct";
import { Category } from "@/types/category.type";
import { Product, StatusFilter } from "@/types/pages/product";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface ProductsPageContentProps {
    initialProducts: Product[];
    totalCount: number;
    categories: Category[];
}

export function ProductsPageContent({
    initialProducts,
    totalCount,
    categories,
}: ProductsPageContentProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    // Get current filters from URL
    const page = Number(searchParams.get("page")) || 1;
    const searchTerm = searchParams.get("search") || "";
    const statusFilter = (searchParams.get("status") as StatusFilter) || "all";
    const categoryFilter = searchParams.get("categoryId") || "all";
    const pageSize = 50;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Infinite scroll state
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(true);

    // Use useProduct to fetch products and make it reactive to the cache
    const { productsData, handleDelete, productsDataLoading, fetchMoreProducts } = useProduct({
        skip: (page - 1) * pageSize,
        take: pageSize,
        searchTerm: searchTerm || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        categoryId: categoryFilter === "all" ? undefined : categoryFilter,
    });

    // Use products from hook if available, otherwise fallback to initial products from server
    const products = productsData?.getMyProducts?.products || initialProducts;
    const currentTotalCount = productsData?.getMyProducts?.totalCount || totalCount;

    // Handle infinite scroll - load more products
    const handleEndReached = useCallback(async () => {
        if (isLoadingMore || !hasNextPage || productsDataLoading) return;
        
        setIsLoadingMore(true);
        try {
            const result = await fetchMoreProducts(products.length, pageSize);
            if (result?.data?.getMyProducts?.products) {
                const newProducts = result.data.getMyProducts.products.length;
                setHasNextPage(newProducts === pageSize);
            }
        } catch (error) {
            console.error("Error loading more products:", error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [fetchMoreProducts, products, hasNextPage, isLoadingMore, pageSize, productsDataLoading]);

    // Reset infinite scroll when filters change
    const handleFilterChange = useCallback(() => {
        setHasNextPage(true);
    }, []);

    // URL Update Helper
    const createQueryString = (params: Record<string, string | number | null>) => {
        const newSearchParams = new URLSearchParams(searchParams.toString());

        Object.entries(params).forEach(([key, value]) => {
            if (value === null || value === "" || value === "all") {
                newSearchParams.delete(key);
            } else {
                newSearchParams.set(key, String(value));
            }
        });

        return newSearchParams.toString();
    };

    const updateUrl = (params: Record<string, string | number | null>) => {
        startTransition(() => {
            router.push(`${pathname}?${createQueryString(params)}`);
        });
    };

    const handleDeleteProduct = async (id: string) => {
        try {
            await handleDelete(id);
            // Refresh to show updated list
            router.refresh();
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    return (
        <div className="space-y-6">
            <ProductsPageHeader />

            <ProductStatsCards />

            <Card>
                <CardHeader>
                    <CardTitle>Product Inventory</CardTitle>
                    <CardDescription>
                        View and manage all your products ({currentTotalCount})
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ProductFilters
                        searchTerm={searchTerm}
                        onSearchChange={(val) => { handleFilterChange(); updateUrl({ search: val, page: 1 }); }}
                        statusFilter={statusFilter}
                        onStatusChange={(val) => { handleFilterChange(); updateUrl({ status: val, page: 1 }); }}
                        categoryFilter={categoryFilter}
                        onCategoryChange={(val) => { handleFilterChange(); updateUrl({ categoryId: val, page: 1 }); }}
                        categories={categories}
                        isCategoryLoading={false}
                    />

                    <div className={isPending || productsDataLoading ? "opacity-60 pointer-events-none transition-opacity" : ""}>
                        <ProductsTable
                            products={products}
                            onDelete={handleDeleteProduct}
                            isLoading={isPending || productsDataLoading}
                            onEndReached={handleEndReached}
                            hasNextPage={hasNextPage}
                            isLoadingMore={isLoadingMore}
                        />
                    </div>

                    {!isPending && initialProducts.length === 0 && <EmptyProductsState />}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between py-4">
                            <div className="text-sm text-muted-foreground">
                                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} products
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateUrl({ page: page - 1 })}
                                    disabled={page === 1 || isPending}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>
                                <div className="text-sm font-medium">
                                    Page {page} of {totalPages}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateUrl({ page: page + 1 })}
                                    disabled={page === totalPages || isPending}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
