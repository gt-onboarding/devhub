"use client";

import Image from "next/image";
import { useGT, useMessages } from "gt-next";

import type { GalleryImage } from "@/lib/recipes/recipes";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

/**
 * Image carousel for template detail pages.
 *
 * - Each slide renders the production light preview variant, falling back to
 *   dark when needed.
 * - Every slide is a fixed 16:9 frame; image contract is enforced by
 *   `pnpm verify:images`.
 * - Arrows only render when there's more than one image.
 */
export function TemplateImageCarousel({
  images,
  exampleName,
}: {
  images: GalleryImage[];
  exampleName: string;
}) {
  const gt = useGT();
  const m = useMessages();
  const multiple = images.length > 1;

  if (images.length === 0) return null;

  return (
    <div className="mb-8">
      <Carousel opts={{ align: "start", loop: multiple }} className="w-full">
        <CarouselContent>
          {images.map((image, i) => (
            <CarouselItem key={`${image.lightUrl}-${image.darkUrl}`}>
              <Slide
                image={image}
                alt={gt("{name} screenshot {index} of {total}", {
                  name: m(exampleName),
                  index: i + 1,
                  total: images.length,
                })}
                loading="eager"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        {multiple && (
          <>
            <CarouselPrevious className="left-3 border-black/20 bg-white/80 text-black backdrop-blur-sm hover:bg-white dark:border-white/20 dark:bg-black/80 dark:text-white dark:hover:bg-black" />
            <CarouselNext className="right-3 border-black/20 bg-white/80 text-black backdrop-blur-sm hover:bg-white dark:border-white/20 dark:bg-black/80 dark:text-white dark:hover:bg-black" />
          </>
        )}
      </Carousel>
    </div>
  );
}

function Slide({
  image,
  alt,
  loading,
}: {
  image: GalleryImage;
  alt: string;
  loading: "eager" | "lazy";
}) {
  const src = image.lightUrl ?? image.darkUrl;
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-black/12 bg-black/4">
      <Image
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover object-center"
        fill
        loading={loading}
        sizes="(min-width: 1024px) 768px, calc(100vw - 40px)"
        quality={100}
      />
    </div>
  );
}
