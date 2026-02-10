import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Vanguard",
  description: "The Protocol",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vanguard",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

import { MorningDossier } from "@/components/briefing/MorningDossier";
import { generateDailyBriefing } from "@/actions/briefing";
import { createClient } from "@/utils/supabase/server";

import { AppShell } from "@/components/layout/AppShell";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let briefingData = null;
  if (user) {
      try {
        const briefing = await generateDailyBriefing();
        if (!briefing.viewed) {
             briefingData = briefing;
        }
      } catch (e) {
        console.error("Failed to generate briefing:", e);
      }
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-foreground`}
      >
        <AppShell>
            {children}
        </AppShell>
        {briefingData && <MorningDossier data={briefingData} />}
        <Toaster richColors position="top-center" theme="dark" />
      </body>
    </html>
  );
}
