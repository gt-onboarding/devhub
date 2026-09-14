import type { ReactNode } from "react";
import Link from "next/link";
import { T } from "gt-next";

import { cn } from "@/lib/utils";

type FooterLink = {
  permalink: string;
  title: string;
};

type DocsFooterProps = {
  className?: string;
  next?: FooterLink | null;
  previous?: FooterLink | null;
};

function DocsFooterLink({
  children,
  className,
  href,
}: {
  children: ReactNode;
  className: string;
  href: string;
}): ReactNode {
  if (href.endsWith("/")) {
    return (
      <a className={className} href={href}>
        {children}
      </a>
    );
  }

  return (
    <Link className={className} href={href}>
      {children}
    </Link>
  );
}

export function DocsFooter({
  className,
  next,
  previous,
}: DocsFooterProps): ReactNode {
  return (
    <footer className={cn("footer mt-16 bg-transparent md:mt-22", className)}>
      {previous || next ? (
        <>
          <div className="mb-7 h-px w-full bg-[#27272A]" aria-hidden="true" />
          <div className="flex justify-between gap-x-6">
            {previous ? (
              <p className="flex flex-col gap-y-3">
                <span className="relative z-10 inline-flex text-[0.8125rem]/none whitespace-nowrap text-[#A1A1AA]">
                  <T>Previous</T>
                </span>
                <DocsFooterLink
                  className="text-orange hover:text-db-lava text-sm leading-none no-underline hover:no-underline"
                  href={previous.permalink}
                >
                  {previous.title}
                </DocsFooterLink>
              </p>
            ) : (
              <span aria-hidden="true" />
            )}
            {next ? (
              <p className="ml-auto flex flex-col items-end gap-y-3 text-right">
                <span className="relative z-10 inline-flex text-[0.8125rem]/none whitespace-nowrap text-[#A1A1AA]">
                  <T>Next</T>
                </span>
                <DocsFooterLink
                  className="text-orange hover:text-db-lava text-sm leading-none no-underline hover:no-underline"
                  href={next.permalink}
                >
                  {next.title}
                </DocsFooterLink>
              </p>
            ) : null}
          </div>
        </>
      ) : null}
    </footer>
  );
}
