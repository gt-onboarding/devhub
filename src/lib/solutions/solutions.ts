import { msg } from "gt-next";

import { getSolutionAuthor } from "./authors";

type SolutionItemBase = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  authors: string[];
  publishedAt: string;
  previewImage?: string;
  previewImageAlt?: string;
  isDraft?: boolean;
};

export type NativeSolutionItem = SolutionItemBase & {
  type: "native";
  source: "DevHub";
};

export type LinkedSolutionItem = SolutionItemBase & {
  type: "linked";
  href: string;
  source: string;
  previewImage: string;
  previewImageAlt: string;
};

export type SolutionItem = NativeSolutionItem | LinkedSolutionItem;

type SolutionItemFilter = {
  category: string | null;
  searchQuery: string;
};

export const SOLUTION_FEATURED_ITEM_ID = "devhub-launch";
export const SOLUTION_ITEMS_SECTION_ID = "solution-items";
export const SOLUTION_ITEMS_SCROLL_STORAGE_KEY =
  "devhub:solution-scroll-to-items";
const SOLUTION_ITEMS_PER_PAGE = 9;
const SOLUTION_PAGINATION_TEST_ITEM_COUNT = 18;

const PREFERRED_SOLUTION_CATEGORIES = [
  "Launch",
  "Developer Experience",
  "Updates",
  "Agent-Led Development",
  "Database Development",
  "Lakebase",
  "Databricks Apps",
  "Agent Bricks",
];

const SOLUTION_PAGINATION_TEST_CATEGORIES = [
  "Updates",
  "Developer Experience",
  "Lakebase",
  "Databricks Apps",
  "Agent Bricks",
];
const DATABRICKS_BLOG_HREF_PATTERN =
  /^https:\/\/(?:www\.)?databricks\.com\/blog(?:\/|$)/;

