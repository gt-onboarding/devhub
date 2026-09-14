import type { ReactNode } from "react";
import type { Metadata } from "next";
import { getGT, getLocale } from "gt-next/server";

import { getReplitTemplateIds } from "@/lib/content-markdown";
import { absoluteSiteUrl, getMetadata } from "@/lib/get-metadata";
import { buildTemplateItems } from "@/lib/templates/template-items";
import Footer from "@/components/footer";
import CTA from "@/components/home/cta";
import { Hero } from "@/components/templates/hero";
import { TemplateItemsSection } from "@/components/templates/template-items-section";

const pageUrl = absoluteSiteUrl("/templates");

export async function generateMetadata(): Promise<Metadata> {
  const gt = await getGT();

  return getMetadata({
    title: gt("Templates"),
    description: gt("Templates to jumpstart your next Databricks app"),
    markdownPath: "/templates.md",
    locale: await getLocale(),
    pathname: "/templates",
  });
}

function getIncludeDrafts(): boolean {
  return process.env.NEXT_PUBLIC_SHOW_DRAFTS === "true";
}

export default async function TemplatesPage(): Promise<ReactNode> {
  const gt = await getGT();
  const templateItems = buildTemplateItems(getIncludeDrafts());
  const replitTemplateIds = getReplitTemplateIds();

  return (
    <main className="bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: gt("Databricks Templates"),
            description: gt("Templates to jumpstart your next Databricks app."),
            url: pageUrl,
          }).replace(/</g, "\\u003c"),
        }}
      />
      <Hero />
      <div className="bg-[#f9f7f4] text-black">
        <div className="bg-orange h-12" aria-hidden="true" />
        <TemplateItemsSection
          items={templateItems}
          replitTemplateIds={replitTemplateIds}
        />
        <CTA className="mx-auto mt-24 max-w-432 pt-1.5 pb-16 md:mt-36 lg:mt-44 lg:pb-22 xl:mt-60" />
        <Footer className="mx-auto max-w-432 border-t border-white/10 lg:px-8" />
      </div>
    </main>
  );
}
