import { useMemo, type ReactNode, type SVGProps } from "react";
import { useGT, useMessages } from "gt-next";

import { useHistory } from "@/lib/client-router";
import { getSolutionCategoryLabel } from "@/lib/solutions/solution-category-labels";
import {
  filterSolutionItems,
  getSolutionItemHref,
  isLinkedSolutionItem,
  type SolutionItem,
} from "@/lib/solutions/solutions";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  groupSearchDialogItems,
  SearchDialogContent,
  SearchDialogTriggerButton,
  useSearchDialogState,
  type SearchDialogIcon,
  type SearchDialogItem,
} from "@/components/ui/dialog-search";

type SolutionSearchProps = {
  items: SolutionItem[];
};

const SOLUTION_SEARCH_PREVIEW_LIMIT = 7;

type SolutionSearchIconProps = SVGProps<SVGSVGElement> & { title?: string };

function BricksSearchIcon({
  title,
  ...props
}: SolutionSearchIconProps): ReactNode {
  return (
    <svg
      preserveAspectRatio="none"
      overflow="visible"
      viewBox="0 0 16.14 16.14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M6.57 0.57H0.57V8.57H6.57V0.57Z"
        stroke="currentColor"
        strokeWidth="1.14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.57 11.57H0.57V15.57H6.57V11.57Z"
        stroke="currentColor"
        strokeWidth="1.14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.57 0.57H9.57V5.57H15.57V0.57Z"
        stroke="currentColor"
        strokeWidth="1.14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.57 8.57H9.57V15.57H15.57V8.57Z"
        stroke="currentColor"
        strokeWidth="1.14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DatabaseSearchIcon({
  title,
  ...props
}: SolutionSearchIconProps): ReactNode {
  return (
    <svg
      preserveAspectRatio="none"
      overflow="visible"
      viewBox="0 0 14.14 16.14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M7.07 5.57C10.6599 5.57 13.57 4.45071 13.57 3.07C13.57 1.68929 10.6599 0.57 7.07 0.57C3.48015 0.57 0.57 1.68929 0.57 3.07C0.57 4.45071 3.48015 5.57 7.07 5.57Z"
        stroke="currentColor"
        strokeWidth="1.14"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.57 8.07C13.57 9.45071 10.6599 10.57 7.07 10.57C3.48015 10.57 0.57 9.45071 0.57 8.07"
        stroke="currentColor"
        strokeWidth="1.14"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0.57 3.07V13.07C0.57 14.451 3.48 15.57 7.07 15.57C10.66 15.57 13.57 14.451 13.57 13.07V3.07"
        stroke="currentColor"
        strokeWidth="1.14"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DocsSearchIcon({
  title,
  ...props
}: SolutionSearchIconProps): ReactNode {
  return (
    <svg
      preserveAspectRatio="none"
      overflow="visible"
      viewBox="0 0 14.14 16.14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M13.57 0.57H0.57V15.57H13.57V0.57Z"
        stroke="currentColor"
        strokeWidth="1.14"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.57 3.57H10.57"
        stroke="currentColor"
        strokeWidth="1.14"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.57 6.57H10.57"
        stroke="currentColor"
        strokeWidth="1.14"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.57 9.57H10.57"
        stroke="currentColor"
        strokeWidth="1.14"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.57 12.57H6.57"
        stroke="currentColor"
        strokeWidth="1.14"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RocketSearchIcon({
  title,
  ...props
}: SolutionSearchIconProps): ReactNode {
  return (
    <svg
      preserveAspectRatio="none"
      overflow="visible"
      viewBox="0 0 16.0682 16.0703"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M8.49091 2.79394C7.27047 2.26352 5.89786 2.19919 4.63316 2.61314C3.36846 3.02709 2.29953 3.89056 1.62891 5.03994L3.96891 7.37994"
        stroke="currentColor"
        strokeWidth="1.14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.2657 7.54266C13.8062 8.76655 13.8769 10.1466 13.4645 11.4194C13.052 12.6921 12.1853 13.7684 11.0297 14.4427L8.67969 12.0927"
        stroke="currentColor"
        strokeWidth="1.14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.81022 13.119L2.94922 9.258C2.94922 9.258 6.24722 1.053 15.4982 0.570001C14.9752 9.781 6.81022 13.119 6.81022 13.119Z"
        stroke="currentColor"
        strokeWidth="1.14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.44531 12.1384C2.78999 12.1384 3.12229 12.2579 3.38672 12.4743L3.49609 12.5729C3.77431 12.8522 3.92987 13.2305 3.92969 13.6247C3.92945 13.97 3.8098 14.3033 3.59277 14.568L3.49316 14.6774C3.40118 14.7693 3.21855 14.8811 2.93262 14.9929C2.65702 15.1006 2.33157 15.1916 2 15.2653C1.4135 15.3957 0.846822 15.4627 0.580078 15.4909C0.607861 15.2263 0.675583 14.657 0.806641 14.0671C0.880297 13.7356 0.970391 13.4101 1.07812 13.1345C1.16213 12.9196 1.24656 12.7627 1.32227 12.6589L1.39453 12.5729C1.67333 12.2946 2.05134 12.1384 2.44531 12.1384Z"
        stroke="currentColor"
        strokeWidth="1.14"
      />
      <path
        d="M9 8.07C9.55228 8.07 10 7.62229 10 7.07C10 6.51772 9.55228 6.07 9 6.07C8.44772 6.07 8 6.51772 8 7.07C8 7.62229 8.44772 8.07 9 8.07Z"
        fill="currentColor"
      />
    </svg>
  );
}

const solutionSearchCategoryIcons = [
  { category: "Launch", icon: RocketSearchIcon },
  { category: "Developer Experience", icon: DocsSearchIcon },
  { category: "Updates", icon: DocsSearchIcon },
  { category: "Agent-Led Development", icon: DocsSearchIcon },
  { category: "Lakebase", icon: DatabaseSearchIcon },
  { category: "Databricks Apps", icon: DocsSearchIcon },
  { category: "Agent Bricks", icon: BricksSearchIcon },
] satisfies { category: string; icon: SearchDialogIcon }[];

function getSolutionSearchCategoryIcon(category: string): SearchDialogIcon {
  return (
    solutionSearchCategoryIcons.find(
      (categoryIcon) => categoryIcon.category === category,
    )?.icon ?? DocsSearchIcon
  );
}

function buildSolutionSearchItems(
  items: SolutionItem[],
  m: ReturnType<typeof useMessages>,
): SearchDialogItem[] {
  return items.map((item) => {
    const category = item.tags.at(0) ?? "Solution";
    const title = m(item.title);
    const description = m(item.description);

    return {
      id: item.id,
      title,
      description,
      href: getSolutionItemHref(item),
      external: isLinkedSolutionItem(item),
      group: m(getSolutionCategoryLabel(category)),
      icon: getSolutionSearchCategoryIcon(category),
      keywords: [title, description, item.source, category],
    };
  });
}

function getSolutionSearchResultItems(
  items: SolutionItem[],
  query: string,
): SolutionItem[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length === 0) {
    return items.slice(0, SOLUTION_SEARCH_PREVIEW_LIMIT);
  }

  return filterSolutionItems(items, {
    category: null,
    searchQuery: normalizedQuery,
  });
}

function SolutionSearchDialog({
  query,
  onQueryChange,
  onOpenChange,
  items,
}: {
  query: string;
  onQueryChange: (query: string) => void;
  onOpenChange: (open: boolean) => void;
  items: SolutionItem[];
}): ReactNode {
  const gt = useGT();
  const m = useMessages();
  const history = useHistory();
  const resultGroups = useMemo(() => {
    const resultItems = getSolutionSearchResultItems(items, query);
    return groupSearchDialogItems(buildSolutionSearchItems(resultItems, m));
  }, [items, m, query]);
  const hasQuery = query.trim().length > 0;

  function handleSelect(item: SearchDialogItem): void {
    onOpenChange(false);

    if (item.external) {
      window.open(item.href, "_blank", "noopener,noreferrer");
      return;
    }

    history.push(item.href);
  }

  return (
    <SearchDialogContent
      onOpenChange={onOpenChange}
      onQueryChange={onQueryChange}
      onSelect={handleSelect}
      query={query}
      resultGroups={resultGroups}
      resultsHeading={gt("Search results")}
      showDescription={hasQuery}
      suggestedHeading={gt("Suggested solutions")}
      title={gt("Search solutions")}
    />
  );
}

export function SolutionSearch({ items }: SolutionSearchProps): ReactNode {
  const gt = useGT();
  const { open, query, setQuery, handleOpenChange } = useSearchDialogState();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <SearchDialogTriggerButton
          ariaLabel={gt("Search solutions")}
          placeholder={gt("Search posts...")}
          className="border-grey-60 hover:text-grey-70 focus-visible:ring-db-cyan dark:border-grey-60! h-8 w-full justify-start rounded-none border bg-transparent pr-2.5 pl-2.5 text-[0.8125rem] leading-none font-normal tracking-normal text-[#71717A] shadow-none hover:bg-transparent lg:w-69 lg:has-[>kbd]:!pr-1.5 dark:bg-transparent! dark:hover:bg-transparent!"
          kbdClassName="hidden h-5.5 w-8.75 min-w-0 rounded-none border border-grey-40 bg-transparent px-1.5 py-1 shadow-none text-sm leading-none font-normal tracking-normal text-grey-60 lg:inline-flex"
          variant="outline"
        />
      </DialogTrigger>
      <SolutionSearchDialog
        query={query}
        onQueryChange={setQuery}
        onOpenChange={handleOpenChange}
        items={items}
      />
    </Dialog>
  );
}
