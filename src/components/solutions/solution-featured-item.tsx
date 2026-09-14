import type { ReactNode } from "react";
import { T, useGT, useLocale, useMessages } from "gt-next";

import {
  getSolutionItemHref,
  isLinkedSolutionItem,
  type SolutionItem,
} from "@/lib/solutions/solutions";
import { AnimatedArrowLink } from "@/components/ui/animated-arrow-link";
import {
  formatSolutionDate,
  SolutionItemLink,
  SolutionItemVisual,
} from "@/components/solutions/solution-item-shared";

export function SolutionFeaturedItem({
  item,
}: {
  item: SolutionItem;
}): ReactNode {
  const gt = useGT();
  const m = useMessages();
  const locale = useLocale();
  const title = m(item.title);

  return (
    <article className="feature-post grid gap-0 lg:grid-cols-[2fr_3fr] lg:gap-10.75 xl:grid-cols-[30rem_minmax(0,1fr)]">
      <div className="relative flex min-h-82 flex-col md:min-h-92 lg:min-h-0 lg:overflow-hidden lg:[contain:size] xl:overflow-visible xl:[contain:none] 2xl:h-132.75">
        <div className="border-grey-20 border-t pt-4.75 lg:shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-orange size-1.5" aria-hidden="true" />
            <span className="text-grey-40 font-mono text-base leading-none font-medium uppercase">
              <T>[Featured]</T>
            </span>
          </div>
          <time
            className="text-grey-60 mt-3.5 block font-mono text-base leading-none font-medium uppercase"
            dateTime={item.publishedAt}
          >
            {formatSolutionDate(item.publishedAt, locale)}
          </time>
        </div>

        <div className="mt-14 lg:mt-4 lg:min-h-0 lg:overflow-hidden xl:mt-14 xl:overflow-visible 2xl:absolute 2xl:top-55.25 2xl:mt-0">
          <h2 className="m-0 max-w-120 text-[1.75rem] leading-[1.125] font-normal tracking-[-0.04em] md:text-[2rem] lg:text-4xl/[1.125] xl:text-[2.5rem]">
            <SolutionItemLink
              className="focus-visible:outline-db-cyan line-clamp-2 text-white no-underline transition-colors outline-none hover:text-white/80 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-4"
              item={item}
            >
              {title}
            </SolutionItemLink>
          </h2>
          <p className="text-grey-60 m-0 mt-3 line-clamp-3 max-w-md text-base leading-6 tracking-[-0.04em] md:mt-3.5 lg:mt-4 lg:line-clamp-2 xl:mt-4.5 xl:line-clamp-3">
            {m(item.description)}
          </p>
        </div>

        <AnimatedArrowLink
          href={getSolutionItemHref(item)}
          target={isLinkedSolutionItem(item) ? "_blank" : undefined}
          rel={isLinkedSolutionItem(item) ? "noopener noreferrer" : undefined}
          className="border-orange text-orange hover:text-db-lava-light focus-visible:outline-db-cyan mt-8 flex w-full items-center justify-between border-b-3 pb-2.5 text-xl leading-snug font-normal tracking-[-0.04em] no-underline transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 md:mt-9 md:text-2xl lg:mt-auto lg:shrink-0 lg:text-[1.75rem] xl:mt-12 xl:text-[2rem] 2xl:absolute 2xl:bottom-0 2xl:left-0 2xl:mt-0"
          size="size-5 md:size-6 lg:size-7 xl:size-8"
        >
          <T context="Link that opens the featured solution post">Read</T>
        </AnimatedArrowLink>
      </div>

      <SolutionItemLink
        className="group focus-visible:ring-db-cyan block self-start no-underline outline-none focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-offset-black"
        item={item}
        ariaLabel={gt("Read {title}", { title })}
      >
        <div className="bg-grey-20 relative aspect-1013/532 overflow-hidden">
          <SolutionItemVisual
            item={item}
            variant="featured"
            width={1013}
            height={532}
          />
        </div>
      </SolutionItemLink>
    </article>
  );
}
