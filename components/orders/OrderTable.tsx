"use client";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getPriorityVariant,
  getStatusIcon,
  getStatusVariant,
} from "@/lib/orders/utils";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { OrderDetailsDialog } from "./OrderDetailsDialog";
import { SellerOrder, OrderFilters } from "@/types/pages/order.types";
// import { UPDATE_ORDER_STATUS } from "@/lib/graphql/queries/orders";

interface OrderTableProps {
  orders: SellerOrder[];
  showCheckbox?: boolean;
  showPriority?: boolean;
  showItems?: boolean;
  showDate?: boolean;
  showTracking?: boolean;
  customActions?:any;
  filters?: OrderFilters;
}

export function OrderTable({
  orders,
  showCheckbox = false,
  showPriority = true,
  showItems = true,
  showDate = true,
  showTracking = false,
  customActions,
  filters,
}: OrderTableProps) {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  // const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS);

  const selectOrder = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectAllOrders = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((order) => order.id));
    }
  };

  // const handleStatusUpdate = async (orderId: string, newStatus: string) => {
  //   try {
  //     await updateOrderStatus({
  //       variables: { orderId, status: newStatus },
  //       optimisticResponse: {
  //         updateOrderStatus: {
  //           id: orderId,
  //           status: newStatus,
  //           __typename: "SellerOrder",
  //         },
  //       },
  //       update: (cache, { data }) => {
  //         const updatedOrder = data?.updateOrderStatus;
  //         if (updatedOrder) {
  //           cache.modify({
  //             fields: {
  //               getSellerOrders(existing = { sellerOrders: [] }) {
  //                 return {
  //                   ...existing,
  //                   sellerOrders: existing.sellerOrders.map((order: SellerOrder) =>
  //                     order.id === orderId ? { ...order, status: newStatus } : order
  //                   ),
  //                 };
  //               },
  //             },
  //           });
  //         }
  //       },
  //     });
  //     toast.success(`Order ${orderId} updated to ${newStatus}`);
  //   } catch (error) {
  //     toast.error("Failed to update order status");
  //     console.error(error);
  //   }
  // };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTotal = (total: SellerOrder["total"]) => {
    if (typeof total === "number") {
      return `$${total.toFixed(2)}`;
    }
    if (typeof total === "string") {
      const parsed = parseFloat(total);
      return isNaN(parsed) ? "N/A" : `$${parsed.toFixed(2)}`;
    }
    return "N/A";
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {showCheckbox && (
              <TableHead className="w-8 sm:w-12">
                <Checkbox
                  checked={
                    selectedOrders.length === orders.length && orders.length > 0
                  }
                  onCheckedChange={selectAllOrders}
                />
              </TableHead>
            )}
            <TableHead className="min-w-[100px] text-xs sm:text-sm">
              Order ID
            </TableHead>
            <TableHead className="min-w-[120px] text-xs sm:text-sm">
              Customer
            </TableHead>
            <TableHead className="text-xs sm:text-sm">Status</TableHead>
            {showPriority && (
              <TableHead className="hidden sm:table-cell text-xs sm:text-sm">
                Payment Method
              </TableHead>
            )}
            <TableHead className="text-xs sm:text-sm">Total</TableHead>
            {showItems && (
              <TableHead className="hidden md:table-cell text-xs sm:text-sm">
                Items
              </TableHead>
            )}
            {showDate && (
              <TableHead className="hidden lg:table-cell text-xs sm:text-sm">
                Date
              </TableHead>
            )}
            {showTracking && (
              <TableHead className="hidden md:table-cell text-xs sm:text-sm">
                Tracking
              </TableHead>
            )}
            <TableHead className="text-xs sm:text-sm">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const { Icon, className } = getStatusIcon(order.status);
            return (
              <TableRow key={order.id}>
                {showCheckbox && (
                  <TableCell>
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onCheckedChange={() => selectOrder(order.id)}
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium text-xs sm:text-sm">
                  {order.order.orderNumber}
                </TableCell>
                <TableCell>
                  <div className="min-w-0">
                    <div className="font-medium text-xs sm:text-sm truncate">
                      {`${order.order.buyer.firstName} ${order.order.buyer.lastName}`}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {order.order.buyer.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={getStatusVariant(order.status)}
                    className="flex items-center gap-1 w-fit text-xs"
                  >
                    <Icon className={className} />
                    <span className="hidden sm:inline">{order.status}</span>
                  </Badge>
                </TableCell>
                {showPriority && (
                  <TableCell className="hidden sm:table-cell">
                    <Badge
                      variant={getPriorityVariant(
                        order.order.payments[0]?.provider ?? "unknown"
                      )}
                      className="text-xs"
                    >
                      {order.order.payments[0]?.provider ?? "N/A"}
                    </Badge>
                  </TableCell>
                )}
                <TableCell className="font-medium text-xs sm:text-sm">
                  {formatTotal(order.total)}
                </TableCell>
                {showItems && (
                  <TableCell className="hidden md:table-cell text-xs sm:text-sm">
                    {order.items.length}
                  </TableCell>
                )}
                {showDate && (
                  <TableCell className="hidden lg:table-cell text-xs sm:text-sm">
                    {order.createdAt ? formatDate(order.createdAt) : "N/A"}
                  </TableCell>
                )}
                {showTracking && (
                  <TableCell className="hidden md:table-cell text-xs sm:text-sm">
                    <Button
                      variant="outline"
                      size="sm"
                      // onClick={() => handleStatusUpdate(order.id, "shipped")}
                      className="text-xs"
                    >
                      Generate Tracking
                    </Button>
                  </TableCell>
                )}
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <OrderDetailsDialog
                      order={order}
                      // onStatusUpdate={handleStatusUpdate}
                    />
                    {customActions ? (
                      customActions(order)
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel className="text-xs">
                            Quick Actions
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {order.status === "PENDING" && (
                            <DropdownMenuItem
                              // onClick={() => handleStatusUpdate(order.id, "PROCESSING")}
                              className="text-xs"
                            >
                              Start Processing
                            </DropdownMenuItem>
                          )}
                          {order.status === "PROCESSING" && (
                            <DropdownMenuItem
                              // onClick={() => handleStatusUpdate(order.id, "SHIPPED")}
                              className="text-xs"
                            >
                              Mark as Shipped
                            </DropdownMenuItem>
                          )}
                          {order.status === "SHIPPED" && (
                            <DropdownMenuItem
                              // onClick={() => handleStatusUpdate(order.id, "DELIVERED")}
                              className="text-xs"
                            >
                              Mark as Delivered
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => toast.success("Printing invoice...")}
                            className="text-xs"
                          >
                            Print Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toast.success("Printing shipping label...")}
                            className="text-xs"
                          >
                            Print Shipping Label
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toast.success("Opening email client...")}
                            className="text-xs"
                          >
                            Contact Customer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}