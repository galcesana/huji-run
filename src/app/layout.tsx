
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

import { Navigation } from "@/components/layout/Navigation";
import { getProfile } from "@/lib/supabase/data";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getProfile();
  const role = profile?.role || null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Navigation role={role} />
        {children}
      </body>
    </html>
  );
}
