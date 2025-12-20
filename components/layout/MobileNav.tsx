"use client";

import { Home, Package, ShoppingCart, BarChart3, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
    {
        title: "Dashboard",
        href: "/",
        icon: Home,
    },
    {
        title: "Products",
        href: "/products",
        icon: Package,
    },
    {
        title: "Orders",
        href: "/orders",
        icon: ShoppingCart,
    },
    {
        title: "Analytics",
        href: "/analytics",
        icon: BarChart3,
    },
    {
        title: "Settings",
        href: "/settings",
        icon: Settings,
    },
];

export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background/80 backdrop-blur-md md:hidden">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 px-2 py-1 transition-colors",
                            isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                        )}
                        aria-label={item.title}
                    >
                        <item.icon className={cn("h-5 w-5", isActive && "animate-in zoom-in-75 duration-300")} />
                        <span className="text-[10px] font-medium leading-none">{item.title}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
