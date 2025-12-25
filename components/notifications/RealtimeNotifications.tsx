"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { useRealtime } from "@upstash/realtime/client";
import { useNotificationStore } from "@/store/notificationStore";
import { useApolloClient } from "@apollo/client";
import { GET_CONVERSATIONS } from "@/client/conversatation/conversatation.query";

import type {
  NewMessagePayload,
  NewNotificationPayload,
  NewOrderPayload,
  OrderStatusChangedPayload,
} from "@/lib/realtime";

export const RealtimeNotifications = () => {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;
  const isLoaded = !isPending;
  const { setHasNewOrderUpdate } = useNotificationStore();
  const client = useApolloClient();

  const handleMessageNotification = useCallback(
    (payload: NewMessagePayload) => {
      if (!payload || !payload.sender) return;

      const sentAt = new Date(payload.sentAt || (payload as any).createdAt || Date.now());
      const now = Date.now();

      // Only show toast for messages sent in the last 60 seconds to avoid spam on reload
      const diff = now - sentAt.getTime();
      if (isNaN(diff) || diff > 60000) {
        console.log("[Seller RealtimeNotifications] Skipping toast for old/invalid message:", payload.id, "diff:", diff);
        return;
      }

      toast.info(`${payload.sender.firstName ?? "A customer"} sent a message`, {
        description:
          payload.content?.slice(0, 80) ?? "Tap to view the conversation",
        action: {
          label: "Open chat",
          onClick: () => router.push("/customers/messages"),
        },
      });
    },
    [router]
  );

  const handleNewOrderNotification = useCallback(
    (payload: NewOrderPayload) => {
      if (!payload) return;
      const formattedTotal =
        typeof payload.total === "number"
          ? payload.total.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
          : null;
      toast.success("New order received", {
        description:
          payload.summary ??
          (formattedTotal ? `Order total ${formattedTotal}` : "View the order details"),
        action: {
          label: "View orders",
          onClick: () => router.push("/orders"),
        },
      });
    },
    [router]
  );

  const handleOrderStatusNotification = useCallback(
    (payload: OrderStatusChangedPayload) => {
      if (!payload) return;

      const title =
        payload.status === "SHIPPED" || payload.status === "DELIVERED"
          ? "Order update"
          : "Order status changed";

      toast(messageForStatus(payload.status), {
        description: `Order ${payload.sellerOrderId} is now ${payload.status}`,
        action: {
          label: "Manage",
          onClick: () => router.push("/orders"),
        },
      });
    },
    [router]
  );

  const handleGeneralNotification = useCallback(
    (payload: NewNotificationPayload) => {
      if (!payload) return;
      if (payload.type === "NEW_MESSAGE" || payload.type === "NEW_ORDER") {
        // Dedicated handlers already surface these as richer toasts.
        return;
      }

      const conversationId = (payload as any).data?.conversationId as string | undefined;
      const sellerOrderId = (payload as any).data?.sellerOrderId as string | undefined;

      let action:
        | {
          label: string;
          onClick: () => void;
        }
        | undefined;

      if (conversationId) {
        action = {
          label: "Open chat",
          onClick: () => router.push(`/customers/messages?conversation=${conversationId}`),
        };
      } else if (sellerOrderId) {
        action = {
          label: "View order",
          onClick: () => router.push(`/orders?sellerOrder=${sellerOrderId}`),
        };
      }

      toast(payload.title, {
        description: payload.body,
        action,
      });
    },
    [router]
  );

  // Memoize channels to prevent re-subscriptions
  const realtimeChannels = useMemo(
    () => ((isLoaded && userId) ? [`user:${userId}`] : []),
    [isLoaded, userId]
  );

  // Memoize callbacks to prevent re-subscriptions
  const handleRealtimeNewNotification = useCallback(
    (payload: any) => {
      if (payload.type === "message") {
        client.refetchQueries({ include: [GET_CONVERSATIONS] });
        handleMessageNotification(payload);
      } else if (payload.type === "order") {
        setHasNewOrderUpdate(true);
        handleNewOrderNotification(payload);
      } else {
        handleGeneralNotification(payload);
      }
    },
    [client, handleGeneralNotification, handleMessageNotification, handleNewOrderNotification, setHasNewOrderUpdate]
  );

  const handleRealtimeNewMessage = useCallback(
    (payload: any) => {
      console.log("[Seller RealtimeNotifications] 📨 New message event:", payload);
      client.refetchQueries({ include: [GET_CONVERSATIONS] });
      handleMessageNotification(payload);
    },
    [client, handleMessageNotification]
  );

  const handleRealtimeOrderUpdated = useCallback(
    (payload: any) => {
      console.log("[Seller RealtimeNotifications] 📦 Order update event:", payload);
      setHasNewOrderUpdate(true);
      if (payload.status) {
        handleOrderStatusNotification(payload);
      } else {
        toast.info("Order Updated", {
          description: `An update was received for order #${payload.orderNumber || payload.id || ""}`,
          action: {
            label: "View Orders",
            onClick: () => router.push("/orders"),
          },
        });
      }
    },
    [handleOrderStatusNotification, router, setHasNewOrderUpdate]
  );

  // Subscribe to notification events
  useRealtime({
    channels: realtimeChannels,
    event: "notification.newNotification",
    onData: handleRealtimeNewNotification,
  });

  // Subscribe to message events
  useRealtime({
    channels: realtimeChannels,
    event: "message.newMessage",
    onData: handleRealtimeNewMessage,
  });

  // Subscribe to order events
  useRealtime({
    channels: realtimeChannels,
    event: "order.orderUpdated",
    onData: handleRealtimeOrderUpdated,
  });

  return null;
};

const messageForStatus = (status: OrderStatusChangedPayload["status"]) => {
  switch (status) {
    case "SHIPPED":
      return "Order shipped";
    case "DELIVERED":
      return "Order delivered";
    case "CANCELLED":
      return "Order cancelled";
    case "PROCESSING":
      return "Order processing";
    case "CONFIRMED":
      return "Order confirmed";
    case "RETURNED":
      return "Order returned";
    default:
      return "Order status updated";
  }
};

