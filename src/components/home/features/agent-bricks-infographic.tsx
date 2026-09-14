"use client";

import type { ComponentProps } from "react";
import { T } from "gt-next";
import { Check } from "lucide-react";
import { domAnimation, LazyMotion } from "motion/react";
import * as m from "motion/react-m";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { FeatureInfographicCard } from "@/components/ui/feature-card";

import { useFeatureInfographicVisibility } from "./use-feature-infographic-visibility";

const israelGrantSrc = "/img/home/features/israel-grant.jpg";
const agentBricksIconSrc = "/img/home/features/agent-bricks-icon.svg";
const lockIconSrc = "/img/home/features/lock-icon.svg";

const STEP_MOVE_DURATION = 0.68;
const STEP_MOVE_DELAYS = [0, 0.16, 0.46] as const;
const STEP_MOVE_EASE = [0.17, -0.17, 0, 1] as const;
const STEP_INITIAL_Y_BY_INDEX = [-10, -15, -20] as const;
const CONNECTOR_LINE_DELAY = 0.18;
const CONNECTOR_LINE_DURATION = 0.24;
const CONTENT_LINE_INITIAL_Y = 4;
const CONTENT_LINE_STAGGER = 0.085;
const CONTENT_LINE_DURATION = 0.46;
const CONTENT_LINE_DELAY = 0.08;
const CONTENT_LINE_EASE = [0.16, 1, 0.3, 1] as const;
const AGENT_BRICKS_PROGRESS_LINES = [
  {
    id: "selecting-llm",
    content: (
      <T>
        <span>Selecting best-fit LLM</span>
      </T>
    ),
  },
  {
    id: "loading-data",
    content: (
      <div className="flex flex-col gap-1 @md/infographic:gap-1.5">
        <T>
          <span>Loading data</span>
        </T>
        <span className="mt-1 flex flex-row gap-x-1.5 pl-7.5 text-black">
          <span className="relative top-1 inline-block size-1.25 bg-[#2272B4]" />
          Lakehouse <span className="text-black/80">(sales_fact_table)</span>
        </span>
        <span className="flex flex-row gap-x-1.5 pl-7.5 text-black">
          <span className="relative top-1 inline-block size-1.25 bg-[#2272B4]" />
          SQL Warehouse <span className="text-black/80">(KPIs)</span>
        </span>
      </div>
    ),
  },
  {
    id: "running-tools",
    content: (
      <div className="flex flex-col gap-1 @md/infographic:gap-1.5">
        <T>
          <span>Running tools</span>
        </T>
        <span className="mt-1 flex flex-row gap-x-1.5 pl-7.5 text-black">
          <span className="relative top-1 inline-block size-1.25 bg-[#2272B4]" />
          Python analytics{" "}
          <span className="text-black/80">(trends, anomalies)</span>
        </span>
      </div>
    ),
  },
  {
    id: "generating-output",
    content: (
      <T>
        <span>Generating output</span>
      </T>
    ),
  },
] as const;

const PYTHON_CODE_LINES = [
  {
    id: "output-open",
    content: (
      <>
        <span className="text-[#8D8D8D]">output</span>{" "}
        <span className="text-[#00A972]">=</span>{" "}
        <span className="text-[#2272B4]">{"{"}</span>
      </>
    ),
  },
  {
    id: "forecast",
    content: (
      <>
        {"    "}
        "forecast"
        <span className="text-[#2272B4]">:</span> "+13% (10-17%)",
      </>
    ),
  },
  {
    id: "drivers",
    content: (
      <>
        {"    "}
        "drivers"
        <span className="text-[#2272B4]">:</span>{" "}
        <span className="text-[#2272B4]">[</span>"demand", "history", "market"
        <span className="text-[#2272B4]">]</span>,
      </>
    ),
  },
  {
    id: "actions",
    content: (
      <>
        {"    "}
        "actions"
        <span className="text-[#2272B4]">:</span>{" "}
        <span className="text-[#2272B4]">[</span>"scale SKUs", "optimize
        pricing"<span className="text-[#2272B4]">]</span>
      </>
    ),
  },
  {
    id: "output-close",
    content: <span className="text-[#2272B4]">{"}"}</span>,
  },
] as const;

type AgentBricksInfographicCardProps = {
  className?: string;
  cardClassName?: string;
  step: string;
  stepIndex: number;
  isVisible: boolean;
  isLast?: boolean;
  reduceMotion: boolean;
};

function getStepDelay(stepIndex: number) {
  return STEP_MOVE_DELAYS[stepIndex] ?? STEP_MOVE_DELAYS[2];
}

function getStepInitialY(stepIndex: number) {
  return STEP_INITIAL_Y_BY_INDEX[stepIndex] ?? -20;
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
    delay: getStepDelay(stepIndex) + CONNECTOR_LINE_DELAY,
    duration: CONNECTOR_LINE_DURATION,
  };
}

function getContentLineTransition(stepIndex: number, lineIndex: number) {
  return {
    delay:
      getStepDelay(stepIndex) +
      CONTENT_LINE_DELAY +
      lineIndex * CONTENT_LINE_STAGGER,
    duration: CONTENT_LINE_DURATION,
    ease: CONTENT_LINE_EASE,
  };
}

function AnimatedProgressLine({
  children,
  className,
  isVisible,
  lineIndex,
  reduceMotion,
  stepIndex,
}: ComponentProps<"div"> & {
  isVisible: boolean;
  lineIndex: number;
  reduceMotion: boolean;
  stepIndex: number;
}) {
  return (
    <m.li
      animate={isVisible && !reduceMotion ? { opacity: 1, y: 0 } : undefined}
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: CONTENT_LINE_INITIAL_Y }}
      transition={getContentLineTransition(stepIndex, lineIndex)}
    >
      {children}
    </m.li>
  );
}

