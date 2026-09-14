import "@/css/custom.css";

import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { getLocaleDirection } from "generaltranslation";
import { getLocales, GTProvider } from "gt-next";
import { getLocale } from "gt-next/server";

import { resolveSiteUrl } from "@/lib/site-url";
import { ConsentTags } from "@/components/consent-tags";

export const metadata: Metadata = {
  metadataBase: new URL(resolveSiteUrl()),
  title: {
    default: "Databricks Developer",
    template: "%s | Databricks Developer",
  },
  description: "Build and deploy data apps and AI agents on Databricks.",
  verification: {
    google: "r9cgLLCpOwLqma0I_MXet4Ix8AK6v_UNHMe1CHsfNr8",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      {
        url: "/favicon/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/favicon/favicon-48x48.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        url: "/favicon/favicon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/favicon/favicon-256x256.png",
        sizes: "256x256",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#040406",
};

const renderVercelAnalytics = process.env.VERCEL === "1";

/** Prerender every page once per configured locale (gt.config.json). */
export function generateStaticParams(): Array<{ locale: string }> {
  return getLocales().map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      dir={getLocaleDirection(locale)}
      suppressHydrationWarning
      className="dark"
    >
      <body>
        <GTProvider>
          <ConsentTags />
          {renderVercelAnalytics ? <Analytics /> : null}
          {children}
        </GTProvider>
      </body>
    </html>
  );
}
