"use client";

import { useRef, type SVGProps } from "react";
import Link from "next/link";
import { T } from "gt-next";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { TemplateSlider } from "./slider";
import { DEFAULT_TEMPLATE_SLIDER_SETTINGS } from "./use-slider";

interface TemplatesProps {
  className?: string;
}

function LinkArrowIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M1 16.0352H29"
        stroke="currentColor"
        strokeWidth="4"
        strokeMiterlimit="10"
      />
      <path
        d="M20 7.03516L29 16.0352L20 25.0352"
        stroke="currentColor"
        strokeWidth="4"
        strokeMiterlimit="10"
        strokeLinecap="square"
      />
    </svg>
  );
}

function Templates({ className }: TemplatesProps) {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      className={cn(
        "templates bg-grey-8 overflow-hidden pt-18 text-white md:pt-22 lg:pt-26 xl:pt-40",
        className,
      )}
      aria-labelledby="home-templates-title"
    >
      <div className="mx-auto flex w-full max-w-400 flex-col px-5 md:px-8">
        <header className="flex flex-col gap-y-5 lg:gap-y-6">
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 bg-[#FF6038]" aria-hidden="true" />
            <p className="font-mono text-sm/none font-medium tracking-normal text-[#5e616e] uppercase">
              <T>[Templates]</T>
            </p>
          </div>
          <h2
            className="max-w-184 text-3xl leading-[1.125] font-normal tracking-[-0.04em] text-balance text-white md:text-4xl md:leading-[1.125] lg:text-5xl lg:leading-[1.125] xl:text-[3.5rem]"
            id="home-templates-title"
          >
            <T>
              Jumpstart your next project{" "}
              <span className="text-grey-70">with a template.</span>
            </T>
          </h2>
        </header>
      </div>

      <TemplateSlider
        sectionRef={sectionRef}
        settings={DEFAULT_TEMPLATE_SLIDER_SETTINGS}
      />

      <Button
        className="bg-orange hover:bg-primary/90 focus-visible:ring-db-cyan mt-10 flex w-full rounded-none px-5 font-mono text-base font-medium tracking-normal text-white uppercase shadow-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121317] md:mt-14 md:text-lg lg:mt-18 lg:text-xl xl:text-[2rem]"
        asChild
      >
        <Link
          href="/templates"
          className="h-10 gap-3 tracking-tight no-underline lg:h-14 lg:gap-5 xl:gap-8"
        >
          <LinkArrowIcon className="size-5 lg:size-8" />
          <T>
            <span>See all templates</span>
          </T>
          <LinkArrowIcon className="size-5 rotate-180 lg:size-8" />
        </Link>
      </Button>
    </section>
  );
}

export default Templates;
