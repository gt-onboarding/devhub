import { createElement, type ComponentType, type ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGT, getLocale, getMessages } from "gt-next/server";

import { absoluteSiteUrl, getMetadata } from "@/lib/get-metadata";
import { getSolutionAuthor } from "@/lib/solutions/authors";
import {
  nativeSolutionItems,
  type NativeSolutionItem,
} from "@/lib/solutions/solutions";
import { BackLink } from "@/components/ui/back-link";
import { BrandStrip } from "@/components/ui/brand-strip";
import { Prose } from "@/components/content/prose";
import Footer from "@/components/footer";
import CTA from "@/components/home/cta";
import {
  SolutionDetailCtaActions,
  SolutionDetailHeader,
  SolutionDetailHeroMedia,
  SolutionDetailTableOfContents,
  SolutionReadMore,
} from "@/components/solutions/solution-detail-sections";

type SolutionPageParams = Promise<{ slug: string }>;
type SolutionContentModule = {
  default: ComponentType;
};

const defaultSocialImagePath = "/img/databricks-social-card.jpg";
const solutionContentId = "solution-detail-content";

export const dynamicParams = false;

async function getSolutionContent(
  item: NativeSolutionItem,
): Promise<ReactNode | null> {
  try {
    const module = (await import(
      `@/content/solutions/${item.id}/goal.md`
    )) as SolutionContentModule;
    return createElement(module.default);
  } catch {
    return null;
  }
}

function getNativeSolution(slug: string): NativeSolutionItem | undefined {
  return nativeSolutionItems.find((item) => item.id === slug);
}

export default async function SolutionDetailPage({
  params,
}: {
  params: SolutionPageParams;
}): Promise<ReactNode> {
  const { slug } = await params;
  const item = getNativeSolution(slug);
  if (!item) {
    notFound();
  }

  const content = await getSolutionContent(item);
  if (!content) {
    notFound();
  }

  const gt = await getGT();
  const m = await getMessages();

  const imageUrl = absoluteSiteUrl(item.previewImage ?? defaultSocialImagePath);
  const authors = item.authors.map(getSolutionAuthor);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: m(item.title),
    description: m(item.description),
    url: absoluteSiteUrl(`/solutions/${item.id}`),
    image: imageUrl,
    datePublished: item.publishedAt,
    author: authors.map((author) => ({
      "@type": "Person",
      name: author.name,
      jobTitle: m(author.role),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="bg-black text-white">
        <article className="w-full px-5 pt-9 pb-24 md:px-8 md:pt-12 lg:pb-44 xl:px-0 xl:pt-19.5">
          <div className="mr-auto ml-auto flex w-full max-w-208 flex-col gap-y-8 lg:max-w-none xl:max-w-208 min-[90rem]:ml-[calc((100%-52rem)/2+0.25rem)] min-[90rem]:max-w-279">
            <BackLink
              className="text-grey-50 self-start leading-none"
              href="/solutions"
              aria-label={gt("All solutions")}
            >
              {gt("Back")}
            </BackLink>

            <div className="flex flex-col gap-14 lg:flex-row lg:gap-8 xl:flex-col xl:gap-14 min-[90rem]:flex-row min-[90rem]:gap-16">
              <div className="min-w-0 lg:flex-1 xl:flex-none min-[90rem]:flex-1">
                <SolutionDetailHeader
                  item={item}
                  authors={authors}
                  rawMarkdownUrl={`/solutions/${item.id}.md`}
                />

                <div className="mt-5">
                  <SolutionDetailHeroMedia item={item} />

                  <div
                    className="recipe-content-card template-dark-prose mt-12"
                    id={solutionContentId}
                  >
                    <Prose className="solution-detail-prose" variant="dark">
                      {content}
                    </Prose>
                  </div>
                </div>
              </div>

              <SolutionDetailTableOfContents contentId={solutionContentId} />
            </div>
          </div>
        </article>

        <BrandStrip />
        <div className="bg-[#F9F7F4]">
          <SolutionReadMore currentItem={item} />
          <div className="mx-auto max-w-432 bg-black">
            <CTA
              actions={<SolutionDetailCtaActions />}
              className="mx-auto max-w-432 border-x border-white/10 pt-1.5 pb-18 lg:pb-24"
            />
            <Footer className="mx-auto max-w-432 border-x border-t border-white/10 lg:px-8" />
          </div>
        </div>
      </main>
    </>
  );
}

export function generateStaticParams(): Array<{ slug: string }> {
  return nativeSolutionItems.map((item) => ({ slug: item.id }));
}

export async function generateMetadata({
  params,
}: {
  params: SolutionPageParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getNativeSolution(slug);
  if (!item) {
    return {};
  }

  const m = await getMessages();

  return getMetadata({
    title: m(item.title),
    description: m(item.description),
    imagePath: item.previewImage,
    markdownPath: `/solutions/${item.id}.md`,
    locale: await getLocale(),
    pathname: `/solutions/${item.id}`,
    type: "article",
  });
}