export const solutionItems: SolutionItem[] = [
  {
    type: "native",
    id: "devhub-launch",
    title: msg("Introducing DevHub"),
    description: msg(
      "A new developer hub for building on Databricks: opinionated, copy-pasteable templates and agent-ready documentation for software engineers.",
    ),
    tags: ["Launch", "Developer Experience", "Agent-Led Development"],
    authors: ["andre-landgraf"],
    publishedAt: "2026-05-04",
    source: "DevHub",
    previewImage: "/img/solutions/devhub-launch.jpg",
    previewImageAlt: msg(
      "Cover graphic for Introducing DevHub with a grid, launch tags, and developer hub label",
    ),
  },
  {
    type: "linked",
    id: "apps-lakebase-production",
    title: msg(
      "How to Build Production-Ready Data and AI Apps with Databricks Apps and Lakebase",
    ),
    description: msg(
      "Build full-stack data apps on Databricks Apps with Lakebase synced tables that replicate Unity Catalog data in seconds, and ship everything as code with Databricks Asset Bundles.",
    ),
    tags: ["Apps", "Lakebase", "Synced Tables", "Asset Bundles"],
    href: "https://www.databricks.com/blog/how-build-production-ready-data-and-ai-apps-databricks-apps-and-lakebase",
    source: "Databricks Blog",
    authors: ["Pascal Vogel", "Evan Pandya", "Christopher Pries"],
    publishedAt: "2025-11-19",
    previewImage: "/img/solutions/apps-lakebase-production.jpg",
    previewImageAlt: msg(
      "Cover graphic for building production-ready data and AI apps with Databricks Apps and Lakebase",
    ),
  },
  {
    type: "linked",
    id: "agent-bricks-apps-business-users",
    title: msg(
      "Ship quality enterprise AI agents to business users with Agent Bricks and Databricks Apps",
    ),
    description: msg(
      "Build domain-specific AI agents with Agent Bricks, deploy them through a chat UI on Databricks Apps, and distribute them to business users via Databricks One.",
    ),
    tags: ["Agent Bricks", "Apps", "AI Agents", "Databricks One"],
    href: "https://www.databricks.com/blog/ship-quality-enterprise-ai-agents-business-users-agent-bricks-and-databricks-apps",
    source: "Databricks Blog",
    authors: ["Pascal Vogel", "Evan Pandya"],
    publishedAt: "2026-03-16",
    previewImage: "/img/solutions/agent-bricks-apps-business-users.jpg",
    previewImageAlt: msg(
      "Cover graphic for shipping quality enterprise AI agents with Agent Bricks and Databricks Apps",
    ),
  },
  {
    type: "linked",
    id: "lakebase-transactional-layer",
    title: msg(
      "How to use Lakebase as a transactional data layer for Databricks Apps",
    ),
    description: msg(
      "Walk through a holiday request app that uses Lakebase as the operational Postgres tier behind Databricks Apps, from database setup to a fully connected frontend.",
    ),
    tags: ["Lakebase", "Apps", "Postgres", "Tutorial"],
    href: "https://www.databricks.com/blog/how-use-lakebase-transactional-data-layer-databricks-apps",
    source: "Databricks Blog",
    authors: ["Jasper Puts", "Antonio Javier Samaniego Jurado"],
    publishedAt: "2025-08-28",
    previewImage: "/img/solutions/lakebase-transactional-layer.jpg",
    previewImageAlt: msg(
      "Cover graphic for using Lakebase as a transactional data layer for Databricks Apps",
    ),
  },
  {
    type: "linked",
    id: "lakebase-database-branching",
    title: msg(
      "Database Branching in Postgres: Git-Style Workflows with Databricks Lakebase",
    ),
    description: msg(
      "Use Lakebase copy-on-write branches to give every developer, pull request, and CI run an isolated Postgres environment, and power instant point-in-time recovery and ephemeral databases for AI agents.",
    ),
    tags: [
      "Lakebase",
      "Branching",
      "Developer Experience",
      "Agent-Led Development",
    ],
    href: "https://www.databricks.com/blog/database-branching-postgres-git-style-workflows-databricks-lakebase",
    source: "Databricks Blog",
    authors: ["Susan Pierce"],
    publishedAt: "2026-04-10",
    previewImage: "/img/solutions/lakebase-database-branching.jpg",
    previewImageAlt: msg(
      "Cover graphic for database branching in Postgres with Databricks Lakebase",
    ),
  },
  {
    type: "linked",
    id: "evolutionary-database-development-part-1",
    title: msg(
      "Enabling Evolutionary Database Development: database branching with Lakebase",
    ),
    description: msg(
      "Walk through one feature and one schema change: copy-on-write branching gives every developer, pull request, and CI run an isolated, production-shaped Postgres database so database changes stop being a bottleneck.",
    ),
    tags: [
      "Lakebase",
      "Branching",
      "Database Development",
      "Developer Experience",
    ],
    href: "https://www.databricks.com/blog/enabling-evolutionary-database-development-database-branching-lakebase",
    source: "Databricks Blog",
    authors: ["Pramod Sadalage", "Kevin Hartman"],
    publishedAt: "2026-05-29",
    previewImage:
      "/img/solutions/blog-evolutionary-database-development-part-1.png",
    previewImageAlt: msg(
      "Developer workflow using Lakebase database branches for an isolated feature and schema change",
    ),
  },
  {
    type: "linked",
    id: "evolutionary-database-development-part-2",
    title: msg(
      "Enabling Evolutionary Database Development: database branching with Lakebase, continued",
    ),
    description: msg(
      "The architecture behind copy-on-write branching and the updated eleven-practice playbook it unlocks, from idempotent migrations and destructive testing to A/B schema prototyping on parallel branches.",
    ),
    tags: [
      "Lakebase",
      "Branching",
      "Database Development",
      "Developer Experience",
    ],
    href: "https://www.databricks.com/blog/enabling-evolutionary-database-development-database-branching-lakebase-part-2",
    source: "Databricks Blog",
    authors: ["Pramod Sadalage", "Kevin Hartman"],
    publishedAt: "2026-06-05",
    previewImage:
      "/img/solutions/blog-evolutionary-database-development-part-2.png",
    previewImageAlt: msg(
      "Copy-on-write database branching architecture and the practices it enables on Databricks Lakebase",
    ),
  },
  {
    type: "linked",
    id: "evolutionary-database-development-part-3",
    title: msg(
      "Enabling Evolutionary Database Development: Database branching with Lakebase, the conclusion",
    ),
    description: msg(
      "The branching playbook at team scale: tier topology as long-running branches, the branch permission model, the DBA-as-platform-engineer reframe, and agents that branch alongside humans.",
    ),
    tags: [
      "Lakebase",
      "Branching",
      "Database Development",
      "Developer Experience",
    ],
    href: "https://www.databricks.com/blog/enabling-evolutionary-database-development-database-branching-lakebase-part-3",
    source: "Databricks Blog",
    authors: ["Pramod Sadalage", "Kevin Hartman"],
    publishedAt: "2026-06-12",
    previewImage:
      "/img/solutions/blog-evolutionary-database-development-part-3.png",
    previewImageAlt: msg(
      "Team-scale Lakebase database branching with environment tiers, branch permissions, and agents",
    ),
  },
];

export function isNativeSolutionItem(
  item: SolutionItem,
): item is NativeSolutionItem {
  return item.type === "native";
}

