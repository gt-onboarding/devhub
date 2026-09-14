"use client";

import type { ReactNode } from "react";
import { msg, useGT, useMessages } from "gt-next";
import { domAnimation, LazyMotion } from "motion/react";
import * as m from "motion/react-m";

import { cn } from "@/lib/utils";
import { FeatureInfographicCard } from "@/components/ui/feature-card";

import { useFeatureInfographicVisibility } from "./use-feature-infographic-visibility";

const appLogoSrc = "/img/home/features/db-apps-logo.svg";
const browserGraphOneSrc = "/img/home/features/db-apps-graph.svg";
const browserGraphTwoSrc = "/img/home/features/db-apps-graph-2.svg";
const sparklesIconSrc = "/img/home/features/sparkles-icon.svg";
const STEP_MOVE_DURATION = 0.68;
const DEPLOYING_WORD = "Deploying";
const DEPLOYING_TYPE_DELAY = 0.08;
const DEPLOYING_TYPE_DURATION = 0.25;
const DEPLOYING_STEP_INDEX = 1;
const DEPLOYING_STEP_DELAY = 0.16;
const DEPLOYING_TYPE_END_DELAY =
  DEPLOYING_STEP_DELAY + DEPLOYING_TYPE_DELAY + DEPLOYING_TYPE_DURATION;
const BROWSER_URL = "https://app.databricks.com/my-app";
const BROWSER_STEP_INDEX = 2;
const BROWSER_URL_TYPE_DELAY = 0.12;
const BROWSER_URL_TYPE_DURATION = 0.25;
const BROWSER_CONTENT_DELAY =
  BROWSER_URL_TYPE_DELAY + BROWSER_URL_TYPE_DURATION + 0.1;
const BROWSER_CONTENT_STAGGER = 0.08;
const BROWSER_CONTENT_DURATION = 0.26;
const BROWSER_CONTENT_INITIAL_Y = 10;
const BROWSER_CARD_SHIMMER_DELAY = 0.14;
const BROWSER_CARD_SHIMMER_DURATION = 1.25;
const BROWSER_LOADED_ASSET_OVERLAP = 0.42;
const BROWSER_LOADED_ASSET_DURATION = 0.34;
const BROWSER_LOADED_ASSET_INITIAL_Y = -6;
const STEP_MOVE_DELAYS = [0, 0.16, 0.54] as const;
const BROWSER_LOADED_ASSET_REVEAL_DELAY =
  STEP_MOVE_DELAYS[BROWSER_STEP_INDEX] +
  BROWSER_CONTENT_DELAY +
  BROWSER_CONTENT_STAGGER * 5 +
  BROWSER_CARD_SHIMMER_DELAY +
  BROWSER_CARD_SHIMMER_DURATION -
  BROWSER_LOADED_ASSET_OVERLAP;
const DEPLOY_SUCCESS_DELAY = BROWSER_LOADED_ASSET_REVEAL_DELAY - 0.35;
const DEPLOY_ICON_CROSSFADE_DURATION = 0.18;
const CHECK_PATH_DRAW_DURATION = 0.36;
const DEPLOY_TEXT_EXIT_DURATION = 0.5;
const DEPLOY_TEXT_ENTER_DURATION = 0.7;
const DEPLOY_TEXT_EASE = [0.16, 1, 0.3, 1] as const;
const DEPLOY_TEXT_EXIT_EASE = [0.7, 0, 0.84, 0] as const;
const STEP_MOVE_EASE = [0.17, -0.17, 0, 1] as const;
const STEP_INITIAL_Y_BY_INDEX = [-10, -12, -18] as const;
const CONNECTOR_LINE_DELAY = 0.18;
const CONNECTOR_LINE_DURATION = 0.24;
const TEXT_LINE_INITIAL_Y = 8;
const TEXT_LINE_STAGGER = 0.055;
const TEXT_LINE_DURATION = 0.24;
const TEXT_LINE_DELAY = 0.08;
const TEXT_LINE_EASE = [0.22, 1, 0.36, 1] as const;
const TERMINAL_CURSOR_LINE_INDEX = 3;
const TERMINAL_LINES = [
  {
    id: "command",
    className: "text-black",
    content: "$ dbx deploy",
  },
  {
    id: "connecting",
    className: "mt-4 text-black/45",
    content: msg("Connecting to workspace..."),
  },
  {
    id: "uploading",
    className: "mt-1 text-black/45",
    content: msg("Uploading app..."),
  },
  {
    id: "linking",
    className: "mt-1 text-black/45",
    content: msg("Linking data sources..."),
  },
] as const;

