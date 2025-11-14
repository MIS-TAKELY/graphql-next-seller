// components/customers/ClientCustomersPage.tsx (Client Component)
"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboardStore } from "@/lib/store";
import { Download, Filter } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import AnalyticsCards from "./AnalyticsCards";
import CustomerSection from "./CustomerSection";
import DisputesSection from "./DisputesSection";
import ReviewsSection from "./ReviewsSection";

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

interface CustomerStats {
  totalCustomers: number;
  totalRevenue: number;
  averageRating: number;
  activeCustomers: number;
}

interface ClientCustomersPageProps {
  customers: Customer[];
  stats?: CustomerStats;
  onRefetch?: () => void;
}

export default function ClientCustomersPage({
  customers,
  stats,
  onRefetch,
}: ClientCustomersPageProps) {
  const { reviews, disputes } = useDashboardStore();
  const pendingReviews = reviews.filter((r: any) => r.status === "pending");
  const openDisputes = disputes.filter((d: any) => d.status === "open");

  const handleExport = () => {
    toast.success("Exporting customer data...");
  };

  const handleFilterClick = () => {
    toast.info("Filter options coming soon");
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 transition-all duration-300 ease-in-out">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight transition-all duration-300">
          Customers
        </h2>
        <div className="flex items-center gap-2 transition-all duration-300">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="text-xs sm:text-sm transition-all duration-300"
          >
            <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Export</span>
            <span className="sm:hidden">Exp</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFilterClick}
            className="text-xs sm:text-sm bg-transparent transition-all duration-300"
          >
            <Filter className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Filter</span>
            <span className="sm:hidden">Filt</span>
          </Button>
        </div>
      </div>

      {stats && (
        <AnalyticsCards
          totalCustomers={stats.totalCustomers}
          totalRevenue={stats.totalRevenue}
          averageRating={stats.averageRating}
          activeCustomers={stats.activeCustomers}
          disputes={disputes}
        />
      )}

      <Tabs defaultValue="customers" className="space-y-3 sm:space-y-4 md:space-y-6 transition-all duration-300 ease-in-out">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2 text-xs sm:text-sm transition-all duration-300">
          <TabsTrigger
            value="customers"
            className="px-2 sm:px-3 transition-all duration-300"
          >
            All Customers ({customers.length})
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="px-2 sm:px-3 transition-all duration-300"
          >
            Reviews ({pendingReviews.length})
            {pendingReviews.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
              >
                {pendingReviews.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="disputes"
            className="px-2 sm:px-3 transition-all duration-300"
          >
            Disputes ({openDisputes.length})
            {openDisputes.length > 0 && (
              <Badge
                variant="destructive"
                className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
              >
                {openDisputes.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="customers"
          className="space-y-3 sm:space-y-4 md:space-y-6 transition-all duration-300 ease-in-out"
        >
          <CustomerSection customers={customers} />
        </TabsContent>
        <TabsContent
          value="reviews"
          className="space-y-3 sm:space-y-4 md:space-y-6 transition-all duration-300 ease-in-out"
        >
          <ReviewsSection />
        </TabsContent>
        <TabsContent
          value="disputes"
          className="space-y-3 sm:space-y-4 md:space-y-6 transition-all duration-300 ease-in-out"
        >
          <DisputesSection />
        </TabsContent>
      </Tabs>
    </>
  );
}
