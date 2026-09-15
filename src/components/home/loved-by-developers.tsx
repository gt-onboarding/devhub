"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { useGT } from "gt-next";

import { cn } from "@/lib/utils";

import {
  DEFAULT_LOVED_METRICS_SETTINGS,
  formatMetricValue,
  getMetricStartValue,
  LOVED_TIMELINE_LAYERS,
  setupLovedMetricsReveal,
} from "./loved-by-developers-metrics-animation";

import "./loved-by-developers-metrics.css";

const METRIC_COLUMNS = [
  {
    title: "For developers",
    description:
      "Pick a template, run one command, and your agentic app is live - with a database, AI model access, and auth already wired up. No Kubernetes. No Terraform. No waiting on ops.",
    metrics: [
      {
        label: "improved operational accuracy",
        suffix: "%",
        target: 44,
      },
      {
        label: "in productivity gains",
        prefix: "$",
        suffix: "M+",
        target: 10,
      },
    ],
  },
  {
    title: "For developers",
    description:
      "Pick a template, run one command, and your agentic app is live - with a database, AI model access, and auth already wired up. No Kubernetes. No Terraform. No waiting on ops.",
    metrics: [
      {
        label: "accuracy of responses",
        suffix: "%",
        target: 96,
      },
      {
        label: "reduced costs via automation",
        suffix: "x",
        target: 10,
      },
    ],
  },
];

function LovedMetricValue({
  prefix,
  suffix,
  target,
}: {
  prefix?: string;
  suffix?: string;
  target: number;
}) {
  const initialText = formatMetricValue(
    getMetricStartValue(target, DEFAULT_LOVED_METRICS_SETTINGS.startValue),
    prefix,
    suffix,
  );
  const finalText = formatMetricValue(target, prefix, suffix);

  return (
    <span
      className="loved-metric-value 3xl:text-[7rem] shrink-0 font-mono text-5xl leading-[1.125] font-normal tracking-normal text-white md:text-6xl lg:text-7xl xl:text-7xl 2xl:text-[6.25rem]"
      data-display={initialText}
      data-ghost-display=""
      data-layout-display={finalText}
      data-loved-metric-value
      data-prefix={prefix ?? ""}
      data-suffix={suffix ?? ""}
      data-target={target}
    >
      <span
        aria-hidden="true"
        className="loved-metric-underlay"
        data-loved-metric-text
      >
        {initialText}
      </span>
      <span className="loved-metric-final" data-loved-metric-text>
        {initialText}
      </span>
      {LOVED_TIMELINE_LAYERS.map((layer) => (
        <span
          aria-hidden="true"
          className={`loved-metric-layer loved-metric-layer-${layer.name}`}
          data-loved-metric-layer={layer.name}
          data-loved-metric-text
          key={layer.name}
        >
          {initialText}
        </span>
      ))}
      <span aria-hidden="true" className="loved-metric-cursor" />
    </span>
  );
}

/** Width of the widest unbreakable word, in em, treating CJK glyphs as full-width. */
function widestWordEm(...lines: string[]): number {
  return Math.max(
    0,
    ...lines
      .flatMap((line) => line.split(/\s+/))
      .map((word) =>
        [...word].reduce(
          (width, char) =>
            width +
            (/[\u3000-\u9fff\uf900-\ufaff\uff00-\uffef]/.test(char) ? 1 : 0.55),
          0,
        ),
      ),
  );
}

const ENGLISH_HEADLINE_WORD_EM = widestWordEm("Loved by", "developers.");

/**
 * The staggered headline is sized for the English "developers."; longer
 * translated words would break mid-word, so scale the type down until the
 * widest word matches the English width. English stays at 1.
 */
function headingFitScale(...lines: string[]): number {
  const widest = widestWordEm(...lines);
  return widest > ENGLISH_HEADLINE_WORD_EM
    ? Math.round((ENGLISH_HEADLINE_WORD_EM / widest) * 100) / 100
    : 1;
}

