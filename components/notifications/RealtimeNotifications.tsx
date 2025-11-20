"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { useRealtime } from "@upstash/realtime/client";

import type {
  NewMessagePayload,
  NewNotificationPayload,
  NewOrderPayload,
  OrderStatusChangedPayload,
} from "@/lib/realtime";

export const RealtimeNotifications = () => {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();

  const handleMessageNotification = useCallback(
    (payload: NewMessagePayload) => {
      if (!payload || !payload.sender) return;

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

      const conversationId = payload.data?.conversationId as string | undefined;
      const sellerOrderId = payload.data?.sellerOrderId as string | undefined;

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

  const events = useMemo(
    () => ({
      message: {
        newMessage: handleMessageNotification,
      },
      order: {
        newOrder: handleNewOrderNotification,
        statusChanged: handleOrderStatusNotification,
      },
      notification: {
        newNotification: handleGeneralNotification,
      },
    }),
    [
      handleGeneralNotification,
      handleMessageNotification,
      handleNewOrderNotification,
      handleOrderStatusNotification,
    ]
  );

  (useRealtime as any)({
    channel: userId ? `user:${userId}` : undefined,
    events,
    disabled: !isLoaded || !userId,
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

