"use client";

import { useCallback, useState, type ReactNode } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { Branch, T, useGT } from "gt-next";
import { Check, Copy, LoaderCircle } from "lucide-react";

import { getBootstrapPromptApiPath } from "@/lib/bootstrap-prompt";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TitleCross } from "@/components/home/title-cross";

const TOPBAR_DOTS = ["bg-db-lava", "bg-yellow-400", "bg-green-500"] as const;

type CopyState = "idle" | "copying" | "copied";
type CTATheme = "filled" | "outline";

type CTAProps = {
  label?: string;
  title?: ReactNode;
  description?: string;
  actions?: ReactNode;
  className?: string;
  theme?: CTATheme;
};

function CTATitleHighlight({ children }: { children: ReactNode }) {
  return (
    <span className="text-db-lava relative inline-block md:whitespace-nowrap">
      <span
        className="border-grey-20 pointer-events-none absolute -inset-x-0.5 inset-y-0 hidden border md:block"
        aria-hidden="true"
      />
      <TitleCross className="-top-2 -left-2.25" />
      <TitleCross className="-top-2 -right-2.25" />
      <TitleCross className="-bottom-2 -left-2.25" />
      <TitleCross className="-right-2.25 -bottom-2" />
      <span className="relative">{children}</span>
    </span>
  );
}

function CTADefaultTitle() {
  return (
    <T>
      <span className="relative z-10">Ready to ship your next </span>
      <CTATitleHighlight>agentic app</CTATitleHighlight>
      <span className="relative z-10"> in minutes?</span>
    </T>
  );
}

function Topbar({ theme }: { theme: CTATheme }) {
  return (
    <header
      className={cn(
        "flex items-center gap-x-4.5 px-6.5 py-4.5 md:gap-x-6.5",
        theme === "outline"
          ? "border-grey-20 border-y bg-black"
          : "mx-1.5 bg-[#202021]",
      )}
    >
      <div
        className="flex items-center gap-2 md:gap-3 lg:gap-4"
        aria-hidden="true"
      >
        {TOPBAR_DOTS.map((dotClassName) => (
          <span
            className={cn(
              "size-2.5 shrink-0 md:size-3 lg:size-4",
              theme === "outline" && "border-grey-20 border",
              dotClassName,
            )}
            key={dotClassName}
          />
        ))}
      </div>
      <p className="truncate font-mono text-sm leading-[1.15] font-normal tracking-[-0.04em] text-white/40 uppercase md:text-lg">
        <T>Databricks Developer Hub</T>
      </p>
    </header>
  );
}

function CTAButtons({
  copyState,
  onCopy,
}: {
  copyState: CopyState;
  onCopy: () => void;
}) {
  const gt = useGT();

  return (
    <div className="flex w-full flex-col gap-x-5 gap-y-3 sm:w-auto sm:flex-row sm:items-center lg:justify-end">
      <Button
        className="h-10 gap-x-4.5 font-mono text-base leading-none tracking-tight text-black uppercase shadow-none lg:h-11"
        onClick={onCopy}
        disabled={copyState === "copying"}
        title={gt("Copy agent prompt")}
        size="xl"
        type="button"
        variant="orange"
      >
        <T>
          <Branch branch={copyState} copied="Copied">
            Copy agent prompt
          </Branch>
        </T>
        {copyState === "copying" ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : copyState === "copied" ? (
          <Check className="size-4" aria-hidden="true" />
        ) : (
          <Copy className="size-4 rotate-180" aria-hidden="true" />
        )}
      </Button>
      <Button
        className="h-10 rounded-none bg-white px-7 font-mono text-base leading-none font-medium tracking-tight text-black uppercase shadow-none hover:bg-white/90 lg:h-11"
        asChild
      >
        <Link
          className="no-underline hover:no-underline"
          href="/docs/start-here"
        >
          <T>Read docs</T>
        </Link>
      </Button>
    </div>
  );
}

function CTA({ className, label, title, actions, theme = "filled" }: CTAProps) {
  const gt = useGT();
  const bootstrapPromptApiPath = getBootstrapPromptApiPath();
  const [copyState, setCopyState] = useState<CopyState>("idle");

  const handleCopy = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      return;
    }

    setCopyState("copying");

    try {
      const response = await fetch(bootstrapPromptApiPath);
      if (!response.ok) throw new Error("Failed to fetch bootstrap prompt");

      const bootstrapPrompt = await response.text();
      await navigator.clipboard.writeText(bootstrapPrompt);
      setCopyState("copied");
      track("copy_bootstrap_prompt", { source: "cta" });
    } catch {
      setCopyState("idle");
    }
  }, [bootstrapPromptApiPath]);

  return (
    <section
      aria-label={label ?? gt("Start building")}
      className={cn("cta bg-black pt-1.5 text-white", className)}
    >
      <Topbar theme={theme} />
      <div className="relative mx-auto px-5 md:px-8 lg:px-16 2xl:px-24">
        <div className="mt-10 flex flex-col gap-8 md:mt-16 lg:mt-20 lg:flex-row lg:items-end">
          <h2 className="font-heading relative text-4xl/none font-normal tracking-normal text-balance text-white md:text-5xl/none xl:text-6xl/none 2xl:text-[5rem]">
            {title === undefined ? (
              <CTADefaultTitle />
            ) : (
              <span className="relative z-10">{title}</span>
            )}
          </h2>

          {actions ?? <CTAButtons copyState={copyState} onCopy={handleCopy} />}
        </div>
      </div>
    </section>
  );
}

export default CTA;
