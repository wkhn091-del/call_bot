import type { Metadata, Viewport } from "next";
import { Heebo, IBM_Plex_Sans } from "next/font/google";
import { headers } from "next/headers";
import { AnalyticsEvents } from "@/components/layout/AnalyticsEvents";
import { ConsentAndAnalytics } from "@/components/layout/ConsentAndAnalytics";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { RevealObserver } from "@/components/motion/RevealObserver";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { site } from "@/content/site";
import { publicEnv } from "@/lib/env/public";
import "./globals.css";

const heebo = Heebo({
  weight: ["400", "500", "700", "800"],
  subsets: ["hebrew", "latin"],
  display: "swap",
  variable: "--font-heebo",
});

const plex = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-latin-face",
});

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_SITE_URL),
  title: {
    default: "CALLBOT | בוט קולי שעונה לשיחות של העסק כשאתם לא זמינים",
    template: "%s | CALLBOT",
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "he_IL",
    siteName: site.brand,
    url: publicEnv.NEXT_PUBLIC_SITE_URL,
    title: "CALLBOT | כל שיחה שלא נענית היא עסקה אבודה",
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "CALLBOT | כל שיחה שלא נענית היא עסקה אבודה",
    description: site.description,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0c0c16",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const nonce = (await headers()).get("x-nonce") ?? "";

  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${plex.variable}`}>
      <body className="grain bg-night-950 font-sans text-body text-mist-100">
        <MotionProvider nonce={nonce}>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </MotionProvider>
        <RevealObserver />
        <SmoothScroll />
        <AnalyticsEvents />
        <ConsentAndAnalytics gtmId={publicEnv.NEXT_PUBLIC_GTM_ID ?? null} nonce={nonce} />
      </body>
    </html>
  );
}
