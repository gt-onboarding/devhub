import {
  createElement,
  Fragment,
  type ComponentType,
  type ReactElement,
} from "react";
import type { MDXComponents } from "mdx/types";

import { showDrafts } from "@/lib/feature-flags-server";
import { hasTranslatedContent } from "@/lib/localized-content";
import {
  cookbooks,
  examples,
  filterPublished,
  recipesInOrder,
  type Cookbook,
  type Example,
  type Recipe,
} from "@/lib/recipes/recipes";

type TemplateContentModule = {
  default: ComponentType<{ components?: MDXComponents }>;
};

export type TemplateContentItem =
  | { kind: "recipe"; data: Recipe }
  | { kind: "cookbook"; data: Cookbook }
  | { kind: "example"; data: Example };

export function getAllTemplateSlugs(includeDrafts = showDrafts()): string[] {
  return [
    ...filterPublished(recipesInOrder, includeDrafts).map(
      (recipe) => recipe.id,
    ),
    ...filterPublished(cookbooks, includeDrafts).map((cookbook) => cookbook.id),
    ...filterPublished(examples, includeDrafts).map((example) => example.id),
  ].sort();
}

export function getTemplateItem(slug: string): TemplateContentItem | null {
  const recipe = recipesInOrder.find((entry) => entry.id === slug);
  if (recipe) {
    return { kind: "recipe", data: recipe };
  }

  const cookbook = cookbooks.find((entry) => entry.id === slug);
  if (cookbook) {
    return { kind: "cookbook", data: cookbook };
  }

  const example = examples.find((entry) => entry.id === slug);
  if (example) {
    return { kind: "example", data: example };
  }

  return null;
}

async function importTemplateSection(
  folder: "cookbooks" | "examples" | "recipes",
  slug: string,
  section: "goal" | "prerequisites",
  locale: string,
): Promise<ComponentType<{ components?: MDXComponents }> | null> {
  const translated = hasTranslatedContent(
    `${folder}/${slug}/${section}.md`,
    locale,
  );
  try {
    const module = (await (section === "goal"
      ? translated
        ? import(`@/content/${locale}/${folder}/${slug}/goal.md`)
        : import(`@/content/${folder}/${slug}/goal.md`)
      : translated
        ? import(`@/content/${locale}/${folder}/${slug}/prerequisites.md`)
        : import(
            `@/content/${folder}/${slug}/prerequisites.md`
          ))) as TemplateContentModule;
    return module.default;
  } catch {
    return null;
  }
}

export async function getTemplateContent(
  item: TemplateContentItem,
  locale: string,
  components?: MDXComponents,
): Promise<ReactElement | null> {
  const folder =
    item.kind === "cookbook"
      ? "cookbooks"
      : item.kind === "example"
        ? "examples"
        : "recipes";

  const Body = await importTemplateSection(
    folder,
    item.data.id,
    "goal",
    locale,
  );
  if (!Body) {
    return null;
  }

  const Prerequisites =
    item.kind === "cookbook"
      ? null
      : await importTemplateSection(
          folder,
          item.data.id,
          "prerequisites",
          locale,
        );

  if (!Prerequisites) {
    return createElement(Body, { components });
  }

  return createElement(
    Fragment,
    null,
    createElement(Body, { components }),
    createElement("h2", { id: "prerequisites" }, "Prerequisites"),
    createElement(Prerequisites, { components }),
  );
}
