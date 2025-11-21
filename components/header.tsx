"use client";

import { Sidebar } from "@/components/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { useRealtime } from "@upstash/realtime/client";
import { Bell, Menu, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

type HeaderNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  type: "message" | "order" | "general";
  href?: string;
  isRead: boolean;
};

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user } = useUser();
  const router = useRouter();

  const [notifications, setNotifications] = useState<HeaderNotification[]>([]);

  const pushNotification = useCallback(
    (notification: Omit<HeaderNotification, "isRead">) => {
      setNotifications((prev) =>
        [{ ...notification, isRead: false }, ...prev].slice(0, 50)
      );
    },
    []
  );

  // Upstash Realtime – This now works perfectly with your backend
  useRealtime({
    channels: user ? [`user:${user.id}`] : [],
    event: "notification.newNotification",
    onData: (payload: any) => {
      console.log("New realtime notification:", payload);

      if (!payload?.id) return;

      // Optional: Auto-generate href based on type (fallback if backend doesn't send it)
      let href: string | undefined = payload.href;

      if (!href) {
        if (payload.type === "message" && payload.conversationId) {
          href = `/customers/messages?conversation=${payload.conversationId}`;
        } else if (payload.type === "order" && payload.sellerOrderId) {
          href = `/orders?sellerOrder=${payload.sellerOrderId}`;
        }
      }

      pushNotification({
        id: payload.id,
        title: payload.title || "New Notification",
        body: payload.body || "",
        createdAt: payload.createdAt || new Date().toISOString(),
        type: payload.type || "general",
        href,
      });
    },
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (href?: string) => {
    if (href) router.push(href);
  };

  if (!user) {
    return (
      <header className="flex h-14 items-center justify-between border-b bg-background px-4 lg:h-[60px] lg:px-6">
        <div>Loading...</div>
      </header>
    );
  }
  // console.log(`user:${user!.id}`);
  return (
    <header className="flex h-14 items-center gap-2 sm:gap-4 border-b bg-background px-2 sm:px-4 lg:h-[60px] lg:px-6">
      {/* Mobile menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden bg-transparent"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Search */}
      <div className="flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full bg-background pl-8 shadow-none text-sm md:w-2/3 lg:w-1/3"
            />
          </div>
        </form>
      </div>

      {/* Notifications Dropdown */}
      <DropdownMenu
        onOpenChange={(open) => {
          if (open) markAllAsRead();
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative h-8 w-8">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-96 max-h-96 overflow-y-auto"
        >
          <div className="flex items-center justify-between px-4 py-2">
            <DropdownMenuLabel className="text-base">
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </DropdownMenuLabel>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>
          <DropdownMenuSeparator />

          {notifications.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No new notifications
            </div>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className={`flex flex-col items-start gap-1 p-4 cursor-pointer ${
                  !n.isRead ? "bg-accent/50" : ""
                }`}
                onSelect={(e) => e.preventDefault()}
                onClick={() => handleNotificationClick(n.href)}
              >
                <div className="flex items-center gap-2 w-full justify-between">
                  <span className="font-medium text-sm">{n.title}</span>
                  {!n.isRead && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {n.body}
                </p>
                <time className="text-xs text-muted-foreground/70 mt-1">
                  {new Date(n.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Theme Toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="h-8 w-8 shrink-0"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full h-8 w-8 shrink-0"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.imageUrl} alt={user.fullName || "User"} />
              <AvatarFallback>
                {user.firstName?.[0] || "U"}
                {user.lastName?.[0] || ""}
              </AvatarFallback>
            </Avatar>
            <span className="sr-only">User menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Store Settings</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <SignOutButton>Logout</SignOutButton>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
