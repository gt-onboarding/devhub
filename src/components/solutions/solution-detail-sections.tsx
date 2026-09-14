import type { ReactNode } from "react";
import Link from "next/link";
import { T, useGT, useLocale, useMessages } from "gt-next";

import type { SolutionAuthor } from "@/lib/solutions/authors";
import {
  buildSolutionItems,
  getSolutionItemHref,
  isLinkedSolutionItem,
  type NativeSolutionItem,
  type SolutionItem,
} from "@/lib/solutions/solutions";
import { AnimatedArrowLink } from "@/components/ui/animated-arrow-link";
import { Button } from "@/components/ui/button";
import { AIExportMenu } from "@/components/ai-export-menu";
import { RuntimeTableOfContents } from "@/components/content/runtime-table-of-contents";
import { SolutionByline } from "@/components/solutions/solution-byline";
import {
  formatSolutionDate,
  SolutionItemLink,
  SolutionItemVisual,
} from "@/components/solutions/solution-item-shared";

export function SolutionDetailCtaActions(): ReactNode {
  return (
    <div className="flex w-full flex-col gap-x-5 gap-y-3 sm:w-auto sm:flex-row sm:items-center lg:justify-end">
      <Button
        className="h-10 rounded-none pr-6 pl-7 font-mono text-base leading-none font-medium tracking-tight uppercase shadow-none lg:h-11"
        asChild
        size="xl"
        variant="orange"
      >
        <Link
          className="text-black no-underline hover:no-underline"
          href="/templates"
        >
          <T>Explore templates</T>
        </Link>
      </Button>
      <Button
        className="h-10 rounded-none bg-white pr-6 pl-7 font-mono text-base leading-none font-medium tracking-tight text-black uppercase shadow-none hover:bg-white/90 lg:h-11"
        asChild
      >
        <Link
          className="no-underline hover:no-underline"
          href="/docs/start-here"
        >
          <T>Read docs</T>
        </Link>
      </Button>
    </div>
  );
}

export function SolutionDetailHeader({
  authors,
  item,
  rawMarkdownUrl,
}: {
  authors: SolutionAuthor[];
  item: NativeSolutionItem;
  rawMarkdownUrl: string;
}): ReactNode {
  const gt = useGT();
  const m = useMessages();
  const locale = useLocale();
  const title = m(item.title);
  const description = m(item.description);

  return (
    <header className="max-w-208">
      <div className="flex items-center gap-2">
        <span className="bg-orange size-2" aria-hidden="true" />
        <time
          className="text-grey-50 font-mono text-base leading-none font-medium uppercase"
          dateTime={item.publishedAt}
        >
          [{formatSolutionDate(item.publishedAt, locale)}]
        </time>
      </div>

      <h1 className="m-0 mt-6 text-[2rem]/[1.125] font-normal tracking-[-0.04em] wrap-break-word text-white md:text-[2.5rem]/[1.125] lg:text-5xl/[1.125] xl:text-[3.5rem]/[1.125]">
        {title}
      </h1>
      <p className="text-grey-90 m-0 mt-2.5 max-w-208 text-lg leading-snug tracking-[-0.04em] md:mt-3 md:text-xl lg:mt-3.5 xl:mt-4">
        {description}
      </p>

      <div className="border-grey-30 mt-4 flex flex-row items-center justify-between gap-5 border-t pt-3.5 md:mt-4.5 md:pt-4 lg:mt-5 lg:pt-4.5 xl:mt-6 xl:pt-5">
        <SolutionByline
          authors={authors}
          publishedAt={item.publishedAt}
          compact
        />
        <AIExportMenu
          appearance="article"
          kind="solution"
          mobileLabel={gt("COPY", {
            $context: "Button that copies the article as markdown",
          })}
          contentClassName="w-62.25 min-w-62.25"
          rawMarkdownUrl={rawMarkdownUrl}
          title={title}
          description={description}
          permalink={`/solutions/${item.id}`}
        />
      </div>
    </header>
  );
}

export function SolutionDetailHeroMedia({
  item,
}: {
  item: NativeSolutionItem;
}): ReactNode {
  return (
    <div className="bg-grey-20 relative aspect-416/238 w-full overflow-hidden md:aspect-[832/476]">
      <SolutionItemVisual
        item={item}
        variant="featured"
        width={832}
        height={476}
      />
    </div>
  );
}