export function isLinkedSolutionItem(
  item: SolutionItem,
): item is LinkedSolutionItem {
  return item.type === "linked";
}

export const nativeSolutionItems: NativeSolutionItem[] =
  solutionItems.filter(isNativeSolutionItem);

type Draftable = { isDraft?: boolean };

function filterPublishedSolutionItems<T extends Draftable>(
  items: T[],
  includeDrafts: boolean,
): T[] {
  if (includeDrafts) return items;
  return items.filter((item) => !item.isDraft);
}

export function buildSolutionItems(
  includeDrafts = false,
  entries: SolutionItem[] = solutionItems,
): SolutionItem[] {
  return [...filterPublishedSolutionItems(entries, includeDrafts)].sort(
    (a, b) => b.publishedAt.localeCompare(a.publishedAt),
  );
}

export function getSolutionItemHref(item: SolutionItem): string {
  return isLinkedSolutionItem(item) ? item.href : `/solutions/${item.id}`;
}

export function getSolutionItemAuthorNames(item: SolutionItem): string[] {
  if (isLinkedSolutionItem(item)) return item.authors;
  return item.authors.map((id) => getSolutionAuthor(id).name);
}

export function isDatabricksSolutionItem(
  item: Pick<SolutionItem, "type"> & { href?: string },
): boolean {
  return (
    item.type === "linked" &&
    item.href !== undefined &&
    DATABRICKS_BLOG_HREF_PATTERN.test(item.href)
  );
}

export function buildSolutionPaginationTestItems(
  count = SOLUTION_PAGINATION_TEST_ITEM_COUNT,
): SolutionItem[] {
  return Array.from({ length: count }, (_, index) => {
    const itemNumber = index + 1;
    const category =
      SOLUTION_PAGINATION_TEST_CATEGORIES[
        index % SOLUTION_PAGINATION_TEST_CATEGORIES.length
      ];

    return {
      type: "native",
      id: `mock-pagination-solution-item-${itemNumber}`,
      title: `Mock pagination solution item ${String(itemNumber).padStart(2, "0")}`,
      description:
        "Development-only item used to verify solution pagination, category filtering, and search dialog grouping.",
      tags: [category],
      authors: ["andre-landgraf"],
      publishedAt: `2026-02-${String(itemNumber).padStart(2, "0")}`,
      source: "DevHub",
    };
  });
}

export function getFeaturedSolutionItem(
  items: SolutionItem[],
): SolutionItem | undefined {
  return (
    items.find((item) => item.id === SOLUTION_FEATURED_ITEM_ID) ?? items.at(0)
  );
}

export function getSolutionListItems(items: SolutionItem[]): SolutionItem[] {
  const featuredItem = getFeaturedSolutionItem(items);
  return featuredItem
    ? items.filter((item) => item.id !== featuredItem.id)
    : items;
}

export function getSolutionCategories(items: SolutionItem[]): string[] {
  const availableTags = new Set(items.flatMap((item) => item.tags));
  return PREFERRED_SOLUTION_CATEGORIES.filter((category) =>
    availableTags.has(category),
  );
}

export function filterSolutionItems(
  items: SolutionItem[],
  filter: SolutionItemFilter,
): SolutionItem[] {
  const query = filter.searchQuery.trim().toLowerCase();

  return items.filter((item) => {
    const matchesCategory =
      filter.category === null || item.tags.includes(filter.category);
    if (!matchesCategory) return false;

    if (query.length === 0) return true;

    const searchable = [
      item.title,
      item.description,
      item.source,
      ...item.tags,
      ...getSolutionItemAuthorNames(item),
    ]
      .join(" ")
      .toLowerCase();

    return searchable.includes(query);
  });
}

export function paginateSolutionItems(
  items: SolutionItem[],
  page: number,
  pageSize = SOLUTION_ITEMS_PER_PAGE,
): {
  currentPage: number;
  pageCount: number;
  items: SolutionItem[];
} {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), pageCount);
  const start = (currentPage - 1) * pageSize;

  return {
    currentPage,
    pageCount,
    items: items.slice(start, start + pageSize),
  };
}

export function getSolutionPageCount(
  items: SolutionItem[],
  pageSize = SOLUTION_ITEMS_PER_PAGE,
): number {
  return Math.max(1, Math.ceil(items.length / pageSize));
}

export function getSolutionPagePath(page: number): string {
  return page <= 1 ? "/solutions" : `/solutions/page/${page}`;
}

export function getSolutionPageFromPathname(pathname: string): number {
  const match = pathname.match(/^\/solutions(?:\/page\/(\d+))?\/?$/);
  const page = Number(match?.[1] ?? "1");

  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}