function AnimatedCodeLine({
  children,
  isVisible,
  lineIndex,
  reduceMotion,
  stepIndex,
}: ComponentProps<"span"> & {
  isVisible: boolean;
  lineIndex: number;
  reduceMotion: boolean;
  stepIndex: number;
}) {
  return (
    <m.span
      animate={isVisible && !reduceMotion ? { opacity: 1, y: 0 } : undefined}
      className="block"
      initial={reduceMotion ? false : { opacity: 0, y: CONTENT_LINE_INITIAL_Y }}
      transition={getContentLineTransition(stepIndex, lineIndex)}
    >
      {children}
    </m.span>
  );
}

function AgentBricksInfographicCard({
  className,
  cardClassName,
  children,
  step,
  stepIndex,
  isVisible,
  isLast = false,
  reduceMotion,
}: ComponentProps<"div"> & AgentBricksInfographicCardProps) {
  return (
    <m.div
      animate={isVisible && !reduceMotion ? { opacity: 1, y: 0 } : undefined}
      className={cn(
        "grid grid-cols-[1.75rem_1fr] gap-x-4 @md/infographic:grid-cols-[2.375rem_1fr] @md/infographic:gap-x-10",
        className,
      )}
      initial={
        reduceMotion ? false : { opacity: 0, y: getStepInitialY(stepIndex) }
      }
      transition={getStepTransition(stepIndex)}
    >
      <div className="relative">
        <span className="flex size-7 shrink-0 items-center justify-center border border-[#D4D2CF] bg-white text-center font-mono text-[11px] shadow-[0_.625rem_1.25rem_rgb(4_4_6/0.06)] @md/infographic:aspect-square @md/infographic:size-9.5 @md/infographic:text-base">
          {step}
        </span>
        {!isLast ? (
          <m.span
            animate={isVisible && !reduceMotion ? { opacity: 1 } : undefined}
            className="absolute top-8 left-1/2 mx-auto h-[calc(100%-1.5rem)] w-fit -translate-x-1/2 border-l border-dashed border-black @md/infographic:top-10.5 @md/infographic:h-[calc(100%-1.625rem)]"
            initial={reduceMotion ? false : { opacity: 0 }}
            transition={getConnectorLineTransition(stepIndex)}
          />
        ) : null}
      </div>
      <FeatureInfographicCard className={cn("shrink-0", cardClassName)}>
        {children}
      </FeatureInfographicCard>
    </m.div>
  );
}

