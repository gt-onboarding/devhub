"use client";

import type { ReactNode } from "react";
import { Num, T, Var } from "gt-next";
import { Database } from "lucide-react";
import { domAnimation, LazyMotion } from "motion/react";
import * as m from "motion/react-m";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { FeatureInfographicCard } from "@/components/ui/feature-card";

import { useFeatureInfographicVisibility } from "./use-feature-infographic-visibility";

const autoScaleGraphSrc = "/img/home/features/auto-scale-compute.jpg";
const postgresIconSrc = "/img/home/features/postgres-icon.svg";
const CARD_MOVE_DURATION = 0.5;
const CARD_OPACITY_DURATION = 0.1;
const CARD_MOVE_EASE = [0.17, -0.17, 0, 1] as const;
const LOWER_CARD_MOVE_DELAY = 0.16;
const AUTO_SCALE_GRAPH_DELAY = LOWER_CARD_MOVE_DELAY * 0.75;
const AUTO_SCALE_GRAPH_OPACITY_DURATION = 0.12;
const AUTO_SCALE_GRAPH_MOVE_DURATION = 0.32;
const INNER_ANIMATION_DELAY = CARD_MOVE_DURATION / 2;
const INNER_ANIMATION_DURATION = CARD_MOVE_DURATION;
const CHANGELOG_ROW_DURATION = INNER_ANIMATION_DURATION * 1.5;
const INNER_CARD_MOVE_TRANSITION = {
  delay: INNER_ANIMATION_DELAY,
  duration: INNER_ANIMATION_DURATION,
  ease: CARD_MOVE_EASE,
} as const;
const INNER_BRANCH_LINES_TRANSITION = {
  delay: INNER_ANIMATION_DELAY + 0.08,
  duration: 0.24,
} as const;
const CHANGELOG_ROW_STAGGER = 0.035;
const BACKGROUND_SCHEME_DRAW_DELAY = CARD_MOVE_DURATION / 4;
const BACKGROUND_SCHEME_OPACITY_TRANSITION = {
  delay: BACKGROUND_SCHEME_DRAW_DELAY,
  duration: 0.05,
} as const;
const BACKGROUND_SCHEME_DRAW_DURATION = 0.34;
const BACKGROUND_SCHEME_BOX_DURATION = 0.6;
const CHANGELOG_ROWS = [
  ["10:01", "insert", "order #101", "created"],
  ["10:02", "update", "customer #4", "paid"],
  ["10:03", "delete", "order #102", "removed"],
] as const;

type BranchCardProps = {
  className?: string;
  name: string;
  isProductionBranch: boolean;
  size: string;
  tables?: number;
};

type AnimatedInfographicCardProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  isVisible: boolean;
  offsetY?: number;
  reduceMotion: boolean;
  withOpacity?: boolean;
};

type BackgroundSchemeProps = {
  isVisible: boolean;
  reduceMotion: boolean;
};

function getChangelogRowTransition(index: number) {
  const delay = INNER_ANIMATION_DELAY + index * CHANGELOG_ROW_STAGGER;

  return {
    delay,
    duration: CHANGELOG_ROW_DURATION,
    ease: CARD_MOVE_EASE,
  };
}

function AnimatedInfographicCard({
  children,
  className,
  delay = 0,
  isVisible,
  offsetY,
  reduceMotion,
}: AnimatedInfographicCardProps) {
  return (
    <m.div
      animate={isVisible && !reduceMotion ? { opacity: 1, y: 0 } : undefined}
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: offsetY }}
      transition={{
        opacity: {
          delay,
          duration: CARD_OPACITY_DURATION,
        },
        y: {
          delay,
          duration: CARD_MOVE_DURATION,
          ease: CARD_MOVE_EASE,
        },
      }}
    >
      {children}
    </m.div>
  );
}

