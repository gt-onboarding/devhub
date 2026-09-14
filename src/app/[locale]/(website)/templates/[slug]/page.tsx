import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { T } from "gt-next";
import { getGT, getLocale, getMessages } from "gt-next/server";

import { getDetailMarkdown } from "@/lib/agent-content-markdown";
import { readContentSections, readReplitPrompt } from "@/lib/content-markdown";
import { absoluteSiteUrl, getMetadata } from "@/lib/get-metadata";
import { resolveSiteUrl } from "@/lib/site-url";
import {
  getAllTemplateSlugs,
  getTemplateContent,
  getTemplateItem,
  type TemplateContentItem,
} from "@/lib/template-content";
import { BackLink } from "@/components/ui/back-link";
import { CodeBlockWrapper } from "@/components/content/code-block-wrapper";
import { Prose } from "@/components/content/prose";
import {
  HackathonTemplateFooter,
  HackathonTemplateIntro,
  TemplateDetailFooter,
  TemplateDetailIntro,
  TemplateDetailRail,
} from "@/components/templates/template-detail-sections";
import { getTemplateDetailView } from "@/components/templates/template-detail-view";

type TemplatePageParams = Promise<{ slug: string }>;
type ReplitPromptTier = "cookbooks" | "examples" | "recipes";

export const dynamicParams = false;

function getTemplateContentTier(item: TemplateContentItem): ReplitPromptTier {
  if (item.kind === "cookbook") {
    return "cookbooks";
  }

  if (item.kind === "example") {
    return "examples";
  }

  return "recipes";
}

export default async function TemplateDetailPage({
  params,
}: {
  params: TemplatePageParams;
}): Promise<ReactNode> {
  const { slug } = await params;
  const item = getTemplateItem(slug);
  if (!item) {
    notFound();
  }

  const locale = await getLocale();
  const content = await getTemplateContent(item, locale, {
    pre: CodeBlockWrapper,
  });
  if (!content) {
    notFound();
  }

  const gt = await getGT();
  const m = await getMessages();

  const tier = getTemplateContentTier(item);
  const rawMarkdown = getDetailMarkdown(
    "templates",
    slug,
    process.cwd(),
    resolveSiteUrl(),
  );
  const replitPrompt = readReplitPrompt(process.cwd(), tier, slug);
  const exampleSections =
    item.kind === "example"
      ? readContentSections(process.cwd(), "examples", slug)
      : undefined;
  const detail = getTemplateDetailView({
    body: content,
    exampleSections,
    item,
    rawMarkdown,
    replitPrompt,
  });
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: m(item.data.name),
    description: m(item.data.description),
    url: absoluteSiteUrl(`/templates/${item.data.id}`),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {detail.presentation === "hackathon" ? (
        <main className="bg-black text-white">
          <section className="pt-9 md:pt-12 xl:pt-17.5">
            <div className="mx-auto max-w-4xl px-5 md:px-8">
              <article>
                <BackLink href="/templates" aria-label={gt("All templates")}>
                  <T>All templates</T>
                </BackLink>

                <HackathonTemplateIntro
                  title={detail.title}
                  description={detail.description}
                  services={detail.services}
                  usage={detail.usage}
                />

                <div className="mt-10 md:mt-14">
                  <Prose className={detail.bodyClassName} variant="dark">
                    {detail.body}
                  </Prose>
                </div>
              </article>
            </div>
          </section>

          <HackathonTemplateFooter />
        </main>
      ) : (
        <main className="bg-black text-white">
          <section>
            <article className="mx-auto flex w-full max-w-304 flex-col gap-y-9 px-5 pt-12 pb-24 md:px-8 md:pt-13 lg:pb-32">
              <nav className="flex" aria-label={gt("Breadcrumb")}>
                <ol className="flex min-w-0 items-center" role="list">
                  <li className="flex items-center">
                    <BackLink
                      className="font-normal"
                      href="/templates"
                      aria-label={gt("All templates")}
                    >
                      <T>Back</T>
                    </BackLink>
                  </li>
                </ol>
              </nav>

              <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_21rem] xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-16">
                <div className="min-w-0">
                  <TemplateDetailIntro
                    title={detail.title}
                    description={detail.description}
                    heroMedia={detail.heroMedia}
                    usage={detail.usage}
                    afterHero={detail.afterHero}
                  />

                  <div className="recipe-content-card template-dark-prose mt-10 md:mt-12">
                    <Prose variant="dark">{detail.body}</Prose>
                  </div>

                  {detail.belowContent}
                </div>

                <div className="hidden lg:block">
                  <TemplateDetailRail usage={detail.usage} />
                </div>
              </div>
            </article>
          </section>

          <TemplateDetailFooter relatedItems={detail.relatedItems} />
        </main>
      )}
    </>
  );
}

export function generateStaticParams(): Array<{ slug: string }> {
  return getAllTemplateSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: TemplatePageParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getTemplateItem(slug);
  if (!item) {
    return {};
  }

  const m = await getMessages();

  return getMetadata({
    title: m(item.data.name),
    description: m(item.data.description),
    markdownPath: `/templates/${item.data.id}.md`,
    locale: await getLocale(),
    pathname: `/templates/${item.data.id}`,
    type: "article",
  });
}
