import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
  type SVGProps,
} from "react";
import Link from "next/link";
import { useGT } from "gt-next";
import { domAnimation, LazyMotion } from "motion/react";
import * as m from "motion/react-m";

import { useFeatureFlags } from "@/lib/feature-flags";
import { buildTemplateItems } from "@/lib/templates/template-items";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SliderArrowIcon } from "@/components/ui/slider-arrow-icon";
import { FallbackCardArt } from "@/components/examples/fallback-card-art";
import { TemplatePreviewImage } from "@/components/examples/template-preview-image";
import { getTemplateCardFields } from "@/components/templates/template-card";

import { useTemplateSlider, type TemplateSliderSettings } from "./use-slider";

type TemplateCardItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  lightUrl?: string;
};

function TitleLinkIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      width="25"
      height="25"
      viewBox="0 0 25 25"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M13.9844 14.5332V8.11257H7.56374"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="square"
      />
      <path
        d="M3.21094 18.8887L13.7109 8.38867"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="square"
      />
    </svg>
  );
}

const TEMPLATE_DESCRIPTION_WIDTH = {
  inactive: "26rem",
  active: "34rem",
};

function buildHomeTemplateCardItems(
  includeDrafts: boolean,
): TemplateCardItem[] {
  return buildTemplateItems(includeDrafts).map((item) => {
    const { name, description, href, lightUrl } = getTemplateCardFields(item);

    return {
      id: item.data.id,
      title: name,
      description,
      href,
      lightUrl,
    };
  });
}

function TemplateDescriptionText({
  children,
  isVisible,
  width,
  duration,
}: {
  children: string;
  isVisible: boolean;
  width: string;
  duration: number;
}) {
  return (
    <p
      aria-hidden={!isVisible}
      className={cn(
        "text-grey-70 col-start-1 row-start-1 line-clamp-3 max-w-full min-w-0 text-[0.9375rem] leading-normal tracking-tight break-words transition-[opacity,transform] ease-out",
        isVisible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-1 opacity-0",
      )}
      style={{
        maxWidth: "100%",
        transitionDuration: `${duration}s`,
        width,
      }}
    >
      {children}
    </p>
  );
}

function TemplateCarouselCard({
  item,
  index,
  isActive,
  canOpenLink,
  isKeyboardMode,
  imageDuration,
  textWidthDuration,
}: {
  item: TemplateCardItem;
  index: number;
  isActive: boolean;
  canOpenLink: boolean;
  isKeyboardMode: boolean;
  imageDuration: number;
  textWidthDuration: number;
}) {
  const gt = useGT();

  return (
    <Link
      className="group/card focus-visible:ring-db-cyan mt-auto flex h-fit w-full min-w-0 flex-col justify-end text-white no-underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121317] focus-visible:outline-none"
      href={item.href}
      draggable={false}
      aria-label={gt("{title} template", { title: item.title })}
      onDragStart={(event) => event.preventDefault()}
    >
      <h3 className="text-xl leading-tight font-medium tracking-tight text-pretty text-white">
        <span className="inline-flex items-center gap-1.5 text-white">
          <span>{item.title}</span>
          <TitleLinkIcon
            className={cn(
              "text-db-lava-light size-6 opacity-0 transition-[opacity,transform] duration-200",
              canOpenLink &&
                "group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5 group-hover/card:opacity-100 group-focus-visible/card:translate-x-0.5 group-focus-visible/card:-translate-y-0.5 group-focus-visible/card:opacity-100",
              isKeyboardMode &&
                isActive &&
                canOpenLink &&
                "translate-x-0.5 -translate-y-0.5 opacity-100",
            )}
            aria-hidden="true"
          />
        </span>
      </h3>
      <div className="mt-2.5 grid w-full min-w-0 grid-cols-1">
        <TemplateDescriptionText
          duration={textWidthDuration}
          isVisible={!isActive}
          width={TEMPLATE_DESCRIPTION_WIDTH.inactive}
        >
          {item.description}
        </TemplateDescriptionText>
        <TemplateDescriptionText
          duration={textWidthDuration}
          isVisible={isActive}
          width={TEMPLATE_DESCRIPTION_WIDTH.active}
        >
          {item.description}
        </TemplateDescriptionText>
      </div>
      <div
        className="bg-db-oat-medium relative mt-6 aspect-video w-full overflow-hidden border border-[#515151] shadow-[0_18px_50px_rgb(0_0_0/0.32)] ease-out"
        style={{ transitionDuration: `${imageDuration}s` }}
      >
        <TemplatePreviewImage
          lightUrl={item.lightUrl}
          alt={gt("{title} preview", { title: item.title })}
          fallback={<FallbackCardArt index={index} />}
          preload={index === 0}
        />
      </div>
    </Link>
  );
}

