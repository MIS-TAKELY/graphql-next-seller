// components/customers/AnalyticsCards.tsx (Client or Server; no hooks needed)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStore } from "@/lib/store";
import { Conversation } from "@/types/customer/customer.types";
import { AlertTriangle, Star, TrendingUp, Users } from "lucide-react";
import React from "react";

interface AnalyticsCardsProps {
  conversations: Conversation[];
  disputes: any[];
}

const AnalyticsCards: React.FC<AnalyticsCardsProps> = ({
  conversations,
  disputes,
}) => {
  const { customers } = useDashboardStore();

  const totalCustomers = customers.length;
  const vipCustomers = customers.filter((c: any) => c.status === "vip").length;
  const activeCustomers = customers.filter(
    (c: any) => c.status === "active"
  ).length;
  const avgRating =
    customers.reduce((sum: number, c: any) => sum + c.rating, 0) /
    (customers.length || 1);
  const totalSpent = customers.reduce(
    (sum: number, c: any) =>
      sum + Number.parseFloat(c.spent.replace("$", "").replace(",", "")),
    0
  );
  const unreadCount = conversations.reduce(
    (sum: number, c: any) => sum + (c.unreadCount || 0),
    0
  );
  const openDisputes = disputes.filter((d: any) => d.status === "open").length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCustomers}</div>
          <p className="text-xs text-muted-foreground">
            {vipCustomers} VIP customers
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">Customer satisfaction</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${totalSpent.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">From all customers</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{unreadCount + openDisputes}</div>
          <p className="text-xs text-muted-foreground">Require attention</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsCards;