export function AgentBricksInfographic() {
  const { infographicRef, isVisible, reduceMotion } =
    useFeatureInfographicVisibility();

  return (
    <LazyMotion features={domAnimation}>
      <div
        className="@container/infographic mx-auto my-auto max-w-lg py-8 font-sans text-black lg:pt-22 lg:pb-23 @md/infographic:px-4"
        ref={infographicRef}
      >
        <AgentBricksInfographicCard
          className="pb-3 @md/infographic:pb-5"
          cardClassName="p-2 @md/infographic:p-3"
          isVisible={isVisible}
          reduceMotion={reduceMotion}
          step="01"
          stepIndex={0}
        >
          <>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5 @md/infographic:gap-3">
                <img
                  src={israelGrantSrc}
                  alt=""
                  className="size-7 shrink-0 @md/infographic:size-9"
                  width={36}
                  height={36}
                  loading="lazy"
                  decoding="async"
                />
                <div className="flex flex-col gap-y-0.75">
                  <h4 className="text-[11px] leading-tight font-medium tracking-[-0.02em] @md/infographic:text-xs/tight">
                    David Grant
                  </h4>
                  <span className="text-[10px] leading-tight tracking-[-0.02em] text-black/70 @md/infographic:text-[11px]">
                    grant@hotmail.com
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-x-1.25 pt-0.5 pr-1 text-[9px] tracking-[-0.02em] whitespace-nowrap text-black/70 @md/infographic:text-[11px]">
                <T>Today</T>{" "}
                <span className="flex size-0.5 shrink-0 bg-black/40" /> 11:56 AM
              </div>
            </div>
            <T>
              <p className="mt-1.5 max-w-sm text-[11px] leading-normal tracking-[-0.02em] text-black opacity-90 @md/infographic:mt-2.5 @md/infographic:max-w-sm @md/infographic:text-[13px]">
                Analyze sales data and forecast based on trends, history, and
                market indicators.
              </p>
            </T>
          </>
        </AgentBricksInfographicCard>

        <AgentBricksInfographicCard
          className="pb-3 @md/infographic:pb-5"
          cardClassName="p-2 @md/infographic:p-3"
          isVisible={isVisible}
          reduceMotion={reduceMotion}
          step="02"
          stepIndex={1}
        >
          <>
            <div className="flex items-start justify-between">
              <div className="flex flex-row items-center gap-x-2.5 @md/infographic:gap-3">
                <div className="flex size-7 shrink-0 items-center justify-center border border-[#D4D2CF80]/50 bg-white @md/infographic:size-9">
                  <img
                    src={agentBricksIconSrc}
                    alt=""
                    className="size-4.5 shrink-0 @md/infographic:size-6"
                    width={24}
                    height={24}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <h4 className="text-xs leading-tight font-medium tracking-tight @md/infographic:text-sm/tight">
                  Agent Bricks
                </h4>
              </div>
              <Badge className="mt-1 mr-1 gap-1 rounded-full border border-[#00A972]/50 bg-[#00A972]/5 py-0.5 pr-2.5 pl-1.5 text-[9px] font-normal text-black @md/infographic:py-1 @md/infographic:pr-3 @md/infographic:pl-2 @md/infographic:text-xs/tight">
                <img
                  src={lockIconSrc}
                  alt=""
                  className="size-2.5 shrink-0 @md/infographic:size-3.5"
                  width={36}
                  height={36}
                  loading="lazy"
                  decoding="async"
                />
                <T>Secure</T>
              </Badge>
            </div>
            <ul className="mt-2 flex flex-col gap-1 text-[11px] leading-tight tracking-[-0.02em] text-black/80 opacity-90 @md/infographic:mt-3.5 @md/infographic:gap-2.5 @md/infographic:text-[13px]">
              {AGENT_BRICKS_PROGRESS_LINES.map(({ content, id }, index) => (
                <AnimatedProgressLine
                  className="flex items-start gap-1.5"
                  isVisible={isVisible}
                  key={id}
                  lineIndex={index}
                  reduceMotion={reduceMotion}
                  stepIndex={1}
                >
                  <Check className="mt-px size-3 shrink-0" strokeWidth={1.5} />
                  {content}
                </AnimatedProgressLine>
              ))}
            </ul>
          </>
        </AgentBricksInfographicCard>

        <AgentBricksInfographicCard
          cardClassName="p-0"
          isLast
          isVisible={isVisible}
          reduceMotion={reduceMotion}
          step="03"
          stepIndex={2}
        >
          <>
            <div className="flex items-center gap-1.5 border-b border-[#D4D2CF] bg-[#F0EEEB] px-2 py-2.5 @md/infographic:px-3">
              <span className="flex gap-x-0.5 text-xs leading-tight font-medium @md/infographic:text-sm/tight">
                <span>&lt;</span>
                <span>/</span>
                <span>&gt;</span>
              </span>
              <h4 className="text-xs leading-tight font-medium tracking-tight @md/infographic:text-sm/tight">
                Python
              </h4>
            </div>
            <pre className="m-0 bg-white p-2 font-mono text-[11px] leading-normal tracking-tight whitespace-pre-wrap text-black @md/infographic:p-3 @md/infographic:text-[13px]">
              {PYTHON_CODE_LINES.map(({ content, id }, index) => (
                <AnimatedCodeLine
                  isVisible={isVisible}
                  key={id}
                  lineIndex={index}
                  reduceMotion={reduceMotion}
                  stepIndex={2}
                >
                  {content}
                </AnimatedCodeLine>
              ))}
            </pre>
          </>
        </AgentBricksInfographicCard>
      </div>
    </LazyMotion>
  );
}