type AnimatedAppsStepProps = {
  children: ReactNode;
  className?: string;
  isVisible: boolean;
  reduceMotion: boolean;
  stepIndex: number;
};

type AnimatedConnectorLineProps = {
  className?: string;
  isVisible: boolean;
  reduceMotion: boolean;
  stepIndex: number;
};

function getStepDelay(stepIndex: number) {
  return STEP_MOVE_DELAYS[stepIndex] ?? STEP_MOVE_DELAYS[2];
}

function getStepInitialY(stepIndex: number) {
  return STEP_INITIAL_Y_BY_INDEX[stepIndex] ?? -18;
}

function getStepTransition(stepIndex: number) {
  return {
    delay: getStepDelay(stepIndex),
    duration: STEP_MOVE_DURATION,
    ease: STEP_MOVE_EASE,
  };
}

function getConnectorLineTransition(stepIndex: number) {
  return {
    delay:
      stepIndex === DEPLOYING_STEP_INDEX
        ? DEPLOYING_TYPE_END_DELAY
        : getStepDelay(stepIndex) + CONNECTOR_LINE_DELAY,
    duration: CONNECTOR_LINE_DURATION,
  };
}

function getTextLineTransition(stepIndex: number, lineIndex: number) {
  return {
    delay:
      getStepDelay(stepIndex) + TEXT_LINE_DELAY + lineIndex * TEXT_LINE_STAGGER,
    duration: TEXT_LINE_DURATION,
    ease: TEXT_LINE_EASE,
  };
}

function getTerminalCursorTransition() {
  return {
    delay:
      getStepDelay(0) +
      TEXT_LINE_DELAY +
      TERMINAL_CURSOR_LINE_INDEX * TEXT_LINE_STAGGER,
    duration: 0.75,
    repeat: 2,
    repeatDelay: 0.12,
    times: [0, 0.45, 0.55, 1],
  };
}

function getDeployingCharacterTransition(characterIndex: number) {
  return {
    delay:
      getStepDelay(DEPLOYING_STEP_INDEX) +
      DEPLOYING_TYPE_DELAY +
      characterIndex *
        (DEPLOYING_TYPE_DURATION / Math.max(DEPLOYING_WORD.length - 1, 1)),
    duration: 0.01,
  };
}

function getLoadingDotTransition(dotIndex: number) {
  if (dotIndex === 0) {
    return {
      delay: DEPLOYING_TYPE_END_DELAY,
      duration: 0.01,
    };
  }

  return {
    delay: DEPLOYING_TYPE_END_DELAY + dotIndex * 0.08,
    duration: 0.72,
    repeat: Infinity,
    repeatDelay: 0,
    times: [0, 0.22, 0.58, 1],
  };
}

function getBrowserUrlCharacterTransition(characterIndex: number) {
  return {
    delay:
      getStepDelay(BROWSER_STEP_INDEX) +
      BROWSER_URL_TYPE_DELAY +
      characterIndex *
        (BROWSER_URL_TYPE_DURATION / Math.max(BROWSER_URL.length - 1, 1)),
    duration: 0.01,
  };
}

function getBrowserContentTransition(itemIndex: number) {
  return {
    delay:
      getStepDelay(BROWSER_STEP_INDEX) +
      BROWSER_CONTENT_DELAY +
      itemIndex * BROWSER_CONTENT_STAGGER,
    duration: BROWSER_CONTENT_DURATION,
    ease: TEXT_LINE_EASE,
  };
}

function getBrowserCardShimmerTransition(itemIndex: number) {
  return {
    delay:
      getStepDelay(BROWSER_STEP_INDEX) +
      BROWSER_CONTENT_DELAY +
      itemIndex * BROWSER_CONTENT_STAGGER +
      BROWSER_CARD_SHIMMER_DELAY,
    duration: BROWSER_CARD_SHIMMER_DURATION,
    ease: [0.16, 1, 0.3, 1] as const,
  };
}

function getBrowserLoadedAssetTransition() {
  return {
    delay: BROWSER_LOADED_ASSET_REVEAL_DELAY,
    duration: BROWSER_LOADED_ASSET_DURATION,
    ease: TEXT_LINE_EASE,
  };
}

