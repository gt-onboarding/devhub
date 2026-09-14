import type { ReactNode } from "react";
import { T, useGT, useMessages } from "gt-next";

import { composeTemplateAgentPrompt } from "@/lib/agent-content-markdown";
import { goalOnly, type ContentSections } from "@/lib/content-sections";
import { buildFullPrompt } from "@/lib/examples/build-example-markdown";
import {
  cookbooks,
  recipes,
  type Cookbook,
  type Example,
  type Recipe,
} from "@/lib/recipes/recipes";
import { resolveSiteUrl } from "@/lib/site-url";
import type { TemplateContentItem } from "@/lib/template-content";
import { FallbackCardArt } from "@/components/examples/fallback-card-art";
import { TemplateImageCarousel } from "@/components/examples/template-image-carousel";
import { TemplatePreviewImage } from "@/components/examples/template-preview-image";
import type { TemplateItem } from "@/components/templates/template-card";
import {
  TemplateIncludedCard,
  TemplateStarterCodeCard,
  type TemplateUsageProps,
} from "@/components/templates/template-detail-sections";

export type TemplateDetailPresentation = "default" | "hackathon";

export type TemplateDetailView = {
  afterHero?: ReactNode;
  belowContent?: ReactNode;
  body: ReactNode;
  bodyClassName?: string;
  description: string;
  heroMedia?: ReactNode;
  presentation: TemplateDetailPresentation;
  relatedItems: TemplateItem[];
  services?: readonly string[];
  title: string;
  usage: TemplateUsageProps;
};

function TemplatePreviewFrame({
  darkUrl,
  lightUrl,
  name,
}: {
  darkUrl?: string;
  lightUrl?: string;
  name: string;
}): ReactNode {
  const gt = useGT();
  const m = useMessages();

  return (
    <div className="relative aspect-video w-full overflow-hidden border border-black/12 bg-black/4">
      <TemplatePreviewImage
        lightUrl={lightUrl ?? darkUrl}
        darkUrl={darkUrl ?? lightUrl}
        alt={gt("{name} preview", { name: m(name) })}
        fallback={<FallbackCardArt index={0} />}
        loading="eager"
      />
    </div>
  );
}

function buildTemplateAgentPrompt({
  body,
  siteOrigin,
  slug,
}: {
  body: string;
  siteOrigin: string;
  slug: string;
}): string {
  return composeTemplateAgentPrompt({
    body,
    section: "templates",
    slug,
    siteOrigin,
  });
}

function getCookbookDetailView({
  body,
  cookbook,
  rawMarkdown,
  replitPrompt,
}: {
  body: ReactNode;
  cookbook: Cookbook;
  rawMarkdown: string;
  replitPrompt?: string;
}): TemplateDetailView {
  const siteOrigin = resolveSiteUrl();
  const relatedItems: TemplateItem[] = cookbook.recipeIds
    .map((id) => recipes.find((recipe) => recipe.id === id))
    .filter(
      (recipe): recipe is (typeof recipes)[number] => recipe !== undefined,
    )
    .map((data) => ({ kind: "recipe" as const, data }));

  return {
    body,
    description: cookbook.description,
    heroMedia: (
      <TemplatePreviewFrame
        lightUrl={cookbook.previewImageLightUrl}
        darkUrl={cookbook.previewImageDarkUrl}
        name={cookbook.name}
      />
    ),
    presentation: "default",
    relatedItems,
    title: cookbook.name,
    usage: {
      kind: "cookbook",
      rawMarkdown,
      prebuiltAgentMarkdown: buildTemplateAgentPrompt({
        body: rawMarkdown,
        siteOrigin,
        slug: cookbook.id,
      }),
      replitPrompt,
      slug: cookbook.id,
      title: cookbook.name,
      description: cookbook.description,
      permalink: `/templates/${cookbook.id}`,
    },
  };
}

