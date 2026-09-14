import { msg, T, useMessages } from "gt-next";

import { cn } from "@/lib/utils";
import { AnimatedArrowLink } from "@/components/ui/animated-arrow-link";
import {
  FeatureCardAction,
  FeatureCardEyebrow,
  FeatureCardFooter,
  FeatureCardHeader,
  FeatureCardRoot,
  FeatureCardTitle,
  FeatureCardVisual,
} from "@/components/ui/feature-card";

import { AgentBricksInfographic } from "./agent-bricks-infographic";
import { DatabricksAppsInfographic } from "./databricks-apps-infographic";
import { LakebaseInfographic } from "./lakebase-infographic";

const FEATURES = [
  {
    eyebrow: "Databricks Apps",
    title: msg("Web apps that run inside your workspace."),
    description: msg(
      "One CLI command to deploy. Fixed URL, built-in OAuth, and direct access to your workspace data, with no separate hosting service.",
    ),
    href: "/product/databricks-apps",
    visual: "apps",
    footerLabel: msg("Ship internal tools"),
    footerDescription: msg(
      "Turn a script or notebook into a shared dashboard your team opens in the browser, no infrastructure to stand up.",
    ),
  },
  {
    eyebrow: "Lakebase",
    title: msg("Managed Postgres, colocated with your Lakehouse."),
    description: msg(
      "Provision with the CLI, query from any app. Autoscaling, instant branching, scale to zero. Fully integrated with your workspace.",
    ),
    href: "/product/lakebase",
    visual: "lakebase",
    footerLabel: msg("Postgres, batteries included"),
    footerDescription: msg(
      "Ship web apps and agents faster with a Postgres database that's integrated and secured within your Databricks workspace.",
    ),
  },
  {
    eyebrow: "Agent Bricks",
    title: msg("LLM-driven apps that call tools and return structured output."),
    description: msg(
      "Any Python framework, Databricks-hosted models, automatic MLflow tracing, and MCP for workspace tools.",
    ),
    href: "/product/agent-bricks",
    visual: "agents",
    footerLabel: msg("Ship agents to prod"),
    footerDescription: msg(
      "Go from a prototype agent to one your users can trust, with evaluation and quality checks that run as you iterate.",
    ),
  },
] as const;

type Feature = (typeof FEATURES)[number];
type FeatureVisual = Feature["visual"];

type FeatureCardProps = {
  eyebrow: string;
  index: number;
  title: string;
  description: string;
  href: string;
  visual: FeatureVisual;
  footerLabel: string;
  footerDescription: string;
  reversed?: boolean;
};

function FeatureVisualContent({ visual }: { visual: FeatureVisual }) {
  if (visual === "lakebase") {
    return <LakebaseInfographic />;
  }

  if (visual === "agents") {
    return <AgentBricksInfographic />;
  }

  return <DatabricksAppsInfographic />;
}

function FeatureCard({
  eyebrow,
  index,
  title,
  description,
  href,
  visual,
  footerLabel,
  footerDescription,
  reversed = false,
}: FeatureCardProps) {
  return (
    <FeatureCardRoot>
      <FeatureCardHeader reversed={reversed}>
        <FeatureCardEyebrow>
          <span className="font-mono text-sm/none">0{index + 1}</span>
          {eyebrow}
        </FeatureCardEyebrow>
        <div className="3xl:mt-0 3xl:pl-16 flex grow flex-col justify-between md:w-full lg:mt-7 lg:pl-8">
          <FeatureCardTitle>
            {title}
            <span className="text-black/30"> [{description}]</span>
          </FeatureCardTitle>
          <FeatureCardAction>
            <AnimatedArrowLink
              href={href}
              className="text-orange hover:text-primary focus-visible:text-primary 3xl:text-[2.5rem] relative inline-flex w-full items-center justify-between pb-4 font-sans text-2xl leading-none font-normal tracking-[-0.04em] no-underline transition-colors md:text-[28px] lg:text-3xl xl:text-4xl"
              size="size-5 md:size-7"
              underlineClassName="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-current"
            >
              <T>Learn more</T>
            </AnimatedArrowLink>
          </FeatureCardAction>
        </div>
      </FeatureCardHeader>
      <FeatureCardVisual className="mt-8 lg:mt-0" reversed={reversed}>
        <div
          className="mx-auto my-auto w-full max-w-184 max-md:relative max-md:size-full md:max-w-[66.67%] lg:max-w-75 xl:max-w-184"
          aria-hidden="true"
        >
          <div className="max-md:absolute max-md:top-1/2 max-md:left-1/2 max-md:w-[800px] max-md:max-w-none max-md:origin-center max-md:-translate-x-1/2 max-md:-translate-y-1/2 max-md:scale-[0.37] max-md:transform-gpu md:w-full">
            <FeatureVisualContent visual={visual} />
          </div>
        </div>
      </FeatureCardVisual>
      <FeatureCardFooter
        className={cn("lg:row-start-2", !reversed && "lg:col-start-2")}
        label={footerLabel}
        description={footerDescription}
      />
    </FeatureCardRoot>
  );
}

export default function Features({ className }: { className?: string }) {
  const m = useMessages();

  return (
    <section
      className={cn(
        "features bg-[#F9F7F4] pt-18 pb-18 md:pt-28 md:pb-28 lg:pt-40 lg:pb-50 xl:pt-44 xl:pb-54",
        className,
      )}
      aria-labelledby="home-features-heading"
    >
      <div className="3xl:max-w-400 mx-auto flex max-w-360 flex-col gap-16 px-5 md:gap-28 md:px-8 lg:gap-50 xl:gap-60">
        <h2 id="home-features-heading" className="sr-only">
          <T>Databricks developer platform features</T>
        </h2>
        {FEATURES.map(
          (
            {
              eyebrow,
              title,
              visual,
              description,
              href,
              footerLabel,
              footerDescription,
            },
            index,
          ) => (
            <FeatureCard
              key={eyebrow}
              eyebrow={eyebrow}
              index={index}
              title={m(title)}
              description={m(description)}
              href={href}
              visual={visual}
              footerLabel={m(footerLabel)}
              footerDescription={m(footerDescription)}
              reversed={index % 2 === 1}
            />
          ),
        )}
      </div>
    </section>
  );
}
