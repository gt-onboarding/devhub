"use client";

import { useId, useMemo, type KeyboardEvent, type ReactNode } from "react";
import { useGT } from "gt-next";

import { useTabs, type TabValue } from "@/lib/content-tabs-state";
import { getNextTabIndex } from "@/lib/tab-keyboard-navigation";
import { cn } from "@/lib/utils";

export type Tab = {
  content: ReactNode;
  default?: boolean;
  label: string;
  value: string;
};

export function Tabs({
  defaultValue,
  groupId,
  queryString,
  tabs,
}: {
  defaultValue?: string;
  groupId?: string;
  queryString?: boolean | string;
  tabs: Tab[];
}) {
  const gt = useGT();

  if (tabs.length === 0) {
    return null;
  }

  const tabsId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const tabValues = useMemo<TabValue[]>(
    () =>
      tabs.map((tab) => ({
        default: tab.default,
        label: tab.label,
        value: tab.value,
      })),
    [tabs],
  );
  const tabsState = useTabs({
    defaultValue,
    groupId,
    queryString,
    values: tabValues,
  });

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    const nextIndex = getNextTabIndex(event.key, currentIndex, tabs.length);
    if (nextIndex === null) {
      return;
    }

    event.preventDefault();
    tabsState.selectValue(tabs[nextIndex].value);
    event.currentTarget.parentElement
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [nextIndex]?.focus();
  }

  return (
    <div className="markdown-tabs mt-5 mb-6 w-full max-w-full overflow-hidden">
      <div
        aria-label={gt("Content tabs")}
        className="border-grey-30 flex h-11 w-full gap-x-5 overflow-x-auto border-b"
        role="tablist"
      >
        {tabs.map((tab, index) => {
          const selected = tabsState.selectedValue === tab.value;
          const triggerId = `${tabsId}-${tab.value}-trigger`;
          const panelId = `${tabsId}-${tab.value}-panel`;
          return (
            <button
              aria-controls={panelId}
              aria-selected={selected}
              className={cn(
                "relative h-full shrink-0 px-0 text-sm leading-none font-semibold tracking-tight transition-colors",
                "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-white after:transition-opacity after:content-['']",
                selected
                  ? "text-white after:opacity-100"
                  : "text-grey-70 after:opacity-0 hover:text-white/80",
              )}
              id={triggerId}
              key={tab.value}
              onClick={() => tabsState.selectValue(tab.value)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              role="tab"
              tabIndex={selected ? 0 : -1}
              type="button"
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => {
        const selected = tabsState.selectedValue === tab.value;
        return (
          <div
            aria-labelledby={`${tabsId}-${tab.value}-trigger`}
            className="prose-inside-content mt-4 mb-0 [&_.theme-code-block]:!mt-0 [&_.theme-code-block]:!mb-0"
            hidden={!selected}
            id={`${tabsId}-${tab.value}-panel`}
            key={tab.value}
            role="tabpanel"
          >
            {selected ? tab.content : null}
          </div>
        );
      })}
    </div>
  );
}