export function TemplateSlider({
  sectionRef,
  settings,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  settings?: TemplateSliderSettings;
}) {
  const gt = useGT();
  const { showDrafts: includeDrafts } = useFeatureFlags();
  const templateItems = useMemo(
    () => buildHomeTemplateCardItems(includeDrafts),
    [includeDrafts],
  );
  const slider = useTemplateSlider({
    itemCount: templateItems.length,
    sectionRef,
    settings,
  });
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);
  const [keyboardPressedArrow, setKeyboardPressedArrow] = useState<
    "previous" | "next" | null
  >(null);
  const keyboardPressTimeoutRef = useRef<number | null>(null);
  const openActiveTemplate = useCallback(() => {
    const activeItem = templateItems[slider.activeCarouselIndex];

    if (activeItem) {
      window.location.href = activeItem.href;
    }
  }, [templateItems, slider.activeCarouselIndex]);
  const showKeyboardArrowPress = useCallback((arrow: "previous" | "next") => {
    if (keyboardPressTimeoutRef.current !== null) {
      window.clearTimeout(keyboardPressTimeoutRef.current);
    }

    setKeyboardPressedArrow(arrow);
    keyboardPressTimeoutRef.current = window.setTimeout(() => {
      setKeyboardPressedArrow(null);
      keyboardPressTimeoutRef.current = null;
    }, 160);
  }, []);

  const handleArrowButtonKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setIsKeyboardMode(true);
      showKeyboardArrowPress("previous");
      slider.handlePreviousSlide();
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      setIsKeyboardMode(true);
      showKeyboardArrowPress("next");
      slider.handleNextSlide();
      return;
    }
  };

  useEffect(() => {
    const sectionElement = sectionRef.current;

    if (!sectionElement || !slider.isAutoplayInViewport) return;

    const handleSectionKeyDown = (event: globalThis.KeyboardEvent) => {
      const target = event.target;
      const focusedElement = document.activeElement;

      if (
        !(focusedElement instanceof HTMLElement) ||
        !sectionElement.contains(focusedElement)
      ) {
        return;
      }

      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["BUTTON", "INPUT", "SELECT", "TEXTAREA", "A"].includes(
            target.tagName,
          ))
      ) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setIsKeyboardMode(true);
        showKeyboardArrowPress("previous");
        slider.handlePreviousSlide();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setIsKeyboardMode(true);
        showKeyboardArrowPress("next");
        slider.handleNextSlide();
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        setIsKeyboardMode(true);
        openActiveTemplate();
        return;
      }
    };

    window.addEventListener("keydown", handleSectionKeyDown);

    return () => {
      window.removeEventListener("keydown", handleSectionKeyDown);
    };
  }, [
    openActiveTemplate,
    sectionRef,
    showKeyboardArrowPress,
    slider.handleNextSlide,
    slider.handlePreviousSlide,
    slider.isAutoplayInViewport,
  ]);

  useEffect(() => {
    return () => {
      if (keyboardPressTimeoutRef.current !== null) {
        window.clearTimeout(keyboardPressTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="group @container"
      onMouseEnter={() => slider.setIsAutoplayPaused(true)}
      onMouseLeave={() => slider.setIsAutoplayPaused(false)}
      onPointerDown={() => setIsKeyboardMode(false)}
      onPointerMove={() => setIsKeyboardMode(false)}
    >
      <div className="mx-auto flex w-full max-w-400 flex-col px-5 md:px-8">
        <div className="mt-9 flex items-center gap-5">
          <Button
            aria-label={gt("Previous slide")}
            aria-disabled={slider.isPreviousSlideDisabled}
            onClick={slider.handlePreviousSlide}
            onKeyDown={handleArrowButtonKeyDown}
            className={cn(
              "static size-11 translate-0 rounded-none shadow-none transition-colors duration-150",
              slider.isPreviousSlideDisabled
                ? "border border-white/25 bg-transparent text-white/35 hover:border-white/25 hover:bg-transparent hover:text-white/35"
                : "border-db-lava-light bg-db-lava-light hover:border-db-lava hover:bg-db-lava focus-visible:ring-db-cyan border text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121317]",
              keyboardPressedArrow === "previous" &&
                !slider.isPreviousSlideDisabled &&
                "border-db-lava bg-db-lava text-white transition-none",
              "[&_svg]:size-6",
            )}
          >
            <SliderArrowIcon className="size-6 rotate-180" />
          </Button>
          <Button
            aria-label={gt("Next slide")}
            aria-disabled={slider.isNextSlideDisabled}
            onClick={slider.handleNextSlide}
            onKeyDown={handleArrowButtonKeyDown}
            className={cn(
              "static size-11 translate-0 rounded-none shadow-none transition-colors duration-150",
              slider.isNextSlideDisabled
                ? "border border-white/25 bg-transparent text-white/35 hover:border-white/25 hover:bg-transparent hover:text-white/35"
                : "border-db-lava-light bg-db-lava-light hover:border-db-lava hover:bg-db-lava focus-visible:ring-db-cyan border text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121317]",
              keyboardPressedArrow === "next" &&
                !slider.isNextSlideDisabled &&
                "border-db-lava bg-db-lava text-white transition-none",
              "[&_svg]:size-6",
            )}
          >
            <SliderArrowIcon className="size-6" />
          </Button>
        </div>
      </div>
      <div className="relative mt-12 overflow-hidden md:mt-14 lg:mt-10.5">
        <LazyMotion features={domAnimation}>
          <div
            className={cn(
              "@container mx-auto w-full max-w-400 px-5 transition-opacity duration-150 md:px-8",
              slider.shouldUseNativeScroll
                ? "snap-x snap-mandatory scroll-pr-5 scroll-pl-5 scrollbar-none overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth [-webkit-overflow-scrolling:touch] md:scroll-pr-8 md:scroll-pl-8 [&::-webkit-scrollbar]:hidden"
                : "overflow-visible",
              slider.isCarouselMeasured
                ? "opacity-100"
                : "pointer-events-none opacity-0",
            )}
            data-template-slider-viewport
            ref={slider.carouselViewportRef}
            onPointerDown={
              slider.shouldUseNativeScroll
                ? slider.handleNativeCarouselPointerDown
                : undefined
            }
            onPointerCancel={
              slider.shouldUseNativeScroll
                ? slider.handleNativeCarouselPointerRelease
                : undefined
            }
            onPointerLeave={
              slider.shouldUseNativeScroll
                ? slider.handleNativeCarouselPointerRelease
                : undefined
            }
            onPointerUp={
              slider.shouldUseNativeScroll
                ? slider.handleNativeCarouselPointerRelease
                : undefined
            }
            onScroll={
              slider.shouldUseNativeScroll
                ? slider.handleNativeCarouselScroll
                : undefined
            }
          >
            <m.div
              animate={{ x: slider.shouldUseNativeScroll ? 0 : slider.trackX }}
              className={cn(
                "flex min-h-[65vw] w-max md:min-h-88 lg:min-h-112 2xl:min-h-120",
                slider.shouldUseNativeScroll
                  ? "cursor-auto touch-auto"
                  : "cursor-grab touch-pan-y active:cursor-grabbing",
              )}
              initial={false}
              ref={slider.carouselTrackRef}
              onPointerCancel={
                slider.shouldUseNativeScroll
                  ? undefined
                  : slider.handleCarouselPointerCancel
              }
              onPointerDown={
                slider.shouldUseNativeScroll
                  ? undefined
                  : slider.handleCarouselPointerDown
              }
              onPointerLeave={
                slider.shouldUseNativeScroll
                  ? undefined
                  : slider.handleCarouselPointerLeave
              }
              onPointerMove={
                slider.shouldUseNativeScroll
                  ? undefined
                  : slider.handleCarouselPointerMove
              }
              onPointerUp={
                slider.shouldUseNativeScroll
                  ? undefined
                  : slider.handleCarouselPointerUp
              }
              style={{ columnGap: slider.cardGap }}
              transition={
                slider.shouldAnimateTrack
                  ? slider.trackTransition
                  : { duration: 0 }
              }
            >
              {templateItems.map((item, index) => {
                const isActive = slider.activeCarouselIndex === index;
                const indexDistance = index - slider.activeCarouselIndex;
                const isVisibleCard = slider.shouldUseTwoFullCardsLayout
                  ? indexDistance >= 0 && indexDistance <= 1
                  : slider.shouldUseThreeCardLayout
                    ? Math.abs(indexDistance) <= 1
                    : isActive;
                const isInitialLeadingPartialCard =
                  slider.shouldUseThreeCardLayout && !slider.hasCarouselMoved
                    ? index < slider.activeCarouselIndex - 1
                    : !slider.hasCarouselMoved && indexDistance < 0;

                return (
                  <m.div
                    animate={{
                      opacity:
                        !slider.hasCarouselMoved && isInitialLeadingPartialCard
                          ? 0
                          : isVisibleCard
                            ? 1
                            : 0.5,
                    }}
                    data-active={isActive}
                    className={cn(
                      "pointer-events-auto flex w-[var(--template-card-width)] shrink-0 flex-col justify-end overflow-hidden transition-[width] ease-out will-change-transform [contain:layout_paint]",
                      slider.shouldUseNativeScroll && "snap-start",
                      "[--template-card-width:min(72cqw,22.5rem)]",
                      "md:[--template-card-width:min(calc((100cqw-1.5rem)/2),36rem)]",
                      "xl:[--template-card-width:21.5rem] 2xl:[--template-card-width:28rem]",
                      "data-[active=true]:xl:[--template-card-width:28rem] data-[active=true]:2xl:[--template-card-width:36rem]",
                      isActive && "relative z-10",
                    )}
                    initial={false}
                    key={item.id}
                    onClickCapture={(event) =>
                      slider.handleCarouselClickCapture(
                        event,
                        index,
                        isVisibleCard,
                      )
                    }
                    style={{
                      transitionDuration: `${
                        settings?.cardResizeDuration ?? 0.5
                      }s`,
                    }}
                    transition={slider.cardTransition}
                  >
                    <TemplateCarouselCard
                      item={item}
                      index={index}
                      isActive={isActive}
                      canOpenLink={isVisibleCard}
                      isKeyboardMode={isKeyboardMode}
                      imageDuration={settings?.cardDuration ?? 0.5}
                      textWidthDuration={settings?.textWidthDuration ?? 0.5}
                    />
                  </m.div>
                );
              })}
            </m.div>
          </div>
        </LazyMotion>
      </div>
    </div>
  );
}
