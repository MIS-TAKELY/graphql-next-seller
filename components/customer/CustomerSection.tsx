// components/customers/CustomerSection.tsx (Client Component)
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDashboardStore } from "@/lib/store";
import { TabsContent } from "@radix-ui/react-tabs";
import { MessageSquare, Search, Star } from "lucide-react";
import { toast } from "sonner";

export default function CustomerSection() {
  const { customers, customerFilters } = useDashboardStore();
  const setCustomerFilters = (filters: any) =>
    useDashboardStore.setState((state) => ({
      customerFilters: { ...state.customerFilters, ...filters },
    }));

  const filteredCustomers = customers.filter(
    (customer: any) =>
      customer.name
        .toLowerCase()
        .includes(customerFilters.search.toLowerCase()) ||
      customer.email
        .toLowerCase()
        .includes(customerFilters.search.toLowerCase())
  );

  const handleReviewAction = (reviewId: string, action: string) => {
    toast.success(`Review ${action} successfully!`);
  };

  return (
    <TabsContent value="customers" className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            className="pl-8"
            value={customerFilters.search}
            onChange={(e) => setCustomerFilters({ search: e.target.value })}
          />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
          <CardDescription>
            View and manage your customer relationships.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer: any) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={customer.avatar || "/placeholder.svg"}
                          alt={customer.name}
                        />
                        <AvatarFallback>
                          {customer.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {customer.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        customer.status === "vip" ? "default" : "secondary"
                      }
                    >
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{customer.orders}</TableCell>
                  <TableCell className="font-medium">
                    {customer.spent}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      {customer.rating}
                    </div>
                  </TableCell>
                  <TableCell>{customer.lastOrder}</TableCell>
                  <TableCell>
                    {customer.messages > 0 ? (
                      <Badge variant="destructive">{customer.messages}</Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          toast.success(
                            `Viewing ${customer.name}'s order history`
                          )
                        }
                      >
                        View Orders
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
