"use client";

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
import { useQuery } from "@apollo/client";
import React, { useState } from "react";

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { productsData, productsDataLoading, handleDelete } = useProduct();

  const { data: getCategoryData, loading: getCategoryLoading } =
    useQuery<GetProductCategoriesResponse>(GET_PRODUCT_CATEGORIES, {
      errorPolicy: "all",
      notifyOnNetworkStatusChange: false,
    });

  const filteredProducts = React.useMemo(() => {
    if (!productsData?.getMyProducts?.products || productsDataLoading) {
      return [];
    }

    return productsData.getMyProducts.products.filter((product: Product) => {
      // Search filter
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.variants[0]?.sku || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      // Status filter
      let matchesStatus = true;
      if (statusFilter !== "all") {
        if (statusFilter === "active") {
          matchesStatus = product.status === "ACTIVE";
        } else if (statusFilter === "draft") {
          matchesStatus = product.status === "DRAFT";
        } else if (statusFilter === "out_of_stock") {
          matchesStatus = (product.variants[0]?.stock ?? 0) === 0;
        } else if (statusFilter === "low_stock") {
          matchesStatus =
            (product.variants[0]?.stock ?? 0) > 0 &&
            (product.variants[0]?.stock ?? 0) <= 10;
        }
      }

      // Category filter
      const matchesCategory =
        categoryFilter === "all" ||
        product.category?.name === categoryFilter ||
        product.category?.children?.some(
          (child) => child.name === categoryFilter
        );

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [
    productsData,
    productsDataLoading,
    searchTerm,
    statusFilter,
    categoryFilter,
  ]);

  const handleDeleteProduct = async (id: string) => {
    try {
      await handleDelete(id);
      console.log("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="space-y-6">
      <ProductsPageHeader />

      <ProductStatsCards
        products={(productsData?.getMyProducts?.products as Product[]) || []}
        isLoading={productsDataLoading}
      />

      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>View and manage all your products</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            categories={(getCategoryData?.categories as Category[]) || []}
            isCategoryLoading={getCategoryLoading}
          />

          <ProductsTable
            products={filteredProducts}
            onDelete={handleDeleteProduct}
          />

          {filteredProducts.length === 0 && <EmptyProductsState />}
        </CardContent>
      </Card>
    </div>
  );
}
