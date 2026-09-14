import { NextRequest } from "next/server";
import { describe, expect, test } from "vitest";

import { GET, HEAD } from "../src/app/solutions/rss.xml/route";

type RawResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

async function call(
  handler: typeof GET | typeof HEAD = GET,
  host = "developers.databricks.com",
): Promise<RawResponse> {
  const response = handler(
    new NextRequest("https://developers.databricks.com/solutions/rss.xml", {
      headers: { host },
    }),
  );

  return {
    statusCode: response.status,
    headers: Object.fromEntries(
      Array.from(response.headers.entries()).map(([key, value]) => [
        key.toLowerCase(),
        value,
      ]),
    ),
    body: await response.text(),
  };
}

async function withSiteUrl<T>(
  siteUrl: string,
  run: () => T | Promise<T>,
): Promise<T> {
  const previous = process.env.SITE_URL;
  process.env.SITE_URL = siteUrl;
  try {
    return await run();
  } finally {
    if (previous === undefined) {
      delete process.env.SITE_URL;
    } else {
      process.env.SITE_URL = previous;
    }
  }
}

describe("/solutions/rss.xml", () => {
  test("serves the solutions RSS feed from a Next route handler", async () => {
    const result = await call();

    expect(result.statusCode).toBe(200);
    expect(result.headers["content-type"]).toBe("application/xml");
    expect(result.headers["content-disposition"]).toBe(
      'inline; filename="rss.xml"',
    );
    expect(result.body).toContain("<rss");
    expect(result.body).toContain(
      "<title>Databricks Developer Solutions</title>",
    );
    expect(result.body).toContain(
      '<atom:link href="https://developers.databricks.com/solutions/rss.xml" rel="self" type="application/rss+xml" />',
    );
  });

  test("uses the configured SITE_URL origin", async () => {
    await withSiteUrl("https://developers.databricks.com/docs", async () => {
      const result = await call(GET, "127.0.0.1:4182");

      expect(result.body).toContain(
        '<atom:link href="https://developers.databricks.com/solutions/rss.xml" rel="self" type="application/rss+xml" />',
      );
      expect(result.body).toContain(
        "<link>https://developers.databricks.com/solutions/devhub-launch</link>",
      );
    });
  });

  test("supports HEAD without a response body", async () => {
    const result = await call(HEAD);

    expect(result.statusCode).toBe(200);
    expect(result.headers["content-type"]).toBe("application/xml");
    expect(result.body).toBe("");
  });
});
