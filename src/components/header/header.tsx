"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { T, useGT } from "gt-next";

import { HEADER_LINKS } from "@/lib/header-navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SiteSearch, type SiteSearchItem } from "@/components/ui/site-search";
import { LocaleSwitcher } from "@/components/header/locale-switcher";
import { MobileNav } from "@/components/header/mobile-nav";
import { HeaderNav } from "@/components/header/nav";
import { Icons } from "@/components/icons";

export function Header({
  className,
  searchItems,
}: {
  className?: string;
  searchItems: readonly SiteSearchItem[];
}) {
  const gt = useGT();
  const pathname = usePathname() ?? "/";
  const [hasScrolled, setHasScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const isHomepage = pathname === "/";

  useEffect(() => {
    if (!triggerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHasScrolled(!entry.isIntersecting),
      { root: null, threshold: 0 },
    );
    observer.observe(triggerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        className="pointer-events-none -mt-px h-px w-full"
        ref={triggerRef}
        aria-hidden="true"
      />
      <header
        className={cn(
          "sticky top-0 z-50 flex h-14 items-center xl:h-auto xl:min-h-16 xl:border-b xl:border-transparent xl:py-3.5",
          mobileMenuOpen
            ? "bg-grey-80"
            : (!isHomepage || hasScrolled) && "bg-black backdrop-blur",
          hasScrolled && !mobileMenuOpen && "xl:border-white/4",
          className,
        )}
      >
        <div className="relative z-10 mx-auto flex w-full max-w-400 items-center justify-between px-5 xl:justify-start xl:px-8">
          <Link
            href="/"
            className="flex shrink-0 items-center no-underline hover:no-underline"
            aria-label={gt("Databricks Developer home")}
          >
            <Image
              src="/img/databricks-logo.svg"
              alt=""
              className={cn(
                "block h-6 w-auto shrink-0 xl:h-7",
                mobileMenuOpen && "brightness-0",
              )}
              loading="eager"
              height={28}
              width={177}
            />
          </Link>
          <HeaderNav
            className="ml-10 hidden xl:flex 2xl:ml-19.5"
            items={HEADER_LINKS}
          />
          <div className="hidden grow items-center justify-end gap-x-3 xl:flex">
            <div className="flex items-center gap-x-6">
              <Link
                href="https://www.reddit.com/r/databricks/"
                className="inline-flex size-4.5 items-center justify-center text-[#E4E5E7] no-underline hover:no-underline hover:opacity-85"
                aria-label={gt("Databricks subreddit")}
              >
                <Icons.reddit className="size-4.5" aria-hidden="true" />
              </Link>
              <Link
                href="https://www.youtube.com/@Databricks"
                className="inline-flex size-4.5 items-center justify-center text-[#E4E5E7] no-underline hover:no-underline hover:opacity-85"
                aria-label={gt("Databricks YouTube channel")}
              >
                <Icons.youtube className="size-4.5" aria-hidden="true" />
              </Link>
              <Link
                href="https://github.com/databricks/devhub"
                className="inline-flex size-4.5 items-center justify-center text-[#E4E5E7] no-underline hover:no-underline hover:opacity-85"
                aria-label={gt("DevHub GitHub repository")}
              >
                <Icons.github className="size-4.5" aria-hidden="true" />
              </Link>
            </div>
            <LocaleSwitcher className="ml-3" />
            <SiteSearch
              items={searchItems}
              previewLimit={8}
              suggestedHeading={gt("Suggested docs")}
              title={gt("Search documentation")}
              triggerClassName="ml-3"
            />
            <Button
              asChild
              className="h-9 rounded-none bg-white px-4.5 font-mono text-sm font-medium tracking-tight text-black shadow-none hover:bg-white/90"
            >
              <Link
                className="uppercase no-underline hover:no-underline"
                href="https://www.databricks.com/try-databricks"
                target="_blank"
              >
                <T>Try Databricks</T>
              </Link>
            </Button>
          </div>
          <MobileNav
            items={HEADER_LINKS}
            open={mobileMenuOpen}
            onOpenChange={setMobileMenuOpen}
            searchItems={searchItems}
          />
        </div>
      </header>
    </>
  );
}
