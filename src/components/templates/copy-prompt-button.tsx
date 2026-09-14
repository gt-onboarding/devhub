"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { T, useGT } from "gt-next";
import { Check, LoaderCircle } from "lucide-react";

import {
  useAgentMarkdown,
  type AgentMarkdownInput,
} from "@/lib/use-agent-markdown";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Icons } from "@/components/icons";

export type CopyPromptButtonProps = AgentMarkdownInput & {
  disabled?: boolean;
  disabledTooltip?: string;
  className?: string;
  label?: string;
};

export function CopyPromptButton({
  disabled = false,
  disabledTooltip,
  className,
  label,
  ...input
}: CopyPromptButtonProps) {
  const gt = useGT();
  const buttonLabel = label ?? gt("Copy prompt");
  const { buildAIMarkdown, ensureFetched } = useAgentMarkdown(input);
  const [copyState, setCopyState] = useState<
    "idle" | "copying" | "copied" | "error"
  >("idle");
  const resetTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(
    () => () => {
      clearTimeout(resetTimerRef.current);
    },
    [],
  );

  const handleCopy = useCallback(async () => {
    setCopyState("copying");
    try {
      await ensureFetched();
      const md = buildAIMarkdown();
      await navigator.clipboard.writeText(md);
      setCopyState("copied");
      track("copy_prompt", { title: input.title, permalink: input.permalink });
    } catch {
      setCopyState("error");
    } finally {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => setCopyState("idle"), 2500);
    }
  }, [ensureFetched, buildAIMarkdown, input.title, input.permalink]);

  if (disabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <Button size="sm" className={className} disabled>
                <Icons.copy className="h-4 w-4" />
                {buttonLabel}
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {disabledTooltip ?? gt("select a template to copy")}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      size="sm"
      className={cn(className)}
      onClick={handleCopy}
      disabled={copyState === "copying"}
    >
      {copyState === "copying" ? (
        <>
          <LoaderCircle className="h-4 w-4 animate-spin" />
          <T>Copying…</T>
        </>
      ) : copyState === "copied" ? (
        <>
          <Check className="h-4 w-4" />
          <T>Copied!</T>
        </>
      ) : copyState === "error" ? (
        <T>Try again</T>
      ) : (
        <>
          <Icons.copy className="h-4 w-4" />
          {buttonLabel}
        </>
      )}
    </Button>
  );
}