function LovedByDevelopers({ className }: { className?: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const gt = useGT();
  const builtFor = gt("Built for enterprise.");
  const lovedBy = gt("Loved by", {
    $context:
      "First line of the two-line headline 'Loved by developers.' in a very large display font; the second line is 'developers.'",
  });
  const developers = gt("developers.", {
    $context:
      "Second line of the two-line headline 'Loved by developers.' in a very large display font; keep it to one word if possible",
  });
  const headingFit = headingFitScale(lovedBy, developers);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    return setupLovedMetricsReveal({
      section,
      settings: DEFAULT_LOVED_METRICS_SETTINGS,
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      className={cn(
        "loved-by-developers relative overflow-hidden text-white",
        className,
      )}
    >
      <div className="3xl:max-w-400 3xl:py-46 relative z-10 mx-auto flex max-w-272 flex-col px-5 pt-18 pb-14 md:px-8 md:py-24 lg:py-32 xl:max-w-304 xl:py-46 2xl:max-w-360 2xl:py-35">
        <header className="relative z-10 flex flex-col">
          <h2
            className="font-heading 3xl:text-[calc(13.125rem*var(--heading-fit))] max-w-sm text-[calc(3rem*var(--heading-fit))] leading-none font-normal tracking-normal sm:max-w-none md:text-[calc(4.5rem*var(--heading-fit))] lg:text-[calc(8rem*var(--heading-fit))] xl:text-[calc(10rem*var(--heading-fit))] 2xl:text-[calc(12rem*var(--heading-fit))]"
            style={{ "--heading-fit": headingFit } as CSSProperties}
          >
            <span className="block max-w-342 text-balance">{builtFor}</span>
            <span className="block">
              {" "}
              <span className="text-db-lava-light 3xl:ml-122 lg:ml-60 lg:block 2xl:ml-96">
                {lovedBy}
              </span>{" "}
              <span className="3xl:ml-64 lg:ml-24 lg:block xl:translate-x-8 2xl:ml-52">
                {developers}
              </span>
            </span>
          </h2>
        </header>

        {/* <ul className="relative z-10 mt-10 grid gap-10 max-w-360 md:mt-28 md:grid-cols-2 md:gap-8 lg:gap-20 lg:mt-44 xl:mt-46 xl:gap-24 3xl:gap-56">
          {METRIC_COLUMNS.map(({ title, description, metrics }, index) => (
            <li
              key={`${title}-${index}`}
              className={cn(
                "relative flex flex-col border-white/20 md:pl-8",
                index === 1 && "border-t pt-10 md:border-t-0 md:pt-0",
              )}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-0 left-0 hidden h-full w-px bg-white/20 md:block"
                data-loved-metrics-line-drop
              />
              <h3 className="text-base leading-normal font-medium text-white md:text-xl/normal lg:text-2xl/normal">
                {title}
              </h3>
              <p className="mt-3 max-w-lg text-sm/normal text-white/60 md:text-base xl:text-lg/normal">
                {description}
              </p>
              <ul
                className="mt-10 grid gap-10 will-change-transform md:mt-32 xl:mt-42.5 md:gap-20"
                data-loved-metrics-list
              >
                {metrics.map(({ label, prefix, suffix, target }) => (
                  <li
                    key={`${target}-${label}`}
                    className="flex items-baseline gap-3 md:gap-4"
                  >
                    <LovedMetricValue
                      prefix={prefix}
                      suffix={suffix}
                      target={target}
                    />
                    <span className="text-xs leading-normal ml-1 text-white/60 md:max-w-66 md:text-sm lg:text-lg">
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul> */}
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        aria-hidden="true"
      >
        <div className="3xl:translate-x-8 3xl:h-94 3xl:w-170 3xl:left-1/2 absolute top-0 left-1/2 h-30 w-61 translate-x-1/4 [background-image:radial-gradient(circle_at_1px_1px,rgb(255_255_255)_1px,transparent_0)] bg-size-[6px_6px] sm:hidden lg:right-auto lg:left-[calc(50%-4em)] lg:block lg:h-60 lg:w-100 lg:translate-x-1/6 xl:left-[calc(50%-3em)] xl:h-85 xl:w-140" />
        <div className="3xl:h-98 3xl:right-[calc(50%+32.75rem)] 3xl:w-145 3xl:top-158 absolute top-57 -right-1/2 hidden h-98 w-145 [background-image:radial-gradient(circle_at_1px_1px,rgb(255_255_255)_1px,transparent_0)] bg-size-[6px_6px] lg:top-100 lg:right-[calc(50%+27rem)] lg:block lg:h-62 lg:w-80 xl:top-130 xl:right-[calc(50%+31.125rem)] xl:h-84 xl:w-145 2xl:top-136" />
        <div className="3xl:h-45 3xl:right-[calc(50%+20.5rem)] 3xl:w-48.5 3xl:top-158 absolute top-66 right-1/2 hidden h-48.5 w-45 [background-image:radial-gradient(circle_at_1px_1px,rgb(255_255_255)_1px,transparent_0)] bg-size-[6px_6px] lg:top-100 lg:right-[calc(50%+20.25rem)] lg:block lg:h-26 lg:w-26 xl:top-130 xl:right-[calc(50%+22rem)] xl:h-36 xl:w-36 2xl:top-136" />
      </div>
    </section>
  );
}

export default LovedByDevelopers;
