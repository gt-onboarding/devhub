import { useGT } from "gt-next";
import { SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.5 2.5L2.5 13.5"
        stroke="currentColor"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 2.5L13.5 13.5"
        stroke="currentColor"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TemplateSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const gt = useGT();

  return (
    <div className="bg-db-oat-medium relative">
      <SearchIcon className="text-grey-70 absolute top-1/2 left-3 size-5 -translate-y-1/2" />
      <Input
        className="border-grey-80 placeholder:text-grey-60 active:border-db-lava focus-visible:border-db-lava dark:border-grey-80 h-10 rounded-none bg-transparent pr-11 pl-11 text-base tracking-tight shadow-none focus-visible:ring-0 md:text-base lg:h-11 dark:bg-transparent [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
        type="search"
        placeholder={gt("Search templates...")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value.length > 0 ? (
        <button
          className="text-grey-70 absolute top-1/2 right-3 flex size-5 -translate-y-1/2 items-center justify-center transition-colors hover:text-black focus-visible:text-black focus-visible:ring-0 focus-visible:outline-none"
          type="button"
          aria-label={gt("Clear search")}
          onClick={() => onChange("")}
        >
          <CloseIcon className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
