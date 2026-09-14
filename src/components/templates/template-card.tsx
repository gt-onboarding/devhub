import Image from "next/image";
import Link from "next/link";
import { useGT, useMessages } from "gt-next";

import type { Cookbook, Example, Recipe } from "@/lib/recipes/recipes";
import { FallbackCardArt } from "@/components/examples/fallback-card-art";
import { TemplatePreviewImage } from "@/components/examples/template-preview-image";

export type TemplateItem =
  | { kind: "example"; data: Example }
  | { kind: "cookbook"; data: Cookbook }
  | { kind: "recipe"; data: Recipe };

function getTemplateHref(item: TemplateItem): string {
  return `/templates/${item.data.id}`;
}

export function getTemplateCardFields(item: TemplateItem) {
  return {
    name: item.data.name,
    description: item.data.description,
    href: getTemplateHref(item),
    lightUrl: item.data.previewImageLightUrl,
    darkUrl: item.data.previewImageDarkUrl,
  };
}

export function TemplateCard({
  item,
  index,
}: {
  item: TemplateItem;
  index: number;
}) {
  const gt = useGT();
  const m = useMessages();
  const { name, description, href, lightUrl, darkUrl } =
    getTemplateCardFields(item);
  const displayName = m(name);

  return (
    <article className="min-w-0 text-black">
      <Link
        className="group flex min-w-0 flex-col gap-6 no-underline hover:no-underline"
        href={href}
        aria-label={gt("Read {name}", { name: displayName })}
      >
        <div className="border-db-navy bg-db-oat-medium relative aspect-video min-w-0 overflow-hidden border">
          <TemplatePreviewImage
            lightUrl={lightUrl}
            darkUrl={darkUrl}
            alt={gt("{name} preview", { name: displayName })}
            fallback={<FallbackCardArt index={index} />}
            preload={index === 0}
          />
          <span className="bg-orange absolute top-0 right-0 z-10 flex size-11 items-center justify-center opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
            <Image
              className="size-6"
              src="/img/templates/arrow-right-up.svg"
              alt=""
              aria-hidden="true"
              width={24}
              height={24}
            />
          </span>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <h2 className="m-0 line-clamp-4 text-xl/tight font-normal tracking-[-0.04em] text-balance text-black/30 md:text-2xl/tight">
            <span className="text-black">{displayName}.</span> [{m(description)}
            ]
          </h2>
        </div>
      </Link>
    </article>
  );
}
