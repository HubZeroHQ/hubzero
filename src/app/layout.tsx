import type { Metadata } from "next";
import { Archivo, IBM_Plex_Serif, JetBrains_Mono } from "next/font/google";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { brandAssets } from "@/config/brand";
import { siteConfig } from "@/config/site";
import type { WithChildren } from "@/types";

import "./globals.css";

/**
 * Typography, per `DESIGN/NEXT/CREATIVE_DIRECTION.md` §3.3 — two families,
 * no serif, on any page built under that direction. Archivo was chosen
 * specifically because it isn't Geist (this project's own retired system,
 * and an increasingly generic "safe default" across the developer-tool
 * category) and isn't IBM Plex (same reason, one step removed) — it has
 * real presence at large display sizes, which the homepage hero and
 * section openers need.
 */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

/**
 * System label / metadata typeface (§3.3) — IDs, dates, code, small labels
 * only, never body copy or headlines. JetBrains Mono, not Geist Mono: a
 * different family from the retired system, genuinely technical rather
 * than decoratively "coder."
 */
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

/**
 * Kept loaded, not removed, even though no page built under
 * `CREATIVE_DIRECTION.md` §3.3 uses a serif — implementation is happening
 * page by page (only the homepage has been rebuilt so far), and Services,
 * Work, Labs, Blueprints, and About still render real `font-serif` content
 * under the old system. Dropping this token would have silently degraded
 * every one of those unmigrated pages to a generic system serif fallback
 * instead of erroring — a real, live regression on pages nobody asked to
 * touch yet. Remove this once every remaining page has its own redesign
 * pass and the last `font-serif` call site is gone (grep-verify first).
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
      className={`${archivo.variable} ${jetbrainsMono.variable} ${ibmPlexSerif.variable}`}
    >
      <head>
        <meta name="apple-mobile-web-app-title" content="Hub Zero" />
      </head>
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
