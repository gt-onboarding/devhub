import type { ReactNode } from "react";
import type { Metadata } from "next";
import { getGT, getLocale } from "gt-next/server";

import { absoluteSiteUrl, getMetadata } from "@/lib/get-metadata";
import Footer from "@/components/footer";
import CTA from "@/components/home/cta";
import Features from "@/components/home/features";
import Hero from "@/components/home/hero";
import LovedByDevelopers from "@/components/home/loved-by-developers";
import Templates from "@/components/home/templates";

export async function generateMetadata(): Promise<Metadata> {
  const gt = await getGT();
  return getMetadata({
    title: gt("Databricks Developer"),
    titleMode: "absolute",
    description: gt("Build and deploy data apps and AI agents on Databricks."),
    pathname: "/",
    locale: await getLocale(),
  });
}

export default async function HomePage(): Promise<ReactNode> {
  const gt = await getGT();
  const siteUrl = absoluteSiteUrl("/");
  const siteName = gt("Databricks Developer");
  const siteDescription = gt(
    "Build and deploy data apps and AI agents on Databricks.",
  );

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Databricks",
            url: siteUrl,
            logo: absoluteSiteUrl("/img/databricks-logo.svg"),
            sameAs: ["https://www.linkedin.com/company/databricks"],
          }).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: siteName,
            url: siteUrl,
          }).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: siteName,
            description: siteDescription,
            url: siteUrl,
          }).replace(/</g, "\\u003c"),
        }}
      />
      <Hero />
      <Templates />
      <Features />
      <div className="bg-linear-to-b from-[#1A2E2F] from-65% to-[#2A4647]">
        <LovedByDevelopers />
        <CTA
          className="mx-auto mt-18 max-w-432 pt-1.5 pb-16 md:mt-24 lg:mt-32 lg:pb-22 xl:mt-38"
          description={gt(
            "Start from Databricks templates, connect your data, and deploy with the tools your team already uses.",
          )}
          actions={null}
        />
        <Footer className="mx-auto max-w-432 border-t border-white/10 lg:px-8" />
      </div>
    </main>
  );
}
