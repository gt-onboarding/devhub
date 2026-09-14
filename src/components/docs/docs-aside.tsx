import type { ReactNode } from "react";
import Link from "next/link";
import { T, useGT } from "gt-next";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { BackToTop } from "@/components/docs/back-to-top";
import {
  TableOfContents,
  type DocsTableOfContentsItem,
} from "@/components/docs/table-of-contents";
import { Icons } from "@/components/icons";

type DocsAsideProps = {
  className?: string;
  maxHeadingLevel?: number;
  minHeadingLevel?: number;
  suggestEditsUrl?: string;
  sticky?: boolean;
  toc: readonly DocsAsideTocItem[];
};

type DocsAsideTocItem = {
  id: string;
  level: number;
  value: string;
};

function getTableOfContentsItems(
  items: readonly DocsAsideTocItem[],
): DocsTableOfContentsItem[] {
  return items.map((item) => ({
    anchor: item.id,
    depth: item.level,
    title: item.value,
  }));
}

export function DocsAside({
  className,
  maxHeadingLevel,
  minHeadingLevel,
  suggestEditsUrl,
  sticky = false,
  toc,
}: DocsAsideProps): ReactNode {
  const gt = useGT();
  const tableOfContents = getTableOfContentsItems(toc).filter(
    (item) =>
      item.depth === 2 &&
      (!minHeadingLevel || item.depth >= minHeadingLevel) &&
      (!maxHeadingLevel || item.depth <= maxHeadingLevel),
  );

  return (
    <aside
      className={cn(
        "aside -my-8 flex flex-col py-8 leading-none",
        sticky && "sticky top-16 h-fit max-h-[calc(100svh-4rem)]",
        className,
      )}
      data-sticky={sticky ? "true" : undefined}
    >
      {tableOfContents.length > 0 ? (
        <>
          <TableOfContents title={gt("On this page")} items={tableOfContents} />
          <Separator className="bg-prose-border my-3.5" />
        </>
      ) : null}

      {suggestEditsUrl ? (
        <Link
          className="text-grey-70 inline-flex items-center gap-x-2 py-1.5 text-sm leading-none font-normal tracking-tight no-underline hover:text-white hover:no-underline [&_svg]:size-5"
          href={suggestEditsUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icons.github className="size-4" aria-hidden="true" />
          <T>
            Suggest edits <span className="sr-only">on GitHub</span>
          </T>
        </Link>
      ) : null}

      <BackToTop className="mt-3.5 leading-none" />
    </aside>
  );
}