function AnimatedInnerBranchCard({
  children,
  className,
  isVisible,
  offsetY = -12,
  reduceMotion,
  withOpacity = false,
}: AnimatedInfographicCardProps) {
  return (
    <m.div
      animate={
        isVisible && !reduceMotion
          ? { opacity: withOpacity ? 1 : undefined, y: 0 }
          : undefined
      }
      className={cn("relative z-20", className)}
      initial={
        reduceMotion
          ? false
          : { opacity: withOpacity ? 0 : undefined, y: offsetY }
      }
      transition={{
        opacity: {
          delay: INNER_CARD_MOVE_TRANSITION.delay,
          duration: CARD_OPACITY_DURATION,
        },
        y: INNER_CARD_MOVE_TRANSITION,
      }}
    >
      {children}
    </m.div>
  );
}

function AnimatedInnerBranchLines({
  isVisible,
  reduceMotion,
}: BackgroundSchemeProps) {
  return (
    <m.div
      animate={isVisible && !reduceMotion ? { opacity: 1 } : undefined}
      className="relative z-0 mx-auto w-[55%]"
      initial={reduceMotion ? false : { opacity: 0 }}
      transition={INNER_BRANCH_LINES_TRANSITION}
    >
      <div className="mx-auto h-4.75 w-px bg-black/30" />
      <div className="mx-auto h-4.75 w-full rounded-t-xs border-t border-r border-l border-black/30" />
    </m.div>
  );
}

function BackgroundScheme({ isVisible, reduceMotion }: BackgroundSchemeProps) {
  const shouldAnimate = isVisible && !reduceMotion;

  return (
    <m.div
      animate={shouldAnimate ? { opacity: 1 } : undefined}
      className="absolute inset-y-1 top-0 left-1/2 w-full -translate-x-1/2"
      initial={reduceMotion ? false : { opacity: 0 }}
      transition={BACKGROUND_SCHEME_OPACITY_TRANSITION}
    >
      <m.div
        animate={shouldAnimate ? { clipPath: "inset(0% 0% 0% 0%)" } : undefined}
        className="absolute top-1 left-1/2 h-20 w-px -translate-x-1/2 border-l border-dashed border-black"
        initial={reduceMotion ? false : { clipPath: "inset(0% 0% 100% 0%)" }}
        transition={{
          delay: BACKGROUND_SCHEME_DRAW_DELAY,
          duration: BACKGROUND_SCHEME_DRAW_DURATION,
          ease: CARD_MOVE_EASE,
        }}
      />
      <m.div
        animate={
          shouldAnimate
            ? {
                clipPath: [
                  "inset(0% 50% 100% 50%)",
                  "inset(0% 0% 96% 0%)",
                  "inset(0% 0% 0% 0%)",
                ],
              }
            : undefined
        }
        className="absolute top-10 h-[calc(100%-2.5rem)] w-full rounded-t-xs border-t border-r border-l border-dashed border-black"
        initial={reduceMotion ? false : { clipPath: "inset(0% 50% 100% 50%)" }}
        transition={{
          delay: 0.1,
          duration: BACKGROUND_SCHEME_BOX_DURATION,
          ease: CARD_MOVE_EASE,
          times: [0, 0.8, 1],
        }}
      />
    </m.div>
  );
}

function BranchCard({
  className,
  name,
  isProductionBranch,
  size,
  tables,
}: BranchCardProps) {
  return (
    <div
      className={cn(
        "border border-[#D4D2CF] bg-[#F8F6F3]/40 p-2 pt-1.5",
        className,
      )}
    >
      <div className="flex items-center justify-between text-[9px] @xl/infographic:text-[11px]">
        <span className="inline-flex items-center gap-1 font-medium">
          <Database className="size-2.5 text-black opacity-60" />
          {name}
        </span>
        <Badge
          className={cn(
            "rounded-full border-0 px-1 py-0.25 text-[7px] leading-none font-medium tracking-tight @xl/infographic:px-2.25 @xl/infographic:py-0.75 @xl/infographic:text-[9px]/none",
            isProductionBranch
              ? "bg-[#DDF5ED] text-[#00A972]"
              : "hidden bg-black/11 text-black @sm/infographic:flex",
          )}
        >
          {isProductionBranch ? <T>production</T> : <T>branch</T>}
        </Badge>
      </div>
      <div className="mt-2 flex items-center gap-1 text-[8px] leading-tight tracking-tight whitespace-nowrap text-black/60 @md/infographic:mt-3.5 @md/infographic:gap-2 @md/infographic:text-[10px]">
        <T>
          <span>
            Size: <Var>{size}</Var>
          </span>
        </T>
        {tables && tables > 0 ? (
          <>
            <span>/</span>
            <T>
              <span>
                Tables: <Num>{tables}</Num>
              </span>
            </T>
          </>
        ) : null}
      </div>
    </div>
  );
}

