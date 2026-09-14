import type { ReactNode } from "react";
import { T, useGT, useLocale, useMessages } from "gt-next";

import {
  isDatabricksSolutionItem,
  type SolutionItem,
} from "@/lib/solutions/solutions";
import {
  formatSolutionDate,
  SolutionArrowIcon,
  SolutionItemLink,
  SolutionItemVisual,
} from "@/components/solutions/solution-item-shared";

function SolutionDatabricksBadge(): ReactNode {
  return (
    <span className="text-orange inline-flex shrink-0 items-center gap-2 font-mono text-base leading-snug font-normal tracking-normal">
      <span>
        <T>Databricks Blog</T>
      </span>
      <span
        className="relative size-3.5 shrink-0 overflow-visible"
        aria-hidden="true"
      >
        <span className="absolute top-[-0.081875rem] left-[-0.101875rem] flex h-[1.0745625rem] w-[1.0745625rem] items-center justify-center">
          <SolutionArrowIcon className="h-[0.9521875rem] w-[0.5675rem] rotate-45" />
        </span>
      </span>
    </span>
  );
}

function SolutionCardMeta({ item }: { item: SolutionItem }): ReactNode {
  const locale = useLocale();

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <time
        className="text-grey-60 shrink-0 font-mono text-base leading-none font-medium uppercase"
        dateTime={item.publishedAt}
      >
        {formatSolutionDate(item.publishedAt, locale)}
      </time>
      {isDatabricksSolutionItem(item) ? <SolutionDatabricksBadge /> : null}
    </div>
  );
}

function SolutionCardVisualLink({
  item,
  preloadVisual = false,
}: {
  item: SolutionItem;
  preloadVisual?: boolean;
}): ReactNode {
  const gt = useGT();
  const m = useMessages();

  return (
    <SolutionItemLink
      className="group focus-visible:ring-db-cyan block no-underline outline-none focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-offset-black"
      item={item}
      ariaLabel={gt("Read {title}", { title: m(item.title) })}
    >
      <div className="bg-grey-20 relative aspect-490/257 overflow-hidden">
        <SolutionItemVisual
          item={item}
          variant="card"
          width={490}
          height={257}
          preload={preloadVisual}
          loading="eager"
        />
      </div>
    </SolutionItemLink>
  );
}

function SolutionCardBody({ item }: { item: SolutionItem }): ReactNode {
  const m = useMessages();

  return (
    <div className="w-full max-w-105 pt-3">
      <SolutionCardMeta item={item} />
      <h2 className="m-0 mt-5 text-lg leading-tight font-normal tracking-[-0.04em] md:text-xl xl:text-2xl">
        <SolutionItemLink
          className="focus-visible:outline-db-cyan line-clamp-2 text-white no-underline transition-colors outline-none hover:text-white/80 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-4"
          item={item}
        >
          {m(item.title)}
        </SolutionItemLink>
      </h2>
      <p className="text-grey-60 m-0 mt-1.5 line-clamp-3 text-base leading-6 tracking-[-0.04em] md:mt-2 lg:mt-2.5 xl:mt-3">
        {m(item.description)}
      </p>
    </div>
  );
}

export function SolutionCard({
  item,
  preloadVisual = false,
}: {
  item: SolutionItem;
  preloadVisual?: boolean;
}): ReactNode {
  return (
    <article className="h-full">
      <SolutionCardVisualLink item={item} preloadVisual={preloadVisual} />
      <SolutionCardBody item={item} />
    </article>
  );
}
