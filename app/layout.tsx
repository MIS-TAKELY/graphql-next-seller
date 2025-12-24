import ApolloWrapper from "@/lib/apollo/apollo-provider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vanijay Seller Center - Grow Your Business",
  description:
    "Manage your products, orders, and analytics on Vanijay. Join thousands of sellers growing their business with our powerful e-commerce tools.",
  metadataBase: new URL("https://seller.vanijay.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Vanijay Seller Center - Grow Your Business",
    description:
      "Manage your products, orders, and analytics on Vanijay. Join thousands of sellers growing their business with our powerful e-commerce tools.",
    siteName: "Vanijay Seller Center",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vanijay Seller Center",
    description: "Manage your products, orders, and analytics on Vanijay.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ApolloWrapper>{children}</ApolloWrapper>
          <Toaster position="bottom-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
