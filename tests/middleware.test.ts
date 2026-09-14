import { NextRequest } from "next/server";
import { describe, expect, test, vi } from "vitest";

import proxy, { config } from "../src/proxy";

// withGTConfig injects the locale config at build time; mirror it here so the
// gt-next locale routing inside the proxy knows the supported locales.
vi.hoisted(async () => {
  const { readFileSync } = await import("node:fs");
  const gtConfig = JSON.parse(readFileSync("gt.config.json", "utf-8")) as {
    defaultLocale: string;
    locales: string[];
  };
  process.env._GENERALTRANSLATION_IGNORE_BROWSER_LOCALES = "false";
  process.env._GENERALTRANSLATION_I18N_CONFIG_PARAMS = JSON.stringify({
    defaultLocale: gtConfig.defaultLocale,
    locales: gtConfig.locales,
  });
});

describe("middleware markdown negotiation", () => {
  test("matches every path so markdown content negotiation can run", () => {
    expect(config.matcher).toContain("/:path*");
  });

  test("routes ordinary HTML requests to the default-locale segment", () => {
    const response = proxy(
      new NextRequest("https://developers.databricks.com/docs/start-here"),
    );

    expect(response?.headers.get("x-middleware-rewrite")).toBe(
      "https://developers.databricks.com/en/docs/start-here",
    );
  });

  test("redirects HTML requests to the visitor's locale prefix", () => {
    const response = proxy(
      new NextRequest("https://developers.databricks.com/docs/start-here", {
        headers: { "accept-language": "fr-FR,fr;q=0.9" },
      }),
    );

    expect(response?.status).toBe(307);
    expect(response?.headers.get("location")).toBe(
      "https://developers.databricks.com/fr/docs/start-here",
    );
  });

  test("leaves API routes and generated text artifacts out of locale routing", () => {
    for (const path of [
      "/api/markdown?section=docs&slug=start-here",
      "/raw-docs/start-here.md",
      "/llms.txt",
      "/solutions/rss.xml",
      "/img/databricks-logo.svg",
    ]) {
      expect(
        proxy(new NextRequest(`https://developers.databricks.com${path}`)),
      ).toBeUndefined();
    }
  });

  test("rewrites template HTML requests with markdown Accept to the static markdown artifact", () => {
    const response = proxy(
      new NextRequest(
        "https://developers.databricks.com/templates/ai-chat-app",
        {
          headers: { accept: "text/markdown" },
        },
      ),
    );

    expect(response?.headers.get("x-middleware-rewrite")).toBe(
      "https://developers.databricks.com/templates/ai-chat-app.md",
    );
  });

  test("rewrites docs HTML requests with text Accept to the static markdown artifact", () => {
    const response = proxy(
      new NextRequest("https://developers.databricks.com/docs/start-here", {
        headers: { accept: "text/plain" },
      }),
    );

    expect(response?.headers.get("x-middleware-rewrite")).toBe(
      "https://developers.databricks.com/docs/start-here.md",
    );
  });

  test("does not rewrite requests that already target markdown artifacts", () => {
    expect(
      proxy(
        new NextRequest(
          "https://developers.databricks.com/docs/start-here.md",
          {
            headers: { accept: "text/markdown" },
          },
        ),
      ),
    ).toBeUndefined();
  });

  test("rewrites section index requests with markdown Accept to the index artifact", () => {
    const response = proxy(
      new NextRequest("https://developers.databricks.com/templates/", {
        headers: { accept: "text/markdown" },
      }),
    );

    expect(response?.headers.get("x-middleware-rewrite")).toBe(
      "https://developers.databricks.com/templates.md",
    );
  });
});
