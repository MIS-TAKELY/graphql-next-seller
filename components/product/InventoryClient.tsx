"use client";

import { useQuery } from "@apollo/client";
import { GET_INVENTORY } from "@/client/product/product.queries";
import { InventoryTableRow } from "@/components/product/InventoryTableRow";
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { GetMyProductsResponse, InventoryProduct } from "@/types/pages/product";
import type { ProductVariant } from "@/types/product/product.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingDown, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function InventoryClient() {
    const { data, loading, error } = useQuery<GetMyProductsResponse>(GET_INVENTORY, {
        fetchPolicy: "cache-and-network",
    });

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-[100px]" />
                                <Skeleton className="h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-[60px] mb-2" />
                                <Skeleton className="h-3 w-[100px]" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-[150px] mb-2" />
                        <Skeleton className="h-4 w-[250px]" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center text-red-500">
                Error loading inventory: {error.message}
            </div>
        );
    }

    const inventoryItems: InventoryProduct[] = (data?.getMyProducts?.products ?? []).map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        images: product.images,
        variants: product.variants.map((v: ProductVariant) => ({
            id: v.id,
            sku: v.sku,
            stock: v.stock,
            soldCount: v.soldCount ?? 0,
            price: typeof v.price === "string" ? parseFloat(v.price) : v.price,
            mrp: v.mrp ? (typeof v.mrp === "string" ? parseFloat(v.mrp) : v.mrp) : undefined,
        })),
    }));

    const totalSoldCount = inventoryItems.reduce((total, item) => {
        return total + (item.variants[0]?.soldCount ?? 0);
    }, 0);

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inventoryItems.length}</div>
                        <p className="text-xs text-muted-foreground">In inventory</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {inventoryItems.filter((item) => (item.variants[0]?.stock ?? 0) < 10).length}
                        </div>
                        <p className="text-xs text-muted-foreground">Need reorder</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {inventoryItems.filter((item) => (item.variants[0]?.stock ?? 0) === 0).length}
                        </div>
                        <p className="text-xs text-muted-foreground">Urgent restock</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sold Quantity</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSoldCount}</div>
                        <p className="text-xs text-muted-foreground">In pending orders</p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Inventory Status</CardTitle>
                    <CardDescription>
                        Monitor your product stock levels and availability.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Image</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Sold Quantity</TableHead>
                                <TableHead>Available</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inventoryItems.map((item) => (
                                <InventoryTableRow key={item.id} item={item} />
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
