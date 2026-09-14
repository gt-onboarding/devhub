import { type NextRequest } from "next/server";

import { resolveSiteUrlForRequest } from "@/lib/site-url";
import { buildSolutionRssFeed } from "@/lib/solutions/rss-feed";
import { buildSolutionItems } from "@/lib/solutions/solutions";

export const dynamic = "force-dynamic";

function rssResponse(request: NextRequest, includeBody: boolean): Response {
  const siteUrl = resolveSiteUrlForRequest(
    request.headers.get("host") ?? undefined,
  );
  const body = buildSolutionRssFeed(buildSolutionItems(), siteUrl);

  return new Response(includeBody ? body : null, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=0, s-maxage=600",
      "Content-Disposition": 'inline; filename="rss.xml"',
    },
  });
}

export function GET(request: NextRequest): Response {
  return rssResponse(request, true);
}

export function HEAD(request: NextRequest): Response {
  return rssResponse(request, false);
}