export function LakebaseInfographic() {
  const { infographicRef, isVisible, reduceMotion } =
    useFeatureInfographicVisibility();

  return (
    <LazyMotion features={domAnimation}>
      <div
        className="@container/infographic flex w-full flex-col items-center font-sans text-black md:py-16.5 xl:px-8"
        ref={infographicRef}
      >
        <AnimatedInfographicCard
          isVisible={isVisible}
          offsetY={0}
          reduceMotion={reduceMotion}
        >
          <FeatureInfographicCard className="flex w-3xs shrink-0 items-center gap-2 p-3 @md/infographic:gap-3">
            <div className="grid size-6 shrink-0 place-items-center border border-[#D4D2CF]/50 @md/infographic:size-8">
              <img
                src={postgresIconSrc}
                alt=""
                className="size-5 @md/infographic:size-7"
                width={28}
                height={28}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="flex min-w-0 flex-col gap-y-1">
              <T>
                <h3 className="text-[11px] leading-tight font-medium tracking-[-0.02em] whitespace-nowrap @md/infographic:text-sm/tight">
                  Managed Postgres
                </h3>
                <span className="text-[9px] leading-tight tracking-[-0.02em] whitespace-nowrap text-black/70 @md/infographic:text-[11px]">
                  Colocated with your Lakehouse
                </span>
              </T>
            </div>
          </FeatureInfographicCard>
        </AnimatedInfographicCard>

        <div className="relative flex w-4/5 flex-col gap-y-12 pt-22 pb-12 @md/infographic:w-3/4 @xl/infographic:w-[72%]">
          <BackgroundScheme isVisible={isVisible} reduceMotion={reduceMotion} />

          <AnimatedInfographicCard
            className="relative mx-auto w-4/5 max-w-80 shrink-0 @md/infographic:w-3/4"
            isVisible={isVisible}
            offsetY={-16}
            reduceMotion={reduceMotion}
          >
            <FeatureInfographicCard className="w-full p-1.5 @md/infographic:p-2.5 @xl/infographic:p-4">
              <T>
                <h4 className="text-xs leading-tight font-medium tracking-tight @xl/infographic:text-[13px]">
                  Instant branching
                </h4>
              </T>
              <div className="relative z-20 mx-auto mt-3 w-full max-w-37">
                <BranchCard
                  name="main"
                  isProductionBranch={true}
                  size="500 GB"
                  tables={480}
                />
              </div>
              <AnimatedInnerBranchLines
                isVisible={isVisible}
                reduceMotion={reduceMotion}
              />
              <div className="grid grid-cols-2 gap-2 @md/infographic:gap-4 @xl/infographic:gap-8">
                {["dev", "staging"].map((branch) => (
                  <AnimatedInnerBranchCard
                    key={branch}
                    isVisible={isVisible}
                    reduceMotion={reduceMotion}
                    withOpacity
                  >
                    <BranchCard
                      name={branch}
                      isProductionBranch={false}
                      size={branch === "dev" ? "2 GB" : "0.5 GB"}
                    />
                  </AnimatedInnerBranchCard>
                ))}
              </div>
            </FeatureInfographicCard>
          </AnimatedInfographicCard>
        </div>

        <div className="grid w-full grid-cols-2 gap-4 max-md:mx-auto max-md:w-4/5 @xl/infographic:gap-x-8">
          <AnimatedInfographicCard
            className="h-full"
            delay={LOWER_CARD_MOVE_DELAY}
            isVisible={isVisible}
            offsetY={-16}
            reduceMotion={reduceMotion}
          >
            <FeatureInfographicCard className="flex h-full flex-col p-2 @xl/infographic:p-4">
              <div className="flex flex-col gap-0.5 @md/infographic:flex-row @md/infographic:items-center @md/infographic:justify-between @md/infographic:gap-2">
                <T>
                  <h4 className="text-xs leading-tight font-medium tracking-tight @xl/infographic:text-[13px]">
                    Auto-scale compute
                  </h4>
                  <p className="text-[8px] leading-tight tracking-tight text-black/70 @xl/infographic:text-[11px]">
                    Current load:{" "}
                    <span className="font-medium text-black">65%</span>
                  </p>
                </T>
              </div>
              <m.img
                animate={
                  isVisible && !reduceMotion ? { opacity: 1, y: 0 } : undefined
                }
                src={autoScaleGraphSrc}
                alt=""
                className="mt-2 block min-h-0 flex-1 @xl/infographic:mt-5"
                initial={reduceMotion ? false : { opacity: 0, y: -6 }}
                transition={{
                  opacity: {
                    delay: AUTO_SCALE_GRAPH_DELAY,
                    duration: AUTO_SCALE_GRAPH_OPACITY_DURATION,
                  },
                  y: {
                    delay: AUTO_SCALE_GRAPH_DELAY,
                    duration: AUTO_SCALE_GRAPH_MOVE_DURATION,
                    ease: CARD_MOVE_EASE,
                  },
                }}
                width={282}
                height={129}
                loading="lazy"
                decoding="async"
              />
            </FeatureInfographicCard>
          </AnimatedInfographicCard>

          <AnimatedInfographicCard
            className="h-full"
            delay={LOWER_CARD_MOVE_DELAY}
            isVisible={isVisible}
            offsetY={-16}
            reduceMotion={reduceMotion}
          >
            <FeatureInfographicCard className="flex h-full flex-col overflow-hidden p-2 @xl/infographic:p-4 @xl/infographic:pb-2">
              <T>
                <h4 className="text-xs leading-tight font-medium tracking-tight @xl/infographic:text-[13px]">
                  Database changelog
                </h4>
                <div className="mt-2 grid grid-cols-[0.9fr_1.15fr_1.35fr_1fr] bg-[#F8F6F3] px-1 py-1 text-[6px] leading-none text-black/50 uppercase @md/infographic:text-[7px] @xl/infographic:mt-5 @xl/infographic:px-2.5 @xl/infographic:py-2 @xl/infographic:text-[9px]">
                  <span>Time</span>
                  <span>Operation</span>
                  <span>Entity</span>
                  <span>Change</span>
                </div>
              </T>
              <div className="mt-1 flex-1">
                {CHANGELOG_ROWS.map(
                  ([time, operation, entity, change], index) => (
                    <m.div
                      animate={
                        isVisible && !reduceMotion
                          ? { opacity: 1, y: 0 }
                          : undefined
                      }
                      initial={reduceMotion ? false : { opacity: 0, y: -6 }}
                      transition={getChangelogRowTransition(index)}
                      key={time}
                      className="grid grid-cols-[0.9fr_1.15fr_1.35fr_1fr] items-center border-b border-[#ECEBE8] py-1 font-mono text-[7px] leading-none tracking-tight text-black/90 last:border-0 @md/infographic:pt-3 @md/infographic:pb-2 @md/infographic:text-[11px]"
                    >
                      <span className="pl-1 font-mono">{time}</span>
                      <span>
                        <span
                          className={cn(
                            "relative -top-0.25 rounded px-0.5 py-0.25 @md/infographic:px-1 @md/infographic:py-0.5",
                            operation === "insert" &&
                              "bg-[#DDF5ED] text-[#00A972]/90",
                            operation === "update" &&
                              "bg-[#FFE3DE] text-[#FF5F46]/90",
                            operation === "delete" &&
                              "bg-[#ECEBE8] text-black/90",
                          )}
                        >
                          {operation}
                        </span>
                      </span>
                      <span>{entity}</span>
                      <span>{change}</span>
                    </m.div>
                  ),
                )}
              </div>
            </FeatureInfographicCard>
          </AnimatedInfographicCard>
        </div>
      </div>
    </LazyMotion>
  );
}
