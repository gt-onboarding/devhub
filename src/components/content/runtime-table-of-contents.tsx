"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useGT } from "gt-next";

import { cn } from "@/lib/utils";

type RuntimeTableOfContentsItem = {
  id: string;
  text: string;
};

type RuntimeTableOfContentsProps = {
  ariaLabel?: string;
  className?: string;
  contentId?: string;
  contentRef?: React.RefObject<HTMLDivElement | null>;
};

function headingIdFromText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function RuntimeTableOfContents({
  ariaLabel,
  className,
  contentId,
  contentRef,
}: RuntimeTableOfContentsProps): ReactNode {
  const gt = useGT();
  const [items, setItems] = useState<RuntimeTableOfContentsItem[]>([]);
  const [activeId, setActiveId] = useState("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  const getContainer = useCallback(
    () => contentRef?.current ?? document.getElementById(contentId ?? ""),
    [contentId, contentRef],
  );

  const collectItems = useCallback(() => {
    const container = getContainer();
    if (!container) return;

    const nextItems = Array.from(container.querySelectorAll("h2"))
      .map((heading) => {
        const text = heading.textContent?.trim() ?? "";
        if (!text) return null;

        if (!heading.id) {
          heading.id = headingIdFromText(text);
        }

        return heading.id ? { id: heading.id, text } : null;
      })
      .filter((item): item is RuntimeTableOfContentsItem => item !== null);

    setItems(nextItems);
    setActiveId((currentActiveId) => currentActiveId || nextItems[0]?.id || "");
  }, [getContainer]);

  useEffect(() => {
    collectItems();
    const timer = window.setTimeout(collectItems, 500);
    return () => window.clearTimeout(timer);
  }, [collectItems]);

  useEffect(() => {
    const container = getContainer();
    if (!container || items.length === 0) return;

    observerRef.current?.disconnect();

    const visibleIds = new Set<string>();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleIds.add(entry.target.id);
          } else {
            visibleIds.delete(entry.target.id);
          }
        });

        const activeItem = items.find((item) => visibleIds.has(item.id));
        if (activeItem) {
          setActiveId(activeItem.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );

    items.forEach((item) => {
      const heading = container.querySelector(`#${CSS.escape(item.id)}`);
      if (heading) {
        observerRef.current?.observe(heading);
      }
    });

    return () => observerRef.current?.disconnect();
  }, [items, getContainer]);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, itemId: string) => {
      event.preventDefault();
      document
        .getElementById(itemId)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(itemId);
    },
    [],
  );

  if (items.length === 0) return null;

  return (
    <nav
      className={cn(className)}
      aria-label={ariaLabel ?? gt("Content sections")}
    >
      <ul className="flex list-none flex-col gap-y-2.5">
        {items.map((item) => (
          <li key={item.id} className="m-0 p-0">
            <a
              href={`#${item.id}`}
              className={[
                "block py-1 text-base/snug font-normal no-underline transition-colors hover:text-white hover:no-underline",
                activeId === item.id ? "text-orange" : "text-grey-80",
              ].join(" ")}
              onClick={(event) => handleClick(event, item.id)}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
