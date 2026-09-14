"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useGT, useMessages } from "gt-next";

import { getSolutionCategoryLabel } from "@/lib/solutions/solution-category-labels";
import { cn } from "@/lib/utils";

type SolutionFiltersProps = {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
};

type ScrollMetrics = {
  scrollLeft: number;
  scrollWidth: number;
  clientWidth: number;
};

type ScrollEdgeState = {
  canScrollLeft: boolean;
  canScrollRight: boolean;
};

type CenteredScrollMetrics = {
  itemOffsetLeft: number;
  itemWidth: number;
  containerWidth: number;
};

const scrollEdgeThreshold = 1;
const initialScrollEdgeState: ScrollEdgeState = {
  canScrollLeft: false,
  canScrollRight: false,
};

function getScrollEdgeState({
  scrollLeft,
  scrollWidth,
  clientWidth,
}: ScrollMetrics): ScrollEdgeState {
  return {
    canScrollLeft: scrollLeft > scrollEdgeThreshold,
    canScrollRight:
      scrollLeft + clientWidth < scrollWidth - scrollEdgeThreshold,
  };
}

function getCenteredScrollLeft({
  itemOffsetLeft,
  itemWidth,
  containerWidth,
}: CenteredScrollMetrics): number {
  return itemOffsetLeft + itemWidth / 2 - containerWidth / 2;
}

export function SolutionFilters({
  categories,
  selectedCategory,
  onSelectCategory,
}: SolutionFiltersProps): ReactNode {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const selectedButtonRef = useRef<HTMLButtonElement | null>(null);
  const [scrollEdgeState, setScrollEdgeState] = useState<ScrollEdgeState>(
    initialScrollEdgeState,
  );

  const gt = useGT();
  const m = useMessages();

  const items: Array<{ label: string; value: string | null }> = [
    {
      label: gt("All", { $context: "Filter showing every solution category" }),
      value: null,
    },
    ...categories.map((category) => ({
      label: m(getSolutionCategoryLabel(category)),
      value: category,
    })),
  ];

  const updateScrollEdgeState = useCallback((): void => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const nextScrollEdgeState = getScrollEdgeState({
      scrollLeft: scrollContainer.scrollLeft,
      scrollWidth: scrollContainer.scrollWidth,
      clientWidth: scrollContainer.clientWidth,
    });

    setScrollEdgeState((previousScrollEdgeState) => {
      if (
        previousScrollEdgeState.canScrollLeft ===
          nextScrollEdgeState.canScrollLeft &&
        previousScrollEdgeState.canScrollRight ===
          nextScrollEdgeState.canScrollRight
      ) {
        return previousScrollEdgeState;
      }

      return nextScrollEdgeState;
    });
  }, []);

  useEffect(() => {
    updateScrollEdgeState();

    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateScrollEdgeState);

      return () => {
        window.removeEventListener("resize", updateScrollEdgeState);
      };
    }

    const resizeObserver = new ResizeObserver(updateScrollEdgeState);
    resizeObserver.observe(scrollContainer);

    return () => {
      resizeObserver.disconnect();
    };
  }, [items.length, updateScrollEdgeState]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const selectedButton = selectedButtonRef.current;

    if (scrollContainer && selectedButton) {
      scrollContainer.scrollTo({
        left: getCenteredScrollLeft({
          itemOffsetLeft: selectedButton.offsetLeft,
          itemWidth: selectedButton.offsetWidth,
          containerWidth: scrollContainer.clientWidth,
        }),
        behavior: "smooth",
      });
    }

    const frameId = window.requestAnimationFrame(updateScrollEdgeState);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [selectedCategory, updateScrollEdgeState]);

  return (
    <nav
      className="relative -mx-5 md:-mx-8 lg:mx-0"
      aria-label={gt("Solution categories")}
    >
      <div
        className="scroll-px-5 [scrollbar-width:none] overflow-x-auto overscroll-x-contain px-5 [-ms-overflow-style:none] md:scroll-px-8 md:px-8 lg:scroll-px-0 lg:px-0 [&::-webkit-scrollbar]:hidden"
        ref={scrollContainerRef}
        onScroll={updateScrollEdgeState}
      >
        <ul className="m-0 flex w-max min-w-full list-none items-center gap-0.5 p-0">
          {items.map((item) => {
            const selected = item.value === selectedCategory;
            return (
              <li className="m-0 shrink-0 p-0" key={item.value ?? "all"}>
                <button
                  className={cn(
                    "focus-visible:outline-db-cyan shrink-0 border px-3.5 py-2.25 font-mono text-sm leading-none font-medium whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2",
                    selected
                      ? "border-grey-60 bg-transparent text-white"
                      : "bg-grey-12 text-grey-60 border-transparent hover:bg-white/10 hover:text-white/78",
                  )}
                  ref={selected ? selectedButtonRef : undefined}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelectCategory(item.value)}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-16 bg-linear-to-r from-black/95 via-black/50 to-transparent transition-opacity duration-200",
          scrollEdgeState.canScrollLeft ? "opacity-100" : "opacity-0",
        )}
        aria-hidden="true"
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-black/95 via-black/50 to-transparent transition-opacity duration-200",
          scrollEdgeState.canScrollRight ? "opacity-100" : "opacity-0",
        )}
        aria-hidden="true"
      />
    </nav>
  );
}
