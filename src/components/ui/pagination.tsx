import * as React from "react";
import { T, useGT } from "gt-next";
import { MoreHorizontalIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants, type Button } from "@/components/ui/button";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  const gt = useGT();

  return (
    <nav
      role="navigation"
      aria-label={gt("pagination", {
        $context: "aria-label for the page navigation landmark",
      })}
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">;

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className,
      )}
      {...props}
    />
  );
}

function PaginationArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.0013 11.0807L2.91797 6.9974L7.0013 2.91406"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M11.0846 7L2.91797 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  const gt = useGT();

  return (
    <PaginationLink
      aria-label={gt("Go to previous page")}
      size="default"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}
    >
      <PaginationArrowIcon />
      <T>
        <span className="hidden sm:block">Previous</span>
      </T>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  const gt = useGT();

  return (
    <PaginationLink
      aria-label={gt("Go to next page")}
      size="default"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      <T>
        <span className="hidden sm:block">Next</span>
      </T>
      <PaginationArrowIcon className="rotate-180" />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <T>
        <span className="sr-only">More pages</span>
      </T>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
