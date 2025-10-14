// components/customers/ClientCustomersPage.tsx (Client Component)
"use client";

import { GET_CONVERSATIONS } from "@/client/conversatation/conversatation.query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboardStore } from "@/lib/store";
import { Conversation } from "@/types/customer/customer.types";
import { useLazyQuery, useQuery } from "@apollo/client";
import { useAuth } from "@clerk/nextjs";
import { Download, Filter } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import AnalyticsCards from "./AnalyticsCards";
import CustomerSection from "./CustomerSection";
import DisputesSection from "./DisputesSection";
import MessagesSection from "./MessagesSection";
import ReviewsSection from "./ReviewsSection";

interface ClientCustomersPageProps {
  initialConversations: any[];
  initialStaticData: {
    customers: any[];
    reviews: any[];
    disputes: any[];
  };
  recieverId: string;
}

export default function ClientCustomersPage({
  initialConversations,
  initialStaticData,
  recieverId,
}: ClientCustomersPageProps) {
  const { isLoaded } = useAuth();

  console.log("initialConversations-->", initialConversations);

  const [refetchConversations] = useLazyQuery(GET_CONVERSATIONS, {
    variables: { recieverId },
  });

  const {
    data: conversationsData,
    loading: convLoading,
    error: convError,
  } = useQuery(GET_CONVERSATIONS, {
    variables: { recieverId },
    skip: !isLoaded || !recieverId,
  });

  useEffect(() => {
    if (convError) {
      toast.error(convError.message);
    }
  }, [convError]);

  // Refetch on window focus
  useEffect(() => {
    const handleFocus = () => refetchConversations();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refetchConversations]);

  const conversations: Conversation[] = conversationsData?.conversations || [];

  const unreadCount = conversations.reduce(
    (sum: number, c: any) => sum + (c.unreadCount || 0),
    0
  );
  const { reviews, disputes } = useDashboardStore();
  const pendingReviews = reviews.filter((r: any) => r.status === "pending");
  const openDisputes = disputes.filter((d: any) => d.status === "open");

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Customer Hub</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Exporting customer data...")}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      <AnalyticsCards conversations={conversations} disputes={disputes} />

      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customers">
            All Customers ({initialStaticData.customers.length})
          </TabsTrigger>
          <TabsTrigger value="messages">
            Messages ({unreadCount})
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reviews">
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
          <TabsTrigger value="disputes">
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

        <CustomerSection />
        <MessagesSection
          conversations={conversations}
          convLoading={convLoading}
          recieverId={recieverId}
        />
        <ReviewsSection />
        <DisputesSection />
      </Tabs>
    </div>
  );
}
