
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#fc4c02",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "HUJI Run",
  description: "Official team app for HUJI Run club",
  manifest: "/manifest.json",
  appleWebApp: {
    title: "HUJI Run",
    statusBarStyle: "default",
    capable: true,
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo-removebg.png"
  }
};

import { Suspense } from "react";
import { ServerNavigation } from "@/components/layout/ServerNavigation";
import { NavigationSkeleton } from "@/components/layout/NavigationSkeleton";

import { ScrollToTop } from "@/components/layout/ScrollToTop";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ScrollToTop />
        <Suspense fallback={<NavigationSkeleton />}>
          <ServerNavigation />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
