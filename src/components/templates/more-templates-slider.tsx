"use client";

import Image from "next/image";
import Link from "next/link";
import { T, useGT, useMessages } from "gt-next";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SliderArrowIcon } from "@/components/ui/slider-arrow-icon";
import { useScrollSlider } from "@/components/ui/use-scroll-slider";
import { FallbackCardArt } from "@/components/examples/fallback-card-art";
import { TemplatePreviewImage } from "@/components/examples/template-preview-image";

export type MoreTemplateItem = {
  darkUrl?: string;
  description: string;
  href: string;
  lightUrl?: string;
  name: string;
};

function MoreTemplateCard({
  item,
  index,
}: {
  item: MoreTemplateItem;
  index: number;
}) {
  const gt = useGT();
  const m = useMessages();
  const { name, description, href, lightUrl, darkUrl } = item;
  const displayName = m(name);

  return (
    <article className="group w-[calc(100vw-4rem)] shrink-0 snap-start md:w-xl">
      <Link
        className="block no-underline hover:no-underline"
        href={href}
        aria-label={gt("Read {name}", { name: displayName })}
      >
        <div className="border-db-navy bg-db-oat-medium relative aspect-video w-full overflow-hidden border">
          <TemplatePreviewImage
            lightUrl={lightUrl}
            darkUrl={darkUrl}
            alt={gt("{name} preview", { name: displayName })}
            fallback={<FallbackCardArt index={index} />}
            loading="eager"
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
      </Link>

      <h3 className="mt-5 mb-0 line-clamp-3 text-xl leading-tight font-normal tracking-[-0.04em] text-black/30 md:text-2xl xl:line-clamp-4 xl:text-[1.75rem] 2xl:line-clamp-5">
        <Link
          className="text-inherit no-underline hover:no-underline"
          href={href}
        >
          <span className="text-black">{displayName}.</span> [{m(description)}]
        </Link>
      </h3>
    </article>
  );
}

export function MoreTemplatesSlider({ items }: { items: MoreTemplateItem[] }) {
  const gt = useGT();
  const slider = useScrollSlider({ itemCount: items.length });

  if (items.length === 0) return null;

  const progress = `${Math.min(
    100,
    ((slider.currentIndex + 1) / items.length) * 100,
  )}%`;

  return (
    <section className="overflow-hidden pt-18 text-black md:pt-22 lg:pt-26 xl:pt-30">
      <div className="mx-auto w-full max-w-400 px-5 md:px-8">
        <h2 className="m-0 text-3xl leading-tight font-normal tracking-[-0.04em] md:text-5xl/[1.125] lg:text-[3.5rem]">
          <T>Explore more templates</T>
        </h2>

        <div className="mt-6 flex items-center gap-x-4 md:gap-8 lg:mt-14 xl:mt-18">
          <div
            className="bg-db-oat-medium h-1.5 grow lg:h-2"
            role="presentation"
            aria-hidden="true"
          >
            <div
              className="bg-orange h-full transition-[width] duration-300"
              style={{ width: progress }}
            />
          </div>
          <div className="flex shrink-0 items-center gap-x-3 md:gap-5">
            <Button
              className={cn(
                "static size-10 translate-0 rounded-none shadow-none transition-colors duration-150 disabled:opacity-100 md:size-11",
                slider.currentIndex === 0
                  ? "border-grey-70 text-grey-70 border bg-transparent"
                  : "border-orange bg-orange hover:bg-db-lava border text-white",
                "focus-visible:ring-db-cyan focus-visible:ring-offset-db-bg focus-visible:ring-2 focus-visible:ring-offset-2",
                "[&_svg]:size-6",
              )}
              type="button"
              onClick={() => slider.scrollToIndex(slider.currentIndex - 1)}
              disabled={slider.currentIndex === 0}
              aria-label={gt("Previous template")}
            >
              <SliderArrowIcon className="size-6 rotate-180" />
            </Button>
            <Button
              className={cn(
                "static size-10 translate-0 rounded-none shadow-none transition-colors duration-150 disabled:opacity-100 md:size-11",
                slider.currentIndex === slider.lastIndex
                  ? "border-grey-70 text-grey-70 border bg-transparent"
                  : "border-orange bg-orange hover:bg-db-lava border text-white",
                "focus-visible:ring-db-cyan focus-visible:ring-offset-db-bg focus-visible:ring-2 focus-visible:ring-offset-2",
                "[&_svg]:size-6",
              )}
              type="button"
              onClick={() => slider.scrollToIndex(slider.currentIndex + 1)}
              disabled={slider.currentIndex === slider.lastIndex}
              aria-label={gt("Next template")}
            >
              <SliderArrowIcon className="size-6" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 [--templates-slider-left:1.25rem] md:mt-10 md:[--templates-slider-left:2rem] 2xl:[--templates-slider-left:max(2rem,calc((100vw-96rem)/2))]">
        <div
          className="flex snap-x snap-mandatory [scroll-padding-right:var(--templates-slider-left)] [scroll-padding-left:var(--templates-slider-left)] [scrollbar-width:none] gap-5 overflow-x-auto scroll-smooth pr-(--templates-slider-left) pb-2 pl-(--templates-slider-left) md:gap-8 xl:gap-10 [&::-webkit-scrollbar]:hidden"
          ref={slider.trackRef}
          onScroll={slider.handleScroll}
        >
          {items.map((item, index) => (
            <MoreTemplateCard item={item} index={index} key={item.href} />
          ))}
        </div>
      </div>
    </section>
  );
}
