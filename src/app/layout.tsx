import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Inter, League_Spartan } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "CSM Niangon",
  description:
    "La plateforme média officielle du CSM Niangon. Découvrez les actualités et informations du CSM Niangon.",
};

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { BottomNav } from "@/components/nav/bottom-nav";
import { TopNav } from "@/components/nav/top-nav";
import { InfoBar } from "@/components/info-bar/info-bar";
import { AnnouncementPopup } from "@/components/announcements/announcement-popup";
import { getInfoBarItems } from "@/app/actions/infobar";
import { getActiveAnnouncements } from "@/app/actions/announcements";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole = undefined;

  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    userRole = dbUser?.role;
  }

  const [infoBarItems, announcements] = await Promise.all([
    getInfoBarItems(),
    getActiveAnnouncements(),
  ]);

  return (
    <html lang="fr">
      <head>
        <meta name="apple-mobile-web-app-title" content="CSM Niangon TV" />
      </head>
      <body
        className={`${inter.variable} ${leagueSpartan.variable} antialiased`}
      >
        <InfoBar items={infoBarItems} />
        <TopNav user={user} />
        {children}
        <BottomNav userRole={userRole} />
        <AnnouncementPopup announcements={announcements} />
        <Analytics />
      </body>
    </html>
  );
}