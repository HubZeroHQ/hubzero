import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

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
 * Display serif (ARCHITECTURE/15_HOMEPAGE_DESIGN.md §1) — one weight, both
 * cuts. Used sparingly at named moments only (hero headline, case-study pull
 * line), never as a default heading treatment — see that doc for the rule.
 */
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
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
    images: [{ url: brandAssets.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [brandAssets.ogImage],
  },
  icons: {
    icon: brandAssets.favicon,
    apple: brandAssets.appleTouchIcon,
  },
  manifest: brandAssets.manifest,
};

export default function RootLayout({ children }: Readonly<WithChildren>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
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
