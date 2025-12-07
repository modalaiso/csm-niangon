import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next"
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CSM Niangon TV",
  description: "La plateforme média officielle du CSM Niangon. Découvrez les actualités et informations du CSM Niangon.",
};

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { BottomNav } from "@/components/nav/bottom-nav";
import { TopNav } from "@/components/nav/top-nav";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userRole = undefined;

  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    userRole = dbUser?.role;
  }

  return (
    <html lang="fr">
      <head>
        <meta name="apple-mobile-web-app-title" content="CSM Niangon TV" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TopNav user={user} />
        {children}
        <BottomNav userRole={userRole} />
        <Analytics />
      </body>
    </html>
  );
}
