// components/customers/CustomerSection.tsx (Client Component)
"use client";

import { memo, useCallback, useState, useMemo } from "react";
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
import { MessageSquare, Search, Star, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { PaginatedVirtualTable } from "@/components/ui/virtualized-table";
import { Skeleton } from "@/components/ui/skeleton";

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
  /** Show loading skeleton rows */
  isLoading?: boolean;
  /** Enable virtualization for large lists (default: true if > 50 items) */
  enableVirtualization?: boolean;
}

function CustomerSectionComponent({ customers, isLoading, enableVirtualization }: CustomerSectionProps) {
  const [localSearch, setLocalSearch] = useState("");

  // Enable virtualization automatically for large lists (> 50 items)
  const shouldVirtualize = useMemo(() => {
    if (enableVirtualization !== undefined) return enableVirtualization;
    return (customers?.length || 0) > 50;
  }, [customers?.length, enableVirtualization]);

  // Search handler with local state for instant feedback
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setLocalSearch("");
  }, []);

  // Memoized filtered customers
  const filteredCustomers = useMemo(() => {
    if (!localSearch) return customers;
    const searchLower = localSearch.toLowerCase();
    return customers.filter(
      (customer) =>
        `${customer.firstName || ""} ${customer.lastName || ""}`
          .toLowerCase()
          .includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower)
    );
  }, [customers, localSearch]);

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

  // Memoized row renderer for virtualization
  const renderCustomerRow = useCallback((customer: Customer) => (
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
  ), []);

  // Loading skeleton rows
  const loadingRows = useMemo(() => (
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={i}>
        <TableCell>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        </TableCell>
        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-5 w-12" /></TableCell>
        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-8 w-20" /></TableCell>
      </TableRow>
    ))
  ), []);

  // Empty state
  const emptyComponent = useMemo(() => (
    <TableRow>
      <TableCell colSpan={7} className="text-center py-8 h-[70px]">
        <p className="text-muted-foreground">
          {localSearch ? "No customers found" : "No customers yet"}
        </p>
      </TableCell>
    </TableRow>
  ), [localSearch]);

  // Search input component (reused)
  const searchInput = (
    <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search customers..."
        className="pl-8 pr-8 transition-all duration-300"
        value={localSearch}
        onChange={handleSearchChange}
        disabled={isLoading}
      />
      {localSearch && (
        <button
          onClick={handleClearSearch}
          className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  // Table header
  const tableHeader = (
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
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-3 sm:space-y-4 md:space-y-6 transition-all duration-300 ease-in-out">
        <div className="flex items-center space-x-2">
          {searchInput}
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
              <Table>
                {tableHeader}
                <TableBody>
                  {loadingRows}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Virtualized table for large lists
  if (shouldVirtualize && filteredCustomers.length > 0) {
    return (
      <div className="space-y-3 sm:space-y-4 md:space-y-6 transition-all duration-300 ease-in-out">
        <div className="flex items-center space-x-2">
          {searchInput}
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
            <Table>
              {tableHeader}
            </Table>
            <PaginatedVirtualTable
              data={filteredCustomers}
              renderRow={renderCustomerRow}
              estimateSize={70}
              overscan={5}
              containerClassName="max-h-[600px]"
              emptyComponent={
                <Table>
                  <TableBody>{emptyComponent}</TableBody>
                </Table>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Regular table for small lists
  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 transition-all duration-300 ease-in-out">
      <div className="flex items-center space-x-2">
        {searchInput}
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
            <Table>
              {tableHeader}
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  emptyComponent
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

export const CustomerSection = memo(CustomerSectionComponent);
export default CustomerSection;
