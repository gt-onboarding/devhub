"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { T, useGT } from "gt-next";
import {
  ChevronDownIcon,
  ClipboardCopyIcon,
  CodeIcon,
  ServerIcon,
} from "lucide-react";

import {
  useAgentMarkdown,
  type AgentMarkdownInput,
} from "@/lib/use-agent-markdown";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type AIExportMenuProps = AgentMarkdownInput & {
  appearance?: "default" | "article";
  align?: "center" | "end" | "start";
  disabled?: boolean;
  disabledTooltip?: string;
  contentClassName?: string;
  itemClassName?: string;
  label?: string;
  mobileLabel?: string;
  separatorClassName?: string;
  triggerClassName?: string;
};

export function AIExportMenu({
  appearance = "default",
  align,
  disabled = false,
  disabledTooltip,
  contentClassName,
  itemClassName,
  label,
  mobileLabel,
  separatorClassName,
  triggerClassName,
  ...input
}: AIExportMenuProps) {
  const gt = useGT();
  const { mcpUrl, markdownUrl, buildAIMarkdown, ensureFetched } =
    useAgentMarkdown(input);
  const [copyState, setCopyState] = useState<
    "idle" | "copying" | "copied" | "error"
  >("idle");
  const resetTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isArticle = appearance === "article";
  const triggerLabel =
    label ?? (isArticle ? gt("Copy Article") : gt("Copy as"));
  const articleIconClassName = isArticle ? "size-3.5 text-grey-70" : undefined;
  const triggerIcon = <ChevronDownIcon aria-hidden="true" />;
  const triggerStatus =
    copyState === "copying"
      ? gt("Copying", { $context: "button status while copying to clipboard" })
      : copyState === "copied"
        ? gt("Copied", { $context: "button status after copying to clipboard" })
        : copyState === "error"
          ? gt("Copy failed")
          : null;
  const triggerContent = triggerStatus ? (
    <span aria-live="polite">{triggerStatus}</span>
  ) : mobileLabel ? (
    <>
      <span className="sm:hidden">{mobileLabel}</span>
      <span className="hidden sm:block">{triggerLabel}</span>
    </>
  ) : (
    triggerLabel
  );
  const dropdownAlign = align ?? (isArticle ? "start" : "end");

  useEffect(
    () => () => {
      clearTimeout(resetTimerRef.current);
    },
    [],
  );

  const showCopyState = useCallback((nextState: "copied" | "error") => {
    setCopyState(nextState);
    clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => setCopyState("idle"), 2500);
  }, []);

  const handleCopyMarkdown = useCallback(async () => {
    setCopyState("copying");
    try {
      await ensureFetched();
      await navigator.clipboard.writeText(buildAIMarkdown());
      showCopyState("copied");
    } catch {
      showCopyState("error");
    }
  }, [ensureFetched, buildAIMarkdown, showCopyState]);

  const handleViewRawMarkdown = useCallback(() => {
    window.open(markdownUrl, "_blank", "noopener,noreferrer");
  }, [markdownUrl]);

  const handleCopyMCP = useCallback(async () => {
    setCopyState("copying");
    const mcpConfig = JSON.stringify(
      {
        mcpServers: {
          "databricks-devhub": { url: mcpUrl },
        },
      },
      null,
      2,
    );

    try {
      await navigator.clipboard.writeText(mcpConfig);
      showCopyState("copied");
    } catch {
      showCopyState("error");
    }
  }, [mcpUrl, showCopyState]);

  if (disabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "border-grey-30 text-grey-70 hover:!border-grey-70 hover:!text-grey-70 focus:!text-grey-70 focus-visible:!border-grey-70 focus-visible:ring-db-cyan data-[state=open]:!border-grey-70 data-[state=open]:!text-grey-70 h-7.5 gap-2.5 rounded-none border bg-transparent py-0 pr-2.5 pl-3 font-mono text-sm leading-none font-medium tracking-normal uppercase shadow-none transition-colors hover:!bg-transparent focus:!bg-transparent focus-visible:ring-offset-black data-[state=open]:!bg-transparent data-[state=open]:hover:!bg-transparent [&_svg]:size-3.5 [&_svg]:text-current",
                  triggerClassName,
                )}
                aria-label={triggerLabel}
                disabled
              >
                {triggerContent}
                {triggerIcon}
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          className={cn(
            "border-grey-30 text-grey-70 hover:border-grey-70 hover:text-grey-70 focus:text-grey-70 focus-visible:border-grey-70 focus-visible:ring-db-cyan data-[state=open]:border-grey-70 data-[state=open]:text-grey-70 h-7.5 gap-2.5 rounded-none border bg-transparent py-0 pr-2.5 pl-3 font-mono text-sm leading-none font-medium tracking-normal uppercase shadow-none transition-colors hover:bg-transparent focus:bg-transparent focus-visible:ring-offset-black data-[state=open]:bg-transparent data-[state=open]:hover:bg-transparent [&_svg]:size-3.5 [&_svg]:text-current",
            triggerClassName,
          )}
          aria-label={triggerStatus ?? triggerLabel}
        >
          {triggerContent}
          {triggerIcon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={dropdownAlign}
        sideOffset={8}
        className={cn(
          "border-grey-30 rounded-none border bg-black p-0 text-white shadow-none",
          contentClassName,
        )}
      >
        <DropdownMenuGroup className="border-grey-30 flex h-20 flex-col gap-5 border-b px-4 py-4">
          <DropdownMenuItem
            className={cn(
              "text-grey-70 h-3.5 min-h-0 cursor-pointer gap-2.5 rounded-none bg-transparent p-0 font-mono text-sm leading-none font-medium tracking-normal uppercase transition-colors outline-none hover:!bg-transparent hover:!text-white focus:!bg-transparent focus:!text-white data-[highlighted]:!bg-transparent data-[highlighted]:!text-white [&_svg]:size-3.5 [&_svg]:text-current",
              itemClassName,
            )}
            onSelect={handleCopyMarkdown}
          >
            <ClipboardCopyIcon
              className={articleIconClassName}
              aria-hidden="true"
            />
            <T>Copy Markdown</T>
          </DropdownMenuItem>
          <DropdownMenuItem
            className={cn(
              "text-grey-70 h-3.5 min-h-0 cursor-pointer gap-2.5 rounded-none bg-transparent p-0 font-mono text-sm leading-none font-medium tracking-normal uppercase transition-colors outline-none hover:!bg-transparent hover:!text-white focus:!bg-transparent focus:!text-white data-[highlighted]:!bg-transparent data-[highlighted]:!text-white [&_svg]:size-3.5 [&_svg]:text-current",
              itemClassName,
            )}
            onSelect={handleViewRawMarkdown}
          >
            <CodeIcon className={articleIconClassName} aria-hidden="true" />
            <T>View Raw Markdown</T>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuItem
          className={cn(
            "text-grey-70 mx-4 my-3.75 h-3.5 min-h-0 cursor-pointer gap-2.5 rounded-none bg-transparent p-0 font-mono text-sm leading-none font-medium tracking-normal uppercase transition-colors outline-none hover:!bg-transparent hover:!text-white focus:!bg-transparent focus:!text-white data-[highlighted]:!bg-transparent data-[highlighted]:!text-white [&_svg]:size-3.5 [&_svg]:text-current",
            itemClassName,
          )}
          onSelect={handleCopyMCP}
        >
          <ServerIcon className={articleIconClassName} aria-hidden="true" />
          <T>Connect to MCP Server</T>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