function AnimatedAppsStep({
  children,
  className,
  isVisible,
  reduceMotion,
  stepIndex,
}: AnimatedAppsStepProps) {
  return (
    <m.div
      animate={isVisible && !reduceMotion ? { opacity: 1, y: 0 } : undefined}
      className={className}
      initial={
        reduceMotion ? false : { opacity: 0, y: getStepInitialY(stepIndex) }
      }
      transition={getStepTransition(stepIndex)}
    >
      {children}
    </m.div>
  );
}

function AnimatedTextLine({
  children,
  className,
  isVisible,
  lineIndex,
  reduceMotion,
  stepIndex,
}: {
  children: ReactNode;
  className?: string;
  isVisible: boolean;
  lineIndex: number;
  reduceMotion: boolean;
  stepIndex: number;
}) {
  return (
    <m.span
      animate={isVisible && !reduceMotion ? { opacity: 1, y: 0 } : undefined}
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: TEXT_LINE_INITIAL_Y }}
      transition={getTextLineTransition(stepIndex, lineIndex)}
    >
      {children}
    </m.span>
  );
}

function AnimatedConnectorLine({
  className,
  isVisible,
  reduceMotion,
  stepIndex,
}: AnimatedConnectorLineProps) {
  return (
    <m.div
      animate={isVisible && !reduceMotion ? { opacity: 1 } : undefined}
      className={cn(
        "h-10 border-l border-dashed border-black @md/infographic:h-14",
        className,
      )}
      initial={reduceMotion ? false : { opacity: 0 }}
      transition={getConnectorLineTransition(stepIndex)}
    />
  );
}

function TerminalCursor({
  isVisible,
  reduceMotion,
}: {
  isVisible: boolean;
  reduceMotion: boolean;
}) {
  if (reduceMotion) {
    return <span className="text-black">█</span>;
  }

  return (
    <m.span
      animate={isVisible ? { opacity: [1, 1, 0, 0] } : undefined}
      className="text-black"
      transition={getTerminalCursorTransition()}
    >
      █
    </m.span>
  );
}

