// components/customers/CustomerSection.tsx (Client Component)
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { MessageSquare, Search, Star } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import Link from "next/link";

interface Customer {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string | null;
  createdAt: string;
  rating: number;
}

interface CustomerSectionProps {
  customers: Customer[];
}

export default function CustomerSection({ customers }: CustomerSectionProps) {
  const [search, setSearch] = useState("");

  const filteredCustomers = useMemo(() => {
    if (!search) return customers;
    const searchLower = search.toLowerCase();
    return customers.filter(
      (customer) =>
        `${customer.firstName || ""} ${customer.lastName || ""}`
          .toLowerCase()
          .includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower)
    );
  }, [customers, search]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `रू ${amount.toLocaleString()}`;
  };

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    return (first + last).toUpperCase() || "?";
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 transition-all duration-300 ease-in-out">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            className="pl-8 transition-all duration-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <Card className="transition-all duration-300 ease-in-out hover:shadow-md">
        <CardHeader className="pb-3 sm:pb-4 transition-all duration-300">
          <CardTitle className="text-base sm:text-lg md:text-xl transition-all duration-300">
            Customer Management
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm transition-all duration-300">
            View and manage your customer relationships.
          </CardDescription>
        </CardHeader>
        <CardContent className="transition-all duration-300">
          <div className="overflow-x-auto transition-all duration-300">
            <Table className="transition-all duration-300">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px] text-xs sm:text-sm">Customer</TableHead>
                  <TableHead className="text-xs sm:text-sm">Orders</TableHead>
                  <TableHead className="text-xs sm:text-sm">Total Spent</TableHead>
                  <TableHead className="text-xs sm:text-sm">Avg Order</TableHead>
                  <TableHead className="text-xs sm:text-sm">Rating</TableHead>
                  <TableHead className="hidden md:table-cell text-xs sm:text-sm">Last Order</TableHead>
                  <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-muted-foreground">
                        {search ? "No customers found" : "No customers yet"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="transition-all duration-300">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 transition-all duration-300">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer.email}`}
                              alt={`${customer.firstName} ${customer.lastName}`}
                            />
                            <AvatarFallback className="text-xs sm:text-sm">
                              {getInitials(customer.firstName, customer.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-medium text-xs sm:text-sm truncate">
                              {customer.firstName || customer.lastName
                                ? `${customer.firstName || ""} ${customer.lastName || ""}`.trim()
                                : "Unknown"}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {customer.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {customer.totalOrders}
                      </TableCell>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        {formatCurrency(customer.totalSpent)}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {formatCurrency(customer.averageOrderValue)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-xs sm:text-sm">
                            {customer.rating > 0 ? customer.rating.toFixed(1) : "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs sm:text-sm">
                        {formatDate(customer.lastOrderDate)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <Button variant="ghost" size="sm" asChild className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                            <Link href={`/customers/messages?customerId=${customer.id}`}>
                              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              toast.success(`Viewing ${customer.firstName || customer.email}'s order history`)
                            }
                            className="text-xs sm:text-sm"
                          >
                            <span className="hidden sm:inline">View Orders</span>
                            <span className="sm:hidden">Orders</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
