"use client";

import { useQuery } from "@apollo/client";
import React, { useState } from "react";
import { GET_PRODUCT_CATEGORIES } from "@/client/product/product.queries";
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
import {
    GetProductCategoriesResponse,
    Product,
    StatusFilter,
} from "@/types/pages/product";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ProductsPageContent() {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [page, setPage] = useState(1);
    const pageSize = 50;

    // Server-side filtering and pagination
    const { productsData, productsDataLoading, handleDelete } = useProduct({
        searchTerm,
        status: statusFilter,
        categoryId: categoryFilter === "all" ? undefined : categoryFilter,
        skip: (page - 1) * pageSize,
        take: pageSize,
    });

    const { data: getCategoryData, loading: getCategoryLoading } =
        useQuery<GetProductCategoriesResponse>(GET_PRODUCT_CATEGORIES, {
            errorPolicy: "all",
            notifyOnNetworkStatusChange: false,
        });

    const handleDeleteProduct = async (id: string) => {
        try {
            await handleDelete(id);
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    const products = productsData?.getMyProducts?.products || [];
    const totalCount = productsData?.getMyProducts?.totalCount || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div className="space-y-6">
            <ProductsPageHeader />

            <ProductStatsCards />

            <Card>
                <CardHeader>
                    <CardTitle>Product Inventory</CardTitle>
                    <CardDescription>
                        View and manage all your products ({totalCount})
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ProductFilters
                        searchTerm={searchTerm}
                        onSearchChange={(val) => { setSearchTerm(val); setPage(1); }}
                        statusFilter={statusFilter}
                        onStatusChange={(val) => { setStatusFilter(val); setPage(1); }}
                        categoryFilter={categoryFilter}
                        onCategoryChange={(val) => { setCategoryFilter(val); setPage(1); }}
                        categories={(getCategoryData?.categories as Category[]) || []}
                        isCategoryLoading={getCategoryLoading}
                    />

                    <ProductsTable
                        products={products as Product[]}
                        onDelete={handleDeleteProduct}
                        isLoading={productsDataLoading}
                    />

                    {!productsDataLoading && products.length === 0 && <EmptyProductsState />}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between py-4">
                            <div className="text-sm text-muted-foreground">
                                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} products
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1 || productsDataLoading}
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
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages || productsDataLoading}
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
