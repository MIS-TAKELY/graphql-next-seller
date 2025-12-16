"use client";
import { GET_DASHBOARD_RECENT_ORDERS } from "@/client/dashboard/dashboard.query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@apollo/client";

// const recentOrders = [
//   {
//     id: "ORD-001",
//     customer: "Olivia Martin",
//     email: "olivia.martin@email.com",
//     amount: "+$1,999.00",
//     status: "completed",
//     avatar: "/placeholder-user.jpg",
//   },
//   {
//     id: "ORD-002",
//     customer: "Jackson Lee",
//     email: "jackson.lee@email.com",
//     amount: "+$39.00",
//     status: "processing",
//     avatar: "/placeholder-user.jpg",
//   },
//   {
//     id: "ORD-003",
//     customer: "Isabella Nguyen",
//     email: "isabella.nguyen@email.com",
//     amount: "+$299.00",
//     status: "shipped",
//     avatar: "/placeholder-user.jpg",
//   },
//   {
//     id: "ORD-004",
//     customer: "William Kim",
//     email: "will@email.com",
//     amount: "+$99.00",
//     status: "completed",
//     avatar: "/placeholder-user.jpg",
//   },
//   {
//     id: "ORD-005",
//     customer: "Sofia Davis",
//     email: "sofia.davis@email.com",
//     amount: "+$39.00",
//     status: "pending",
//     avatar: "/placeholder-user.jpg",
//   },
// ];

export function RecentOrders() {
  const { data, loading, error } = useQuery(GET_DASHBOARD_RECENT_ORDERS);

  console.log("recent orders-->", data);

  if (loading) return <div>loading</div>;
  if (error) console.log("error", error);

  const recentData = data?.getSellerOrders?.sellerOrders;

  return (
    <div className="space-y-8">
      {recentData?.map((order: any) => (
        <div key={order.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={order?.avatar || "/placeholder.svg"}
              alt="Avatar"
            />
            <AvatarFallback>{order?.order.buyer.firstName}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none flexPseed gap-x-2">
              <div>{order?.order.buyer.firstName}</div>
              <div>{order?.order.buyer.lastName}</div>
            </p>

            <p className="text-sm text-muted-foreground">
              {order?.order.buyer?.email}
            </p>
          </div>
          <div className="ml-auto font-medium">
            <div className="text-right">
              <div>{order.order.total}</div>
              <Badge
                variant={
                  order.order.status === "CONFIRMED"
                    ? "default"
                    : order.order.status === "PROCESSING"
                    ? "secondary"
                    : order.order.status === "SHIPPED"
                    ? "outline"
                    : "destructive"
                }
                className="text-xs"
              >
                {order.order.status}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
