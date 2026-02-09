"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, gql } from "@apollo/client";

// GraphQL Query
const GET_TOP_PRODUCTS = gql`
  query GetTopProducts($limit: Int = 5, $year: Int, $month: Int) {
    getTopProducts(limit: $limit, year: $year, month: $month) {
      products {
        productId
        productName
        image
        totalQuantity
        totalRevenue
      }
      totalProducts
    }
  }
`;

interface TopProduct {
  productId: string;
  productName: string;
  image: string | null;
  totalQuantity: number;
  totalRevenue: number;
}

interface QueryData {
  getTopProducts: {
    products: TopProduct[];
    totalProducts: number;
  };
}

export function TopProducts() {
  const { data, loading, error } = useQuery<QueryData>(GET_TOP_PRODUCTS, {
    variables: {
      limit: 5,
      // year: 2025,
      // month: 3,
    },
  });

  const products = data?.getTopProducts?.products ?? [];
  const maxRevenue = products.length > 0 ? Math.max(...products.map(p => p.totalRevenue)) : 1;

  // Loading State
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
          <CardDescription>Your best sellers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-52" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Error or No Data
  if (error || products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
          <CardDescription>
            {products.length === 0 ? "No sales yet" : "Failed to load"}
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {products.length === 0
              ? "Your top products will appear here once you make sales!"
              : "Something went wrong. Please try again later."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
        <CardDescription>Your best performing items</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {products.map((product, index) => {
          const progress = maxRevenue > 0 ? (product.totalRevenue / maxRevenue) * 100 : 0;
          const revenueFormatted = `रू ${product.totalRevenue.toLocaleString()}`;

          return (
            <div key={product.productId} className="space-y-3">
              <div className="flex items-start gap-4">
                {/* Product Image */}
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.productName}
                    className="w-12 h-12 rounded-md object-cover border bg-white shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-md bg-muted border flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">No img</span>
                  </div>
                )}

                {/* Product Info */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold leading-none">
                      {index + 1}. {product.productName}
                    </p>
                    <span className="text-xs font-bold text-primary">
                      #{index + 1}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {product.totalQuantity} sold •{" "}
                    <span className="font-medium text-foreground">
                      {revenueFormatted}
                    </span>
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <Progress value={progress} className="h-2" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}