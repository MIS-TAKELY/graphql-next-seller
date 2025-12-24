import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { RealtimeNotifications } from "@/components/notifications/RealtimeNotifications";
import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Seller Dashboard - E-commerce Platform",
  description: "Comprehensive seller dashboard for managing your online store",
  generator: "v0.dev",
};

import { MobileNav } from "@/components/layout/MobileNav";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex h-screen overflow-hidden">
            {/* Desktop sidebar */}
            <div className="hidden md:flex">
              <Sidebar />
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-2 sm:p-4 md:p-6 lg:p-8 pb-20 md:pb-6 lg:pb-8">
                {children}
              </main>
            </div>
          </div>
          <MobileNav />
          <RealtimeNotifications />
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
