// components/header/NotificationBell.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RealtimeEvents } from "@/lib/realtime";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRealtime } from "@upstash/realtime/client";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";

type Notification = {
  id: string;
  title: string;
  body: string;
  type: string;
  data?: Record<string, any>;
  createdAt: string;
  isRead: boolean;
};

const fetchNotifications = async (userId: string): Promise<Notification[]> => {
  const res = await fetch(`/api/notifications?userId=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

const markAsRead = async (ids: string[]) => {
  await fetch("/api/notifications/read", {
    method: "POST",
    body: JSON.stringify({ ids }),
    headers: { "Content-Type": "application/json" },
  });
};

export function NotificationBell() {
  const { userId, isSignedIn } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], refetch } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => (userId ? fetchNotifications(userId) : []),
    enabled: !!userId,
    refetchInterval: 30_000, // optional polling fallback
  });

  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    },
  });

  // Real-time listener
  const handleNewNotification = (
    payload: RealtimeEvents["notification"]["newNotification"]
  ) => {
    queryClient.setQueryData(
      ["notifications", userId],
      (old: Notification[] = []) => [
        {
          id: payload.id,
          title: payload.title,
          body: payload.body,
          type: payload.type,
          data: payload.data || undefined,
          createdAt: payload.createdAt,
          isRead: false,
        },
        ...old,
      ]
    );
  };

  useRealtime<RealtimeEvents>({
    channel: userId ? `user:${userId}` : undefined,
    events: {
      notification: {
        newNotification: handleNewNotification,
      },
    },
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleOpen = () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
    if (unreadIds.length > 0) {
      markAsReadMutation.mutate(unreadIds);
    }
  };

  if (!isSignedIn) return null;

  return (
    <DropdownMenu onOpenChange={(open) => open && handleOpen()}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 max-h-96 overflow-y-auto"
      >
        <DropdownMenuLabel>
          Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <DropdownMenuItem className="text-center text-muted-foreground">
            No notifications
          </DropdownMenuItem>
        ) : (
          notifications.slice(0, 20).map((notif) => (
            <DropdownMenuItem
              key={notif.id}
              className="flex flex-col items-start gap-1 py-3 cursor-pointer"
              onClick={() => {
                if (notif.type === "NEW_ORDER" && notif.data?.orderId) {
                  window.location.href = `/seller/orders/${notif.data.orderId}`;
                } else if (
                  notif.type === "NEW_MESSAGE" &&
                  notif.data?.conversationId
                ) {
                  window.location.href = `/seller/messages?conversation=${notif.data.conversationId}`;
                }
              }}
            >
              <div className="flex items-center gap-2 w-full">
                <div className="font-medium text-sm">{notif.title}</div>
                {!notif.isRead && (
                  <div className="h-2 w-2 bg-blue-500 rounded-full ml-auto" />
                )}
              </div>
              <div className="text-xs text-muted-foreground">{notif.body}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(notif.createdAt), {
                  addSuffix: true,
                })}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
