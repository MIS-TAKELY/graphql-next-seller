"use client";
import { GET_DASHBOARD_RECENT_ORDERS } from "@/client/dashboard/dashboard.query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@apollo/client";

export function RecentOrders() {
  const { data, loading, error } = useQuery(GET_DASHBOARD_RECENT_ORDERS);

  console.log("recent orders-->", data);

  if (loading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="ml-4 space-y-1">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-3 w-[100px]" />
            </div>
            <div className="ml-auto flex flex-col items-end gap-1">
              <Skeleton className="h-4 w-[60px]" />
              <Skeleton className="h-4 w-[80px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    console.error("error", error);
    return <div className="text-sm text-destructive">Error loading recent orders</div>;
  }

  const recentData = data?.getSellerOrders?.sellerOrders;

  return (
    <div className="space-y-8">
      {recentData?.map((order: any, index: number) => (
        <div key={order.order?.id || index} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={order?.order?.buyer?.avatarImageUrl || "/placeholder.svg"}
              alt="Avatar"
            />
            <AvatarFallback>
              {order?.order?.buyer?.firstName?.[0]}
              {order?.order?.buyer?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none flex gap-x-1">
              <span>{order?.order?.buyer?.firstName}</span>
              <span>{order?.order?.buyer?.lastName}</span>
            </p>
            <p className="text-sm text-muted-foreground truncate max-w-[150px] sm:max-w-none">
              {order?.order?.buyer?.email}
            </p>
          </div>
          <div className="ml-auto font-medium">
            <div className="text-right">
              <div className="text-sm">Rs. {order.order?.total}</div>
              <Badge
                variant={
                  order.order?.status === "DELIVERED"
                    ? "default"
                    : order.order?.status === "PROCESSING" || order.order?.status === "CONFIRMED"
                      ? "secondary"
                      : order.order?.status === "SHIPPED"
                        ? "outline"
                        : "destructive"
                }
                className="text-[10px] h-5 px-1.5"
              >
                {order.order?.status}
              </Badge>
            </div>
          </div>
        </div>
      ))}
      {!recentData?.length && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          No recent orders found
        </div>
      )}
    </div>
  );
}
