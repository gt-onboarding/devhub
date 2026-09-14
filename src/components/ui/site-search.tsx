"use client";

import { useMemo } from "react";
import type { SVGProps } from "react";
import { msg, useGT, useMessages } from "gt-next";
import { FileText, Rocket } from "lucide-react";

import { cookbooks, examples, recipesInOrder } from "@/lib/recipes/recipes";
import { buildSolutionItems } from "@/lib/solutions/solutions";
import { cn } from "@/lib/utils";
import { Dialog } from "@/components/ui/dialog";
import {
  groupSearchDialogItems,
  SearchDialogContent,
  SearchDialogTriggerButton,
  useSearchDialogState,
  type SearchDialogItem,
} from "@/components/ui/dialog-search";

export type SiteSearchItem = Omit<SearchDialogItem, "icon"> & {
  icon: "docs" | "solutions" | "templates";
};

function SearchDocumentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      overflow="visible"
      preserveAspectRatio="none"
      viewBox="0 0 14.14 16.14"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        strokeWidth="1.14"
        d="M13.57.57h-13v15h13zM3.57 3.57h7M3.57 6.57h7M3.57 9.57h7M3.57 12.57h3"
      />
    </svg>
  );
}

const SEARCH_ICONS: Record<SiteSearchItem["icon"], SearchDialogItem["icon"]> = {
  docs: SearchDocumentIcon,
  solutions: FileText,
  templates: Rocket,
};

const DOCS_GROUP = msg("Docs");
const TEMPLATES_GROUP = msg("Templates");
const SOLUTIONS_GROUP = msg("Solutions");

const DOC_ITEMS: SiteSearchItem[] = [
  {
    id: "docs-start-here",
    title: msg("Start here"),
    description: msg("Orientation for building enterprise apps on Databricks."),
    href: "/docs/start-here",
    group: DOCS_GROUP,
    icon: "docs",
    keywords: ["docs", "start", "getting started", "devhub"],
  },
  {
    id: "docs-templates",
    title: msg("Templates"),
    description: msg("How DevHub templates help scaffold Databricks apps."),
    href: "/docs/templates",
    group: DOCS_GROUP,
    icon: "docs",
    keywords: ["docs", "templates", "recipes", "examples"],
  },
  {
    id: "docs-cli",
    title: msg("Databricks CLI"),
    description: msg("Install, authenticate, and use the Databricks CLI."),
    href: "/docs/tools/databricks-cli",
    group: DOCS_GROUP,
    icon: "docs",
    keywords: ["cli", "auth", "setup"],
  },
];

function buildSearchItems(m: ReturnType<typeof useMessages>): SiteSearchItem[] {
  const docItems = DOC_ITEMS.map((item) => ({
    ...item,
    title: m(item.title),
    description: m(item.description),
    group: m(item.group),
  }));

  const templateItems = [...cookbooks, ...recipesInOrder, ...examples].map(
    (item) => ({
      id: `template-${item.id}`,
      title: item.name,
      description: item.description,
      href: `/templates/${item.id}`,
      group: m(TEMPLATES_GROUP),
      icon: "templates" as const,
      keywords: [...item.tags, ...item.services],
    }),
  );

  const solutionItems = buildSolutionItems().map((item) => ({
    id: `solution-${item.id}`,
    title: item.title,
    description: item.description,
    href: item.type === "linked" ? item.href : `/solutions/${item.id}`,
    external: item.type === "linked",
    group: m(SOLUTIONS_GROUP),
    icon: "solutions" as const,
    keywords: [...item.tags, item.source],
  }));

  return [...docItems, ...solutionItems, ...templateItems];
}

function toSearchDialogItem(item: SiteSearchItem): SearchDialogItem {
  return {
    ...item,
    icon: SEARCH_ICONS[item.icon],
  };
}

function matchesQuery(item: SearchDialogItem, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return [item.title, item.description, item.group, ...(item.keywords ?? [])]
    .join(" ")
    .toLowerCase()
    .includes(normalized);
}

export function SiteSearch({
  className,
  iconClassName,
  triggerClassName,
  triggerKbdClassName,
  items,
  previewLimit = 30,
  suggestedHeading,
  title,
}: {
  className?: string;
  iconClassName?: string;
  items?: readonly SiteSearchItem[];
  previewLimit?: number;
  suggestedHeading?: string;
  title?: string;
  triggerClassName?: string;
  triggerKbdClassName?: string;
}) {
  const gt = useGT();
  const m = useMessages();
  const { open, query, setQuery, handleOpenChange } = useSearchDialogState();
  const allItems = useMemo(
    () => (items ?? buildSearchItems(m)).map(toSearchDialogItem),
    [items, m],
  );
  const hasQuery = query.trim().length > 0;
  const resultGroups = useMemo(
    () =>
      groupSearchDialogItems(
        allItems
          .filter((item) => matchesQuery(item, query))
          .slice(0, hasQuery ? undefined : previewLimit),
      ),
    [allItems, hasQuery, previewLimit, query],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <SearchDialogTriggerButton
        ariaLabel={gt("Search documentation")}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          "border-grey-60 text-grey-60 hover:text-grey-80 focus-visible:border-db-cyan h-9 w-45 justify-start rounded-none border bg-transparent px-3 text-[0.8125rem] leading-none font-normal tracking-tight shadow-none hover:bg-white/5 focus-visible:ring-0 lg:has-[>kbd]:!pr-1.5",
          triggerClassName,
          className,
        )}
        iconClassName={cn("text-grey-60", iconClassName)}
        kbdClassName={cn(
          "h-5.5 min-w-0 rounded-none border border-grey-40 bg-transparent px-1.5 py-1 text-sm leading-none font-normal tracking-normal text-grey-60 shadow-none",
          triggerKbdClassName,
        )}
        onClick={() => handleOpenChange(true)}
        placeholder={gt("Search...")}
      />
      <SearchDialogContent
        emptyText={gt("No results found.")}
        onOpenChange={handleOpenChange}
        onQueryChange={setQuery}
        onSelect={(item) => {
          handleOpenChange(false);
          if (item.external) {
            window.open(item.href, "_blank", "noopener,noreferrer");
          } else {
            window.location.href = item.href;
          }
        }}
        query={query}
        resultGroups={resultGroups}
        resultsHeading={gt("Search results")}
        showDescription={hasQuery}
        suggestedHeading={suggestedHeading ?? gt("Suggested")}
        title={title ?? gt("Search DevHub")}
      />
    </Dialog>
  );
}
