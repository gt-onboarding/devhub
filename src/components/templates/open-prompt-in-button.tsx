"use client";

import { track } from "@vercel/analytics";
import { T } from "gt-next";
import { ChevronDown } from "lucide-react";

import { getPromptTargets } from "@/lib/prompt-targets";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type OpenPromptInButtonProps = {
  replitPrompt?: string;
  slug: string;
  title: string;
  permalink: string;
  align?: "center" | "end" | "start";
  className?: string;
  contentClassName?: string;
  itemClassName?: string;
  sideOffset?: number;
};

export function OpenPromptInButton({
  replitPrompt,
  slug,
  title,
  permalink,
  align = "start",
  className,
  contentClassName,
  itemClassName,
  sideOffset,
}: OpenPromptInButtonProps) {
  const targets = getPromptTargets({ replitPrompt });
  if (targets.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-10 px-5", className)}
        >
          <T>Open prompt in</T>
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "w-[var(--radix-dropdown-menu-trigger-width)]",
          contentClassName,
        )}
      >
        {targets.map((target) => {
          const Icon = target.icon;
          return (
            <DropdownMenuItem key={target.id} asChild className={itemClassName}>
              <a
                href={target.href}
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline"
                onClick={() =>
                  track("open_prompt_in", {
                    target: target.id,
                    slug,
                    title,
                    permalink,
                  })
                }
              >
                <Icon
                  className="shrink-0 text-current"
                  style={{
                    color: "currentColor",
                    display: "inline-block",
                    fill: "currentColor",
                  }}
                />
                {target.label}
              </a>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
