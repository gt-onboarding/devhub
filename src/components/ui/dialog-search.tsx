"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ComponentProps,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
  type SVGProps,
} from "react";
import { T, useGT } from "gt-next";
import { Search as SearchIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";

export type SearchDialogIcon = ComponentType<
  SVGProps<SVGSVGElement> & { title?: string }
>;

export type SearchDialogItem = {
  id: string;
  title: string;
  description: string;
  external?: boolean;
  href: string;
  group: string;
  icon: SearchDialogIcon;
  keywords?: string[];
};

type SearchDialogGroup = {
  group: string;
  items: SearchDialogItem[];
};

const searchDialogStyle = {
  "--search-dialog-width": "51.5rem",
  "--search-list-max-height": "36.25rem",
} as CSSProperties;

export function groupSearchDialogItems(
  items: readonly SearchDialogItem[],
): SearchDialogGroup[] {
  const groups = new Map<string, SearchDialogItem[]>();

  for (const item of items) {
    const groupItems = groups.get(item.group) ?? [];
    groupItems.push(item);
    groups.set(item.group, groupItems);
  }

  return Array.from(groups, ([group, groupItems]) => ({
    group,
    items: groupItems,
  }));
}

function useSearchDialogShortcut({
  onOpenChange,
  open,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}): void {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange, open]);
}

export function useSearchDialogState(): {
  open: boolean;
  query: string;
  setQuery: (query: string) => void;
  handleOpenChange: (open: boolean) => void;
} {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleOpenChange = useCallback((nextOpen: boolean): void => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setQuery("");
    }
  }, []);

  useSearchDialogShortcut({ onOpenChange: handleOpenChange, open });

  return { open, query, setQuery, handleOpenChange };
}

export function SearchDialogTriggerButton({
  ariaLabel,
  className,
  iconClassName,
  kbdClassName,
  placeholder,
  ...props
}: {
  ariaLabel: string;
  className: string;
  iconClassName?: string;
  kbdClassName: string;
  placeholder?: string;
} & ComponentProps<typeof Button>): ReactNode {
  const gt = useGT();

  return (
    <Button
      className={className}
      type="button"
      size="sm"
      aria-label={ariaLabel}
      {...props}
    >
      <SearchIcon
        className={cn("size-3.5", iconClassName)}
        aria-hidden="true"
        data-icon="inline-start"
      />
      <span className="mr-auto min-w-0 truncate">
        {placeholder ?? gt("Search...")}
      </span>
      <Kbd className={kbdClassName}>⌘K</Kbd>
    </Button>
  );
}

function SearchResultItem({
  highlighted,
  item,
  onSelect,
  showDescription,
}: {
  highlighted?: boolean;
  item: SearchDialogItem;
  onSelect: () => void;
  showDescription: boolean;
}): ReactNode {
  const Icon = item.icon;

  return (
    <CommandItem
      className={cn(
        "group data-[selected=true]:!text-db-navy flex cursor-pointer items-center gap-x-3 rounded-none px-4 py-3 text-left font-normal text-white no-underline transition-colors duration-150 outline-none hover:bg-white/8 data-[selected=true]:bg-white/6 data-[selected=true]:hover:bg-white/8",
        highlighted && "bg-white/6",
        !showDescription && "py-2.5",
      )}
      value={item.id}
      keywords={item.keywords ?? [item.title, item.description, item.group]}
      onSelect={onSelect}
    >
      <Icon
        className="text-grey-70 size-4 shrink-0 overflow-visible transition-colors duration-150 group-hover:text-white group-data-[selected=true]:text-white"
        aria-hidden="true"
      />
      <div className="flex min-w-0 flex-col gap-y-1">
        <p className="m-0 line-clamp-1 max-w-full text-base leading-tight font-normal tracking-normal text-white">
          {item.title}
        </p>
        {showDescription ? (
          <p className="text-grey-60 m-0 line-clamp-1 max-w-full text-base leading-snug font-normal tracking-normal">
            {item.description}
          </p>
        ) : null}
      </div>
    </CommandItem>
  );
}

