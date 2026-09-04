import type { Role } from "@prisma/client";
import type { Metadata } from "next";
import "./globals.css";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "CSM Niangon",
  description:
    "La plateforme média officielle du CSM Niangon. Découvrez les actualités et informations du CSM Niangon.",
};

import { getActiveAnnouncements } from "@/app/actions/announcements";
import { getInfoBarItems } from "@/app/actions/infobar";
import { AnalyticsGate } from "@/components/analytics/analytics-gate";
import { AnnouncementPopup } from "@/components/announcements/announcement-popup";
import { CookieConsentBanner } from "@/components/cookies/cookie-consent-banner";
import { SiteFooter } from "@/components/footer/site-footer";
import { InfoBar } from "@/components/info-bar/info-bar";
import { BottomNav } from "@/components/nav/bottom-nav";
import { TopNav } from "@/components/nav/top-nav";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole: Role | undefined;
  let userProfile = null;

  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        role: true,
        nom: true,
        prenom: true,
        username: true,
        avatar: true,
        email: true,
      },
    });
    userRole = dbUser?.role;
    if (dbUser) {
      userProfile = {
        nom: dbUser.nom,
        prenom: dbUser.prenom,
        username: dbUser.username,
        avatar: dbUser.avatar,
        email: dbUser.email,
      };
    }
  }

  const [infoBarItems, announcements] = await Promise.all([
    getInfoBarItems(),
    getActiveAnnouncements(),
  ]);

  return (
    <html lang="fr">
      <head>
        <meta name="apple-mobile-web-app-title" content="CSM Niangon" />
      </head>
      <body
        className={`${inter.variable} ${plusJakartaSans.variable} antialiased`}
      >
        <AnalyticsGate />
        <InfoBar items={infoBarItems} />
        <TopNav user={user} userRole={userRole} userProfile={userProfile} />
        {children}
        <SiteFooter userRole={userRole} />
        <BottomNav userRole={userRole} />
        <AnnouncementPopup announcements={announcements} />
        <CookieConsentBanner />
      </body>
    </html>
  );
}
