import { msg } from "gt-next";

export const HEADER_LINKS = [
  { id: "product", label: msg("Product"), href: "/product/lakebase" },
  { id: "solutions", label: msg("Solutions"), href: "/solutions" },
  { id: "templates", label: msg("Templates"), href: "/templates" },
  {
    id: "docs",
    label: msg("Docs"),
    href: "/docs/start-here",
    activePath: "/docs",
  },
] as const;

export type HeaderNavItem = (typeof HEADER_LINKS)[number];

export const PRODUCT_LINKS = [
  { label: "Lakebase", href: "/product/lakebase" },
  { label: "Agent Bricks", href: "/product/agent-bricks" },
  { label: "Databricks Apps", href: "/product/databricks-apps" },
  { label: "Neon", href: "https://neon.com" },
] as const;

function normalizePath(path: string) {
  if (path === "/") return path;

  return path.replace(/\/$/, "");
}

export function isExternalHref(href: string) {
  return /^https?:\/\//.test(href);
}

function isHrefActive(href: string, pathname: string) {
  if (isExternalHref(href)) return false;

  const hrefPath = normalizePath(href);
  const currentPath = normalizePath(pathname);

  return hrefPath === "/"
    ? currentPath === "/"
    : currentPath === hrefPath || currentPath.startsWith(`${hrefPath}/`);
}

export function isHeaderNavItemActive(item: HeaderNavItem, pathname: string) {
  return isHrefActive(
    "activePath" in item ? item.activePath : item.href,
    pathname,
  );
}

export function getActiveProductHref(pathname: string): string | undefined {
  return PRODUCT_LINKS.find(({ href }) => isHrefActive(href, pathname))?.href;
}