function SearchResultGroup({
  group,
  highlightFirst,
  items,
  onSelect,
  showDescription,
}: {
  group: string;
  highlightFirst?: boolean;
  items: SearchDialogItem[];
  onSelect: (item: SearchDialogItem) => void;
  showDescription: boolean;
}): ReactNode {
  if (items.length === 0) return null;

  return (
    <CommandGroup
      className="p-0 text-white **:[[cmdk-group-heading]]:px-0 **:[[cmdk-group-heading]]:pb-3"
      heading={
        <h3 className="m-0 font-mono text-base leading-none font-normal tracking-normal !text-[#9194a1]">
          {group}
        </h3>
      }
    >
      <div className="flex flex-col gap-y-2">
        {items.map((item, index) => (
          <SearchResultItem
            key={item.id}
            highlighted={highlightFirst && index === 0}
            item={item}
            onSelect={() => onSelect(item)}
            showDescription={showDescription}
          />
        ))}
      </div>
    </CommandGroup>
  );
}

export function SearchDialogContent({
  emptyText,
  onOpenChange,
  onQueryChange,
  onSelect,
  query,
  resultGroups,
  resultsHeading,
  showDescription,
  suggestedHeading,
  title,
}: {
  emptyText?: string;
  onOpenChange: (open: boolean) => void;
  onQueryChange: (query: string) => void;
  onSelect: (item: SearchDialogItem) => void;
  query: string;
  resultGroups: SearchDialogGroup[];
  resultsHeading: string;
  showDescription: boolean;
  suggestedHeading: string;
  title: string;
}): ReactNode {
  const gt = useGT();

  return (
    <DialogContent
      className="search-dialog border-grey-20 data-[state=closed]:slide-out-to-bottom-1/2 data-[state=closed]:zoom-out-100 data-[state=open]:slide-in-from-bottom-1/2 data-[state=open]:zoom-in-100 sm:data-[state=closed]:slide-out-to-bottom-1 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:slide-in-from-bottom-1 sm:data-[state=open]:zoom-in-95 top-auto bottom-0 h-[75dvh] w-full max-w-[calc(100%-2rem)] translate-y-0 overflow-hidden rounded-none bg-black p-0 text-white shadow-none outline-none sm:top-[19dvh] sm:bottom-auto sm:h-auto sm:max-w-(--search-dialog-width)"
      overlayClassName="bg-black/85"
      onCloseAutoFocus={(event) => event.preventDefault()}
      showCloseButton={false}
      style={searchDialogStyle}
    >
      <DialogTitle className="sr-only">{title}</DialogTitle>
      <Command
        className={cn(
          "relative rounded-none bg-black font-normal text-white",
          "**:data-[slot=command-input-wrapper]:border-grey-20 **:data-[slot=command-input-wrapper]:h-16 **:data-[slot=command-input-wrapper]:px-5",
          "[&_[data-slot=command-input-wrapper]_svg]:hidden",
          "**:data-[slot=command-input]:placeholder:text-grey-60 **:data-[slot=command-input]:h-16 **:data-[slot=command-input]:pr-16 **:data-[slot=command-input]:text-lg **:data-[slot=command-input]:leading-snug **:data-[slot=command-input]:font-normal **:data-[slot=command-input]:tracking-normal **:data-[slot=command-input]:text-white md:**:data-[slot=command-input]:text-xl/snug",
        )}
        shouldFilter={false}
      >
        <header className="relative">
          <CommandInput
            value={query}
            onValueChange={onQueryChange}
            placeholder={gt("What are you searching for?")}
          />
          <DialogClose asChild>
            <Button
              className="border-grey-20 !border-grey-20 hover:!bg-grey-12 absolute top-5 right-5 rounded-none border !bg-transparent bg-transparent px-3 font-normal text-white hover:text-white"
              variant="outline"
              size="xs"
            >
              <T>
                <span className="sr-only">Close search dialog</span>
              </T>
              <span className="text-xs leading-none font-normal tracking-normal">
                Esc
              </span>
            </Button>
          </DialogClose>
        </header>

        <section aria-labelledby="search-dialog-results-heading">
          <h2 className="sr-only" id="search-dialog-results-heading">
            {showDescription ? resultsHeading : suggestedHeading}
          </h2>
          <CommandList className="max-h-[calc(75dvh-4rem)] overflow-y-auto px-5 py-6 sm:max-h-(--search-list-max-height)">
            <CommandEmpty className="text-grey-60 py-3 text-center text-base leading-tight font-normal tracking-normal">
              {emptyText ?? gt("No results found.")}
            </CommandEmpty>
            <div className="flex flex-col gap-y-6">
              {resultGroups.map((group, groupIndex) => (
                <SearchResultGroup
                  key={group.group}
                  group={group.group}
                  highlightFirst={groupIndex === 0}
                  items={group.items}
                  onSelect={onSelect}
                  showDescription={showDescription}
                />
              ))}
            </div>
          </CommandList>
        </section>
      </Command>
    </DialogContent>
  );
}
