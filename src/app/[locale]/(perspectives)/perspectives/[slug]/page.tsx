import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { T } from "gt-next";
import { getGT, getLocale } from "gt-next/server";

import { renderMarkdownContent } from "@/lib/content-markdown-renderer";
import { getMetadata } from "@/lib/get-metadata";
import {
  getPerspectiveEntries,
  getPerspectiveEntry,
} from "@/lib/perspectives/perspective-entries";
import { buildSeoDescription } from "@/lib/seo-description";
import { BackLink } from "@/components/ui/back-link";
import { Prose } from "@/components/content/prose";

type PerspectivePageParams = Promise<{ slug: string }>;

export const dynamicParams = false;

export default async function PerspectiveDetailPage({
  params,
}: {
  params: PerspectivePageParams;
}): Promise<ReactNode> {
  const { slug } = await params;
  const entry = getPerspectiveEntry(slug);
  if (!entry) {
    notFound();
  }
  const gt = await getGT();
  const body = await renderMarkdownContent({
    headingDepthOffset: 1,
    showHeadingAnchors: false,
    source: entry.body,
    variant: "prose",
  });

  return (
    <article className="mx-auto w-full max-w-4xl px-5 py-12 md:px-8 md:py-15">
      <BackLink
        className="text-grey-50"
        href="/perspectives"
        aria-label={gt("All perspectives")}
      >
        <T>Back</T>
      </BackLink>

      <header className="mt-6 max-w-3xl">
        <h1 className="mt-5 text-3xl leading-tight font-medium tracking-tight text-pretty md:text-4xl md:leading-tight">
          {entry.question}
        </h1>
      </header>

      <div className="border-grey-30 mt-10 border-t pt-10">
        <Prose variant="dark">{body}</Prose>
      </div>
    </article>
  );
}

export function generateStaticParams(): Array<{ slug: string }> {
  return getPerspectiveEntries().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: PerspectivePageParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getPerspectiveEntry(slug);
  if (!entry) {
    return {};
  }

  return getMetadata({
    title: entry.question,
    description: buildSeoDescription(entry.body),
    pathname: `/perspectives/${entry.slug}`,
    type: "article",
    locale: await getLocale(),
  });
}
