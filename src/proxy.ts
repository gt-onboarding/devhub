import { NextResponse, type NextRequest } from "next/server";
import { createNextMiddleware } from "gt-next/middleware";

import { resolveMarkdownNegotiationPath } from "./lib/markdown-sections";

/**
 * Locale routing (gt-next). Detects the visitor's locale from the URL prefix,
 * cookie, or Accept-Language and rewrites `/docs/x` to `/en/docs/x` (default
 * locale stays unprefixed) or redirects to `/fr/docs/x` for other locales,
 * so every page resolves under `src/app/[locale]`.
 */
const localeRouting = createNextMiddleware();

/**
 * Only page routes take part in locale routing. API handlers, generated text
 * artifacts (`/raw-docs`, `/llms.txt`, `*.md`, `rss.xml`), Next internals, and
 * static files with an extension are served as-is.
 */
const LOCALE_ROUTED_PATH =
  /^\/(?!api(?:\/|$)|raw-docs(?:\/|$)|_next(?:\/|$)|static(?:\/|$)|.*\.[^/]+$).*/;

/**
 * Content negotiation: when a client sends Accept: text/markdown or
 * Accept: text/plain, transparently rewrite to /api/markdown so it gets
 * markdown instead of HTML.
 */
export function proxy(request: NextRequest): NextResponse | undefined {
  const url = request.nextUrl.clone();
  const accept = request.headers.get("accept") ?? "";
  const path = url.pathname;

  if (accept.includes("text/markdown") || accept.includes("text/plain")) {
    const negotiated = resolveMarkdownNegotiationPath(path);
    if (negotiated) {
      const dest = new URL(negotiated.artifactPath, url.origin);
      return NextResponse.rewrite(dest);
    }
  }

  if (LOCALE_ROUTED_PATH.test(path)) {
    return localeRouting(request);
  }

  return undefined;
}

export default proxy;

export const config = {
  matcher: ["/:path*"],
};
