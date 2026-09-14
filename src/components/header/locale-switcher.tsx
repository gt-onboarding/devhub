"use client";

import { useGT, useLocaleSelector } from "gt-next";
import { Globe } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LocaleSwitcher({
  align = "end",
  className,
  contentClassName,
}: {
  align?: "start" | "center" | "end";
  className?: string;
  contentClassName?: string;
}) {
  const gt = useGT();
  const { locale, locales, setLocale, getLocaleProperties } =
    useLocaleSelector();

  if (locales.length < 2) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={gt("Change language")}
          className={cn(
            "focus-visible:outline-db-cyan inline-flex h-9 items-center gap-1.5 px-1 font-mono text-sm leading-none tracking-tight text-[#E4E5E7] uppercase transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 data-[state=open]:opacity-85",
            className,
          )}
        >
          <Globe className="size-4.5 shrink-0" aria-hidden="true" />
          <span>{getLocaleProperties(locale).languageCode}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        sideOffset={8}
        className={cn(
          "border-grey-30 min-w-44 rounded-none border bg-black p-1 text-white shadow-none",
          contentClassName,
        )}
      >
        <DropdownMenuRadioGroup value={locale} onValueChange={setLocale}>
          {locales.map((code) => (
            <DropdownMenuRadioItem
              key={code}
              value={code}
              lang={code}
              className="text-grey-70 cursor-pointer rounded-none py-2 font-mono text-sm leading-none tracking-tight transition-colors hover:!bg-transparent hover:!text-white focus:!bg-transparent focus:!text-white data-[highlighted]:!bg-transparent data-[highlighted]:!text-white data-[state=checked]:text-white"
            >
              {getLocaleProperties(code).nativeNameWithRegionCode}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
