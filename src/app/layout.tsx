import type { Metadata } from "next";
import { Geist, Geist_Mono, IBM_Plex_Serif } from "next/font/google";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { brandAssets } from "@/config/brand";
import { siteConfig } from "@/config/site";
import type { WithChildren } from "@/types";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Display serif (DESIGN/V3/03_TYPOGRAPHY.md §3, §6) — retired Instrument
 * Serif in favor of IBM Plex Serif: a family with real engineering-
 * organization pedigree, meaningfully less trend-saturated in the specific
 * "editorial AI-assisted design" genre Instrument Serif had become a
 * default signal for. Used upright by default (Text/Regular for pull
 * quotes, Medium for firmer emphasis) — italic is loaded as a secondary
 * emphasis available *within* a Plex Serif moment, not the default
 * posture the way Instrument Serif's italic-by-default was. Still a rare,
 * named slow-down device only (at most one moment per page, two on the
 * homepage) — never a default heading treatment.
 */
const ibmPlexSerif = IBM_Plex_Serif({
  variable: "--font-plex-serif",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    images: [
      {
        url: "/images/og/hubzero-og.png",
        width: 1200,
        height: 630,
        alt: "HubZero",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: ["/images/og/hubzero-og.png"],
  },
  icons: {
    icon: brandAssets.favicon,
    apple: brandAssets.appleTouchIcon,
  },
  manifest: brandAssets.manifest,

  appleWebApp: {
    title: "Hub Zero",
  },
};

export default function RootLayout({ children }: Readonly<WithChildren>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${ibmPlexSerif.variable}`}
    >
      {/*
        Font variables live on <html>, not <body>: Tailwind's --font-sans/
        --font-serif/--font-mono tokens (globals.css @theme) are defined on
        :root, and custom properties only inherit downward, so a descendant
        (body) can never supply a value :root itself can see. Putting the
        variable classes on body silently broke every font-* utility
        site-wide (they fell back to system fonts) until this was caught
        during Phase 3 visual QA on the homepage hero.
      */}
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
