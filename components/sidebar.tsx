"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import siteLogo from "@/public/final_blue_logo_500by500.svg";
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  Home,
  Package,
  Settings,
  ShoppingCart,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import { useNotificationStore } from "@/store/notificationStore";
import { useQuery } from "@apollo/client";
import { GET_CONVERSATIONS } from "@/client/conversatation/conversatation.query";
import { useSession } from "@/lib/auth-client";
const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Products",
    href: "/products",
    icon: Package,
    children: [
      { title: "All Products", href: "/products" },
      { title: "Add Product", href: "/products/add" },
      // { title: "Categories", href: "/products/categories" },
      { title: "Inventory", href: "/products/inventory" },
    ],
  },
  {
    title: "Orders",
    href: "/orders",
    icon: ShoppingCart,
    children: [
      { title: "All Orders", href: "/orders" },
      { title: "Returns & Disputes", href: "/orders/disputes" },
    ],
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
    children: [
      { title: "All Customers", href: "/customers" },
      { title: "Messages", href: "/customers/messages" },
      // { title: "Reviews", href: "/customers/reviews" },
      // { title: "Disputes", href: "/customers/disputes" },
    ],
  },
  // {
  //   title: "Marketing",
  //   href: "/marketing",
  //   icon: TrendingUp,
  //   children: [
  //     { title: "Campaigns", href: "/marketing/campaigns" },
  //     { title: "Discounts", href: "/marketing/discounts" },
  //     { title: "Promotions", href: "/marketing/promotions" },
  //     { title: "Ads", href: "/marketing/ads" },
  //   ],
  // },
  // {
  //   title: "Finances",
  //   href: "/finances",
  //   icon: CreditCard,
  // },
  // {
  //   title: "Reports",
  //   href: "/reports",
  //   icon: FileText,
  // },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { hasNewOrderUpdate } = useNotificationStore();
  const { data: session } = useSession();
  const user = session?.user;

  const { data: conversationsData } = useQuery(GET_CONVERSATIONS, {
    variables: { recieverId: user?.id || "" },
    skip: !user,
    fetchPolicy: "cache-and-network",
  });

  const totalUnreadMessages = useMemo(() => {
    return conversationsData?.conversations?.reduce(
      (acc: number, conv: any) => acc + (conv.unreadCount || 0),
      0
    ) || 0;
  }, [conversationsData]);

  const expandedItemsInitial = useMemo(() => {
    // Expand if active sub-item
    return sidebarNavItems
      .filter(item => item.children?.some(child => pathname === child.href))
      .map(item => item.title);
  }, [pathname]);

  const [expandedItems, setExpandedItems] = useState<string[]>(expandedItemsInitial);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const isExpanded = (title: string) => expandedItems.includes(title);

  return (
    <div className="pb-12 w-full md:w-64 bg-card border-r h-full">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center mb-2">
            {/* <Store className="h-5 w-5 sm:h-6 sm:w-6 mr-2" /> */}
            <Image src={siteLogo} alt="site logo" width={32} height={32} className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
            <h2 className="text-base sm:text-lg font-semibold">
              Vanijoy Seller
            </h2>
          </div>
        </div>
        <div className="px-3">
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-1">
              {sidebarNavItems.map((item, index) => (
                <div key={index}>
                  {item.children ? (
                    <div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm p-2"
                        onClick={() => toggleExpanded(item.title)}
                      >
                        <item.icon className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">{item.title}</span>
                        {(item.title === "Orders" && hasNewOrderUpdate) || (item.title === "Customers" && totalUnreadMessages > 0) ? (
                          <span className="ml-2 w-2 h-2 bg-red-600 rounded-full shrink-0" />
                        ) : null}
                        {isExpanded(item.title) ? (
                          <ChevronDown className="ml-auto h-4 w-4 shrink-0" />
                        ) : (
                          <ChevronRight className="ml-auto h-4 w-4 shrink-0" />
                        )}
                      </Button>
                      {isExpanded(item.title) && (
                        <div className="ml-6 mt-1 space-y-1">
                          {item.children.map((child, childIndex) => (
                            <Button
                              key={childIndex}
                              asChild
                              variant={
                                pathname === child.href ? "secondary" : "ghost"
                              }
                              size="sm"
                              className="w-full justify-start text-xs p-2"
                            >
                              <Link href={child.href} className="flex items-center justify-between w-full">
                                <span className="truncate">{child.title}</span>
                                {child.title === "All Orders" && hasNewOrderUpdate && (
                                  <span className="w-2 h-2 bg-red-600 rounded-full shrink-0 ml-2" />
                                )}
                                {child.title === "Messages" && totalUnreadMessages > 0 && (
                                  <span className="w-2 h-2 bg-red-600 rounded-full shrink-0 ml-2" />
                                )}
                              </Link>
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Button
                      asChild
                      variant={pathname === item.href ? "secondary" : "ghost"}
                      className="w-full justify-start text-sm p-2"
                    >
                      <Link href={item.href}>
                        <item.icon className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