function DeployStatusIcon({
  isVisible,
  reduceMotion,
}: {
  isVisible: boolean;
  reduceMotion: boolean;
}) {
  if (reduceMotion) {
    return (
      <svg
        aria-hidden="true"
        className="size-4 shrink-0"
        fill="none"
        viewBox="0 0 16 16"
      >
        <path
          d="M3.5 8.5L6 11L12.5 4.5"
          stroke="#00A972"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  }

  return (
    <span className="relative size-4 shrink-0">
      <m.img
        animate={isVisible ? { opacity: [1, 1, 0] } : undefined}
        src={sparklesIconSrc}
        alt=""
        className="absolute inset-0 size-4"
        initial={{ opacity: 1 }}
        transition={{
          delay: DEPLOY_SUCCESS_DELAY,
          duration: DEPLOY_ICON_CROSSFADE_DURATION,
          times: [0, 0.2, 1],
        }}
        width={16}
        height={16}
        loading="lazy"
        decoding="async"
      />
      <m.svg
        animate={isVisible ? { opacity: 1, scale: 1 } : undefined}
        aria-hidden="true"
        className="absolute inset-0 size-4"
        fill="none"
        initial={{ opacity: 0, scale: 0.92 }}
        transition={{
          delay: DEPLOY_SUCCESS_DELAY + 0.2,
          duration: DEPLOY_ICON_CROSSFADE_DURATION,
          ease: DEPLOY_TEXT_EASE,
        }}
        viewBox="0 0 16 16"
      >
        <m.path
          animate={isVisible ? { pathLength: 1 } : undefined}
          d="M3.5 8.5L6 11L12.5 4.5"
          initial={{ pathLength: 0 }}
          stroke="#00A972"
          strokeLinejoin="round"
          strokeWidth="2"
          transition={{
            delay: DEPLOY_SUCCESS_DELAY + 0.3,
            duration: CHECK_PATH_DRAW_DURATION,
            ease: DEPLOY_TEXT_EASE,
          }}
        />
      </m.svg>
    </span>
  );
}

function LoadingDots({
  isVisible,
  reduceMotion,
}: {
  isVisible: boolean;
  reduceMotion: boolean;
}) {
  if (reduceMotion) {
    return <span>...</span>;
  }

  return (
    <span aria-hidden="true">
      {[0, 1, 2].map((dotIndex) => (
        <m.span
          animate={
            isVisible
              ? {
                  opacity: dotIndex === 0 ? 1 : [0, 1, 1, 0],
                }
              : undefined
          }
          initial={{ opacity: 0 }}
          key={dotIndex}
          transition={getLoadingDotTransition(dotIndex)}
        >
          .
        </m.span>
      ))}
    </span>
  );
}

function DeployingText({
  isVisible,
  reduceMotion,
}: {
  isVisible: boolean;
  reduceMotion: boolean;
}) {
  const gt = useGT();
  const deployingWord = gt("Deploying");
  const deployingLabel = gt("Deploying...");
  const deployedLabel = gt("Deployed");

  if (reduceMotion) {
    return <span>{deployedLabel}</span>;
  }

  return (
    <span
      aria-live="polite"
      className="relative inline-block w-[8ch] text-center whitespace-nowrap"
    >
      <m.span
        animate={isVisible ? { opacity: [1, 1, 0], y: [0, 0, -6] } : undefined}
        aria-label={deployingLabel}
        className="absolute top-0 left-1/2 -translate-x-1/2"
        initial={{ opacity: 1, y: 0 }}
        transition={{
          delay: DEPLOY_SUCCESS_DELAY,
          duration: DEPLOY_TEXT_EXIT_DURATION,
          ease: DEPLOY_TEXT_EXIT_EASE,
          times: [0, 0.12, 1],
        }}
      >
        {Array.from(deployingWord).map((character, index) => (
          <m.span
            animate={isVisible ? { opacity: 1 } : undefined}
            initial={{ opacity: 0 }}
            key={`${character}-${index}`}
            transition={getDeployingCharacterTransition(index)}
          >
            {character}
          </m.span>
        ))}
        <LoadingDots isVisible={isVisible} reduceMotion={reduceMotion} />
      </m.span>
      <span className="invisible ml-5 block">{deployingLabel}</span>
      <m.span
        animate={isVisible ? { opacity: 1, x: 0, y: 0 } : undefined}
        className="absolute top-0 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, x: 0, y: 8 }}
        transition={{
          delay: DEPLOY_SUCCESS_DELAY + DEPLOY_TEXT_EXIT_DURATION - 0.17 + 0.07,
          duration: DEPLOY_TEXT_ENTER_DURATION,
          ease: DEPLOY_TEXT_EASE,
        }}
      >
        <span className="relative -left-0.5">{deployedLabel}</span>
      </m.span>
    </span>
  );
}

function BrowserUrlText({
  isVisible,
  reduceMotion,
}: {
  isVisible: boolean;
  reduceMotion: boolean;
}) {
  if (reduceMotion) {
    return <span>{BROWSER_URL}</span>;
  }

  return (
    <span aria-label={BROWSER_URL}>
      {Array.from(BROWSER_URL).map((character, index) => (
        <m.span
          animate={isVisible ? { opacity: 1 } : undefined}
          initial={{ opacity: 0 }}
          key={`${character}-${index}`}
          transition={getBrowserUrlCharacterTransition(index)}
        >
          {character}
        </m.span>
      ))}
    </span>
  );
}

function AnimatedBrowserElement({
  children,
  className,
  isVisible,
  itemIndex,
  reduceMotion,
}: {
  children: ReactNode;
  className?: string;
  isVisible: boolean;
  itemIndex: number;
  reduceMotion: boolean;
}) {
  return (
    <m.div
      animate={isVisible && !reduceMotion ? { opacity: 1, y: 0 } : undefined}
      className={className}
      initial={
        reduceMotion ? false : { opacity: 0, y: BROWSER_CONTENT_INITIAL_Y }
      }
      transition={getBrowserContentTransition(itemIndex)}
    >
      {children}
    </m.div>
  );
}

function Placeholder({ className }: { className: string }) {
  return (
    <div
      className={cn(
        "h-1.5 shrink-0 rounded-full bg-[#E9E7E4] @sm/infographic:h-2",
        className,
      )}
    />
  );
}

function BrowserCardLoadingLayer({
  isVisible,
  itemIndex,
  reduceMotion,
}: {
  isVisible: boolean;
  itemIndex: number;
  reduceMotion: boolean;
}) {
  if (reduceMotion) {
    return (
      <div className="absolute inset-0 bg-linear-[125deg] from-[#F1EFEC] from-20% via-white via-45% to-[#F1EFEC] to-80%" />
    );
  }

  return (
    <m.div
      animate={isVisible ? { opacity: [1, 1, 0] } : undefined}
      className="absolute inset-0"
      initial={{ opacity: 1 }}
      transition={{
        delay: BROWSER_LOADED_ASSET_REVEAL_DELAY - 0.1,
        duration: 0.3,
        times: [0, 0.3, 1],
      }}
    >
      <div className="absolute inset-0 bg-[#F8F7F5]" />
      <m.div
        animate={
          isVisible
            ? {
                opacity: [0, 0.9, 0],
                x: ["-140%", "140%"],
              }
            : undefined
        }
        className="absolute inset-y-0 left-0 w-2/3 bg-linear-[110deg] from-transparent from-10% via-white via-50% to-transparent to-90%"
        initial={{ opacity: 0, x: "-140%" }}
        transition={getBrowserCardShimmerTransition(itemIndex)}
      />
    </m.div>
  );
}

function BrowserLoadedAsset({
  alt,
  className,
  height,
  isVisible,
  reduceMotion,
  src,
  width,
}: {
  alt: string;
  className?: string;
  height: number;
  isVisible: boolean;
  itemIndex: number;
  reduceMotion: boolean;
  src: string;
  width: number;
}) {
  return (
    <m.img
      animate={isVisible && !reduceMotion ? { opacity: 1, y: 0 } : undefined}
      alt={alt}
      className={className}
      decoding="async"
      height={height}
      initial={
        reduceMotion ? false : { opacity: 0, y: BROWSER_LOADED_ASSET_INITIAL_Y }
      }
      loading="lazy"
      src={src}
      transition={getBrowserLoadedAssetTransition()}
      width={width}
    />
  );
}

export function DatabricksAppsInfographic() {
  const messages = useMessages();
  const { infographicRef, isVisible, reduceMotion } =
    useFeatureInfographicVisibility();

  return (
    <LazyMotion features={domAnimation}>
      <div
        className="@container/infographic flex w-full flex-col items-center gap-y-1 py-6 font-sans text-black md:min-h-0 md:py-18"
        ref={infographicRef}
      >
        <AnimatedAppsStep
          isVisible={isVisible}
          reduceMotion={reduceMotion}
          stepIndex={0}
        >
          <FeatureInfographicCard className="flex w-67.5 flex-col px-4 py-3 font-mono text-sm/snug tracking-tight @md/infographic:p-3 @md/infographic:text-[13px]/snug">
            {TERMINAL_LINES.map(({ className, content, id }, index) => (
              <AnimatedTextLine
                className={className}
                isVisible={isVisible}
                key={id}
                lineIndex={index}
                reduceMotion={reduceMotion}
                stepIndex={0}
              >
                {id === "command" ? content : messages(content)}
                {id === "linking" ? (
                  <>
                    {" "}
                    <TerminalCursor
                      isVisible={isVisible}
                      reduceMotion={reduceMotion}
                    />
                  </>
                ) : null}
              </AnimatedTextLine>
            ))}
          </FeatureInfographicCard>
        </AnimatedAppsStep>
        <AnimatedConnectorLine
          isVisible={isVisible}
          reduceMotion={reduceMotion}
          stepIndex={0}
        />
        <AnimatedAppsStep
          isVisible={isVisible}
          reduceMotion={reduceMotion}
          stepIndex={1}
        >
          <div className="flex h-8 shrink-0 items-center justify-center gap-1.5 border border-black/10 bg-white pr-3 pl-2.5 text-[11px] font-medium tracking-[-0.02em] shadow-[0_.625rem_1.25rem_rgba(0,0,0,.06)] @md/infographic:gap-1.5 @md/infographic:text-[13px]">
            <DeployStatusIcon
              isVisible={isVisible}
              reduceMotion={reduceMotion}
            />
            <DeployingText isVisible={isVisible} reduceMotion={reduceMotion} />
          </div>
        </AnimatedAppsStep>
        <AnimatedConnectorLine
          isVisible={isVisible}
          reduceMotion={reduceMotion}
          stepIndex={1}
        />

        <AnimatedAppsStep
          className="w-full max-w-lg"
          isVisible={isVisible}
          reduceMotion={reduceMotion}
          stepIndex={2}
        >
          <FeatureInfographicCard className="w-full overflow-hidden">
            <div className="relative flex items-center border-b border-[#D4D2CF] bg-[#F0EEEB] px-3 py-1.5 @md/infographic:px-4">
              <div className="absolute top-1/2 left-3 flex -translate-y-1/2 gap-x-1.5">
                <span className="bg-orange size-2.5 shrink-0 rounded-full" />
                <span className="size-2.5 shrink-0 rounded-full bg-[#CCCAC6]" />
                <span className="size-2.5 shrink-0 rounded-full bg-[#00A972]" />
              </div>
              <span className="ml-auto flex h-5 w-44 items-center justify-center bg-white text-[9px] tracking-tight text-black/80 @xs/infographic:mx-auto @md/infographic:h-5.5 @md/infographic:w-56 @md/infographic:text-[10px]">
                <BrowserUrlText
                  isVisible={isVisible}
                  reduceMotion={reduceMotion}
                />
              </span>
            </div>
            <div className="flex flex-col bg-white p-4 @md/infographic:p-6">
              <div className="flex items-start justify-between">
                <div className="flex flex-row gap-2.5 @sm/infographic:gap-3">
                  <AnimatedBrowserElement
                    className="relative"
                    isVisible={isVisible}
                    itemIndex={0}
                    reduceMotion={reduceMotion}
                  >
                    <Placeholder className="size-5 rounded bg-[#EEEDE9] @sm/infographic:size-7" />
                    <span className="absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 @sm/infographic:size-3.5">
                      <BrowserLoadedAsset
                        alt=""
                        className="size-full"
                        height={14}
                        isVisible={isVisible}
                        itemIndex={0}
                        reduceMotion={reduceMotion}
                        src={appLogoSrc}
                        width={14}
                      />
                    </span>
                  </AnimatedBrowserElement>
                  <div className="flex flex-col gap-2 @sm/infographic:gap-2.5">
                    <AnimatedBrowserElement
                      isVisible={isVisible}
                      itemIndex={1}
                      reduceMotion={reduceMotion}
                    >
                      <Placeholder className="w-28 @sm/infographic:w-42" />
                    </AnimatedBrowserElement>
                    <AnimatedBrowserElement
                      isVisible={isVisible}
                      itemIndex={2}
                      reduceMotion={reduceMotion}
                    >
                      <Placeholder className="w-20 @sm/infographic:w-30" />
                    </AnimatedBrowserElement>
                  </div>
                </div>
                <AnimatedBrowserElement
                  className="flex items-center gap-2.5 @sm/infographic:gap-4"
                  isVisible={isVisible}
                  itemIndex={3}
                  reduceMotion={reduceMotion}
                >
                  <Placeholder className="w-13" />
                </AnimatedBrowserElement>
              </div>
              <div className="mt-4.5 grid h-[62%] grid-cols-2 gap-4 @sm/infographic:gap-5">
                {[4, 5].map((itemIndex) => (
                  <AnimatedBrowserElement
                    isVisible={isVisible}
                    itemIndex={itemIndex}
                    key={itemIndex}
                    reduceMotion={reduceMotion}
                  >
                    <div className="relative flex aspect-222/183 flex-col justify-between overflow-hidden border border-[#D4D2CF] bg-white p-3">
                      <BrowserCardLoadingLayer
                        isVisible={isVisible}
                        itemIndex={itemIndex}
                        reduceMotion={reduceMotion}
                      />
                      <Placeholder className="relative z-10 w-16.5 bg-[#DCDAD7]" />
                      <BrowserLoadedAsset
                        alt=""
                        className="relative z-10 mt-auto w-full"
                        height={itemIndex === 4 ? 109 : 110}
                        isVisible={isVisible}
                        itemIndex={itemIndex}
                        reduceMotion={reduceMotion}
                        src={
                          itemIndex === 4
                            ? browserGraphOneSrc
                            : browserGraphTwoSrc
                        }
                        width={itemIndex === 4 ? 199 : 198}
                      />
                    </div>
                  </AnimatedBrowserElement>
                ))}
              </div>
            </div>
          </FeatureInfographicCard>
        </AnimatedAppsStep>
      </div>
    </LazyMotion>
  );
}