export function SolutionDetailTableOfContents({
  contentId,
}: {
  contentId: string;
}): ReactNode {
  const gt = useGT();

  return (
    <aside className="sticky top-16 -mt-8 -mb-10 hidden max-h-[calc(100svh-4rem)] w-55 min-w-0 shrink-0 self-start overflow-x-hidden overflow-y-auto pt-8 pb-10 lg:block xl:hidden min-[90rem]:block">
      <p className="text-grey-50 m-0 font-mono text-xs leading-none font-medium uppercase">
        <T>On this page</T>
      </p>
      <RuntimeTableOfContents
        ariaLabel={gt("Solution sections")}
        className="mt-6 [&_a]:max-w-full [&_a]:py-0 [&_a]:text-sm/snug [&_a]:wrap-break-word [&_ul]:gap-y-3.5"
        contentId={contentId}
      />
    </aside>
  );
}

export function SolutionReadMore({
  currentItem,
}: {
  currentItem: SolutionItem;
}): ReactNode {
  const gt = useGT();
  const m = useMessages();
  const locale = useLocale();
  const items = buildSolutionItems()
    .filter((item) => item.id !== currentItem.id)
    .slice(0, 3);

  if (items.length === 0) return null;

  return (
    <section className="px-5 pt-16 pb-24 font-sans text-black md:px-8 md:pt-18 lg:px-0 lg:pt-22 lg:pb-60">
      <div className="mx-auto w-full max-w-208">
        <h2 className="m-0 text-[1.75rem]/[1.125] font-normal tracking-[-0.09rem] wrap-break-word text-black md:text-[2rem]/[1.125] lg:text-4xl/[1.125]">
          <T>Read more</T>
        </h2>
        <div className="mt-10.5 flex flex-col gap-10.5">
          {items.map((item) => (
            <article
              key={item.id}
              className="grid gap-6 md:min-h-50.5 md:grid-cols-[minmax(0,24.0625rem)_minmax(0,1fr)] md:gap-6.5"
            >
              <SolutionItemLink
                className="group focus-visible:ring-db-cyan focus-visible:ring-offset-db-oat-light block self-end no-underline outline-none focus-visible:ring-2 focus-visible:ring-offset-4"
                item={item}
                ariaLabel={gt("Read {title}", { title: m(item.title) })}
              >
                <div className="border-db-navy bg-db-oat-medium relative aspect-385/202 overflow-hidden border md:aspect-auto md:h-50.5">
                  <SolutionItemVisual
                    item={item}
                    variant="card"
                    width={383}
                    height={200}
                  />
                </div>
              </SolutionItemLink>
              <div className="flex min-w-0 flex-col justify-between gap-2 md:h-50.5">
                <div className="min-w-0">
                  <time
                    className="text-grey-40 block font-mono text-sm/none font-medium tracking-normal uppercase"
                    dateTime={item.publishedAt}
                  >
                    [
                    {formatSolutionDate(item.publishedAt, locale).toUpperCase()}
                    ]
                  </time>
                  <h3 className="m-0 mt-4 text-lg/tight font-medium tracking-[-0.0375rem] wrap-break-word text-black md:text-xl/tight lg:text-2xl/tight">
                    <SolutionItemLink
                      className="focus-visible:outline-db-cyan line-clamp-1 text-black no-underline transition-colors outline-none hover:text-black/70 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-4"
                      item={item}
                    >
                      {m(item.title)}
                    </SolutionItemLink>
                  </h3>
                  <p className="text-grey-50 m-0 mt-2.5 line-clamp-3 text-base font-normal tracking-[-0.025rem]">
                    {m(item.description)}
                  </p>
                </div>
                <AnimatedArrowLink
                  href={getSolutionItemHref(item)}
                  target={isLinkedSolutionItem(item) ? "_blank" : undefined}
                  rel={
                    isLinkedSolutionItem(item)
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="border-orange text-orange hover:border-primary hover:text-primary focus-visible:outline-db-cyan flex items-center justify-between border-b-2 pb-2.5 text-lg/snug font-normal tracking-[-0.06rem] no-underline transition-colors outline-none hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-4 md:text-xl/snug lg:text-2xl/snug"
                  ariaLabel={gt("Learn more about {title}", {
                    title: m(item.title),
                  })}
                  size="size-4.5 md:size-5 lg:size-6"
                >
                  <T>Learn more</T>
                </AnimatedArrowLink>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
