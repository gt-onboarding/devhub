"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { T, useGT } from "gt-next";
import { Rss } from "lucide-react";

import { useHistory, useLocation } from "@/lib/client-router";
import {
  filterSolutionItems,
  getSolutionPageFromPathname,
  getSolutionPagePath,
  paginateSolutionItems,
  SOLUTION_ITEMS_SCROLL_STORAGE_KEY,
  SOLUTION_ITEMS_SECTION_ID,
  type SolutionItem,
} from "@/lib/solutions/solutions";
import { SolutionCard } from "@/components/solutions/solution-card";
import { SolutionEmptyState } from "@/components/solutions/solution-empty-state";
import { SolutionFilters } from "@/components/solutions/solution-filters";
import { SolutionPagination } from "@/components/solutions/solution-pagination";
import { SolutionSearch } from "@/components/solutions/solution-search";

type SolutionItemsSectionProps = {
  categories: string[];
  items: SolutionItem[];
  rssHref: string;
  searchItems: SolutionItem[];
};

export function SolutionItemsSection({
  categories,
  items,
  rssHref,
  searchItems,
}: SolutionItemsSectionProps): ReactNode {
  const gt = useGT();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { push, replace } = useHistory();
  const { pathname } = useLocation();
  const page = getSolutionPageFromPathname(pathname);

  const categoryItems = useMemo(
    () =>
      filterSolutionItems(items, {
        category: selectedCategory,
        searchQuery: "",
      }),
    [items, selectedCategory],
  );

  const pagination = useMemo(
    () => paginateSolutionItems(categoryItems, page),
    [categoryItems, page],
  );

  useEffect(() => {
    if (page !== pagination.currentPage) {
      replace(getSolutionPagePath(pagination.currentPage));
    }
  }, [page, pagination.currentPage, replace]);

  useEffect(() => {
    if (
      window.sessionStorage.getItem(SOLUTION_ITEMS_SCROLL_STORAGE_KEY) !==
      "true"
    ) {
      return;
    }

    window.sessionStorage.removeItem(SOLUTION_ITEMS_SCROLL_STORAGE_KEY);
    document.getElementById(SOLUTION_ITEMS_SECTION_ID)?.scrollIntoView({
      block: "start",
    });
  }, [pathname]);

  function handleSelectCategory(category: string | null): void {
    setSelectedCategory(category);
    if (page !== 1) {
      window.sessionStorage.setItem(SOLUTION_ITEMS_SCROLL_STORAGE_KEY, "true");
      push(getSolutionPagePath(1));
    }
  }

  return (
    <section
      className="posts-section mt-16 scroll-mt-24 md:mt-22 md:scroll-mt-28 lg:mt-26 xl:mt-31"
      id={SOLUTION_ITEMS_SECTION_ID}
      aria-labelledby="solution-items-heading"
    >
      <div className="mb-10 flex flex-col gap-4 lg:h-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="order-2 min-w-0 lg:order-0 lg:flex-1">
          <h2 className="sr-only" id="solution-items-heading">
            <T>Solutions</T>
          </h2>
          <SolutionFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
          />
        </div>

        <div className="order-1 flex w-full flex-col gap-4 sm:flex-row sm:items-center lg:order-0 lg:w-auto lg:shrink-0">
          <a
            className="focus-visible:outline-db-cyan hidden items-center gap-1.25 rounded-sm pr-2 text-sm leading-none font-medium tracking-normal text-white no-underline transition-colors hover:text-white/80 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-4 lg:inline-flex"
            href={rssHref}
            type="application/rss+xml"
            aria-label={gt(
              "Subscribe to the Databricks Developer Solutions RSS feed",
            )}
          >
            <Rss className="size-5" aria-hidden="true" />
            RSS
          </a>
          <SolutionSearch items={searchItems} />
        </div>
      </div>

      {pagination.items.length === 0 ? (
        <SolutionEmptyState
          className="mt-66"
          onClearFilters={() => handleSelectCategory(null)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-x-8.25 gap-y-10 md:grid-cols-2 md:gap-y-12 lg:gap-y-14 xl:grid-cols-3 xl:gap-y-16">
          {pagination.items.map((item, index) => (
            <SolutionCard
              key={item.id}
              item={item}
              preloadVisual={index === 0}
            />
          ))}
        </div>
      )}

      <SolutionPagination
        currentPage={pagination.currentPage}
        pageCount={pagination.pageCount}
      />
    </section>
  );
}