function getRecipeDetailView({
  body,
  rawMarkdown,
  recipe,
  replitPrompt,
}: {
  body: ReactNode;
  rawMarkdown: string;
  recipe: Recipe;
  replitPrompt?: string;
}): TemplateDetailView {
  const siteOrigin = resolveSiteUrl();
  const relatedItems: TemplateItem[] = recipes
    .filter(
      (item) =>
        item.id !== recipe.id &&
        !item.unlisted &&
        item.services.some((service) => recipe.services.includes(service)),
    )
    .slice(0, 3)
    .map((data) => ({ kind: "recipe" as const, data }));
  const isHackathonTemplate = recipe.id === "hackathon-app-with-synced-dataset";

  return {
    body,
    bodyClassName: isHackathonTemplate
      ? "mt-10 max-w-184 recipe-content-card template-dark-prose md:mt-12"
      : undefined,
    description: recipe.description,
    heroMedia: isHackathonTemplate ? undefined : (
      <TemplatePreviewFrame
        lightUrl={recipe.previewImageLightUrl}
        darkUrl={recipe.previewImageDarkUrl}
        name={recipe.name}
      />
    ),
    presentation: isHackathonTemplate ? "hackathon" : "default",
    relatedItems,
    services: recipe.services,
    title: recipe.name,
    usage: {
      kind: "recipe",
      rawMarkdown,
      prebuiltAgentMarkdown: buildTemplateAgentPrompt({
        body: rawMarkdown,
        siteOrigin,
        slug: recipe.id,
      }),
      replitPrompt,
      slug: recipe.id,
      title: recipe.name,
      description: recipe.description,
      permalink: `/templates/${recipe.id}`,
    },
  };
}

function getExampleDetailView({
  body,
  example,
  replitPrompt,
  sections,
}: {
  body: ReactNode;
  example: Example;
  replitPrompt?: string;
  sections: ContentSections;
}): TemplateDetailView {
  const siteUrl = resolveSiteUrl();
  const githubUrl = example.templateUrl;
  const rawMarkdown = goalOnly(sections);
  const includedCookbooks = example.cookbookIds
    .map((id) => cookbooks.find((c) => c.id === id))
    .filter((c): c is Cookbook => c !== undefined);
  const includedRecipes = example.recipeIds
    .map((id) => recipes.find((r) => r.id === id))
    .filter((r): r is Recipe => r !== undefined);
  const mdOpts = {
    example,
    githubUrl,
    includedCookbooks,
    includedRecipes,
    baseUrl: siteUrl,
  };
  const examplePromptBody = buildFullPrompt({ ...mdOpts, sections });
  const relatedItems: TemplateItem[] = [
    ...includedCookbooks.map((data) => ({ kind: "cookbook" as const, data })),
    ...includedRecipes.map((data) => ({ kind: "recipe" as const, data })),
  ];

  return {
    afterHero: <TemplateStarterCodeCard templateUrl={example.templateUrl} />,
    belowContent:
      relatedItems.length > 0 ? (
        <div className="mt-12 flex flex-col gap-6">
          <T>
            <div className="flex flex-col gap-6">
              <h2 className="m-0 text-2xl leading-normal font-medium tracking-tight text-white">
                Built on these templates
              </h2>
              <p className="text-grey-90 m-0 text-lg leading-normal tracking-tight">
                This example's codebase and the agent prompt above both build on
                top of the templates below. Open one to dive into a specific
                technique on its own or apply it to a different project.
              </p>
            </div>
          </T>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {relatedItems.map(({ data }) => (
              <TemplateIncludedCard
                key={data.id}
                name={data.name}
                description={data.description}
                href={`/templates/${data.id}`}
              />
            ))}
          </div>
        </div>
      ) : null,
    body,
    description: example.description,
    heroMedia:
      example.galleryImages && example.galleryImages.length > 0 ? (
        <TemplateImageCarousel
          images={example.galleryImages}
          exampleName={example.name}
        />
      ) : (
        <TemplatePreviewFrame
          lightUrl={example.previewImageLightUrl}
          darkUrl={example.previewImageDarkUrl}
          name={example.name}
        />
      ),
    presentation: "default",
    relatedItems,
    title: example.name,
    usage: {
      kind: "example",
      slug: example.id,
      rawMarkdown,
      prebuiltAgentMarkdown: buildTemplateAgentPrompt({
        body: examplePromptBody,
        siteOrigin: siteUrl,
        slug: example.id,
      }),
      replitPrompt,
      title: example.name,
      description: example.description,
      permalink: `/templates/${example.id}`,
    },
  };
}

export function getTemplateDetailView({
  body,
  exampleSections,
  item,
  rawMarkdown,
  replitPrompt,
}: {
  body: ReactNode;
  exampleSections?: ContentSections;
  item: TemplateContentItem;
  rawMarkdown: string;
  replitPrompt?: string;
}): TemplateDetailView {
  if (item.kind === "cookbook") {
    return getCookbookDetailView({
      body,
      cookbook: item.data,
      rawMarkdown,
      replitPrompt,
    });
  }

  if (item.kind === "example") {
    return getExampleDetailView({
      body,
      example: item.data,
      replitPrompt,
      sections: exampleSections ?? {},
    });
  }

  return getRecipeDetailView({
    body,
    rawMarkdown,
    recipe: item.data,
    replitPrompt,
  });
}
