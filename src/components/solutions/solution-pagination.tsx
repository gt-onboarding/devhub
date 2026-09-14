import type { MouseEvent, ReactNode } from "react";
import Link from "next/link";
import { T, useGT } from "gt-next";
import { ArrowLeft, ArrowRight } from "lucide-react";

import {
  getSolutionPagePath,
  SOLUTION_ITEMS_SCROLL_STORAGE_KEY,
} from "@/lib/solutions/solutions";
import { cn } from "@/lib/utils";

type SolutionPaginationProps = {
  currentPage: number;
  pageCount: number;
};

function requestSolutionItemsScroll(): void {
  window.sessionStorage.setItem(SOLUTION_ITEMS_SCROLL_STORAGE_KEY, "true");
}

function handlePaginationClick(event: MouseEvent<HTMLAnchorElement>): void {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.altKey ||
    event.ctrlKey ||
    event.shiftKey
  ) {
    return;
  }

  requestSolutionItemsScroll();
}

function getVisiblePages(pageCount: number): Array<number | "..."> {
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }
  return [1, 2, 3, "...", pageCount];
}

export function SolutionPagination({
  currentPage,
  pageCount,
}: SolutionPaginationProps): ReactNode {
  const gt = useGT();

  if (pageCount <= 1) return null;

  const pages = getVisiblePages(pageCount);
  const previousDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= pageCount;

  return (
    <nav
      className="mx-auto mt-16 flex w-full max-w-104 items-center justify-between"
      aria-label={gt("Solution pagination")}
    >
      <Link
        className={cn(
          "text-grey-40 inline-flex items-center gap-0.75 text-sm leading-none font-medium tracking-normal no-underline transition-colors hover:text-white",
          previousDisabled && "pointer-events-none opacity-40",
        )}
        href={getSolutionPagePath(currentPage - 1)}
        aria-disabled={previousDisabled}
        tabIndex={previousDisabled ? -1 : undefined}
        onClick={handlePaginationClick}
      >
        <ArrowLeft className="size-3.5 shrink-0" aria-hidden="true" />
        <T context="Pagination link to the previous page">Previous</T>
      </Link>

      <div className="flex items-center gap-1">
        {pages.map((page, index) =>
          page === "..." ? (
            <span
              className="flex h-9 min-w-9 items-center justify-center px-1.5 text-center text-sm leading-none font-medium tracking-normal text-white"
              key={`ellipsis-${index}`}
            >
              ...
            </span>
          ) : (
            <Link
              className={cn(
                "focus-visible:outline-db-cyan flex size-9 items-center justify-center text-center text-sm leading-none font-medium tracking-normal text-white no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                page === currentPage ? "bg-orange" : "hover:bg-white/8",
              )}
              key={page}
              href={getSolutionPagePath(page)}
              aria-current={page === currentPage ? "page" : undefined}
              onClick={handlePaginationClick}
            >
              {page}
            </Link>
          ),
        )}
      </div>

      <Link
        className={cn(
          "text-grey-40 inline-flex items-center gap-0.75 text-sm leading-none font-medium tracking-normal no-underline transition-colors hover:text-white",
          nextDisabled && "pointer-events-none opacity-40",
        )}
        href={getSolutionPagePath(currentPage + 1)}
        aria-disabled={nextDisabled}
        tabIndex={nextDisabled ? -1 : undefined}
        onClick={handlePaginationClick}
      >
        <T context="Pagination link to the next page">Next</T>
        <ArrowRight className="size-3.5 shrink-0" aria-hidden="true" />
      </Link>
    </nav>
  );
}
