// components/customers/AnalyticsCards.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Star, TrendingUp, Users } from "lucide-react";
import React from "react";

interface AnalyticsCardsProps {
  totalCustomers: number;
  totalRevenue: number;
  averageRating: number;
  activeCustomers: number;
  disputes: any[];
}

const AnalyticsCards: React.FC<AnalyticsCardsProps> = ({
  totalCustomers,
  totalRevenue,
  averageRating,
  activeCustomers,
  disputes,
}) => {
  const openDisputes = disputes.filter((d: any) => d.status === "open").length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="grid gap-3 sm:gap-4 md:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-300 ease-in-out">
      <Card className="transition-all duration-300 ease-in-out hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 transition-all duration-300">
          <CardTitle className="text-xs sm:text-sm font-medium transition-all duration-300">
            Total Customers
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground transition-all duration-300" />
        </CardHeader>
        <CardContent className="transition-all duration-300">
          <div className="text-lg sm:text-xl md:text-2xl font-bold transition-all duration-300">
            {totalCustomers.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground transition-all duration-300">
            {activeCustomers} active customers
          </p>
        </CardContent>
      </Card>
      <Card className="transition-all duration-300 ease-in-out hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 transition-all duration-300">
          <CardTitle className="text-xs sm:text-sm font-medium transition-all duration-300">
            Average Rating
          </CardTitle>
          <Star className="h-4 w-4 text-muted-foreground transition-all duration-300" />
        </CardHeader>
        <CardContent className="transition-all duration-300">
          <div className="text-lg sm:text-xl md:text-2xl font-bold transition-all duration-300">
            {averageRating > 0 ? averageRating.toFixed(1) : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground transition-all duration-300">
            Customer satisfaction
          </p>
        </CardContent>
      </Card>
      <Card className="transition-all duration-300 ease-in-out hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 transition-all duration-300">
          <CardTitle className="text-xs sm:text-sm font-medium transition-all duration-300">
            Total Revenue
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground transition-all duration-300" />
        </CardHeader>
        <CardContent className="transition-all duration-300">
          <div className="text-lg sm:text-xl md:text-2xl font-bold transition-all duration-300">
            {formatCurrency(totalRevenue)}
          </div>
          <p className="text-xs text-muted-foreground transition-all duration-300">
            From all customers
          </p>
        </CardContent>
      </Card>
      <Card className="transition-all duration-300 ease-in-out hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 transition-all duration-300">
          <CardTitle className="text-xs sm:text-sm font-medium transition-all duration-300">
            Active Issues
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground transition-all duration-300" />
        </CardHeader>
        <CardContent className="transition-all duration-300">
          <div className="text-lg sm:text-xl md:text-2xl font-bold transition-all duration-300">
            {openDisputes}
          </div>
          <p className="text-xs text-muted-foreground transition-all duration-300">
            Require attention
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsCards;
