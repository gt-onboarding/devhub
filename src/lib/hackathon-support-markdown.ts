import { readFileSync } from "fs";

import type { ReactNode } from "react";

import { renderMarkdownContent } from "@/lib/content-markdown-renderer";
import { resolveLocalizedContentPath } from "@/lib/localized-content";

export async function renderHackathonSupportMarkdown({
  locale,
  markdownSlug,
  tablePresentation,
}: {
  locale: string;
  markdownSlug: string;
  tablePresentation?: "prose";
}): Promise<ReactNode> {
  const source = readFileSync(
    resolveLocalizedContentPath(`hackathon/${markdownSlug}.md`, locale),
    "utf-8",
  );

  return renderMarkdownContent({
    showHeadingAnchors: false,
    source,
    tablePresentation,
    variant: "prose",
  });
}
