import type { ReactNode } from "react";
import type { Metadata } from "next";
import { useGT } from "gt-next";
import { getGT, getLocale } from "gt-next/server";

import { absoluteSiteUrl, getMetadata } from "@/lib/get-metadata";
import { SOLUTION_RSS_PATH } from "@/lib/solutions/rss-feed";
import {
  buildSolutionItems,
  getFeaturedSolutionItem,
  getSolutionCategories,
  getSolutionListItems,
} from "@/lib/solutions/solutions";
import Footer from "@/components/footer";
import CTA from "@/components/home/cta";
import { SolutionFeaturedItem } from "@/components/solutions/solution-featured-item";
import { SolutionHero } from "@/components/solutions/solution-hero";
import { SolutionItemsSection } from "@/components/solutions/solution-items-section";

export async function generateMetadata(): Promise<Metadata> {
  const gt = await getGT();

  return getMetadata({
    title: gt("Solutions"),
    description: gt("Developer-first perspectives on building on Databricks."),
    markdownPath: "/solutions.md",
    locale: await getLocale(),
    pathname: "/solutions",
    rssPath: "/solutions/rss.xml",
  });
}

function getIncludeDrafts(): boolean {
  return process.env.NEXT_PUBLIC_SHOW_DRAFTS === "true";
}

export default function SolutionsPage(): ReactNode {
  const gt = useGT();
  const allItems = buildSolutionItems(getIncludeDrafts());
  const featuredItem = getFeaturedSolutionItem(allItems);
  const listItems = getSolutionListItems(allItems);
  const categories = getSolutionCategories(allItems);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Databricks Developer Solutions",
            url: absoluteSiteUrl("/solutions"),
            description: gt(
              "Developer-first perspectives on building on Databricks.",
            ),
          }).replace(/</g, "\\u003c"),
        }}
      />
      <main className="border-t border-white/10 bg-black text-white">
        <div className="mx-auto max-w-160 px-5 py-16 md:max-w-3xl md:px-8 md:pt-20 md:pb-24 lg:max-w-5xl lg:pt-24 xl:max-w-7xl xl:px-4 xl:pt-28 2xl:max-w-392">
          <SolutionHero />
          {featuredItem ? <SolutionFeaturedItem item={featuredItem} /> : null}
          <SolutionItemsSection
            categories={categories}
            items={listItems}
            rssHref={SOLUTION_RSS_PATH}
            searchItems={allItems}
          />
        </div>
        <div className="solution-cta-footer border-grey-20 mx-auto mt-18 max-w-432 border-x bg-black md:mt-24 lg:mt-32 xl:mt-37">
          <CTA
            className="pt-0 pb-16 lg:pb-22"
            theme="outline"
            description={gt(
              "Start from Databricks templates, connect your data, and deploy with the tools your team already uses.",
            )}
            actions={null}
          />
          <Footer className="border-t border-white/10 bg-black lg:px-8" />
        </div>
      </main>
    </>
  );
}
