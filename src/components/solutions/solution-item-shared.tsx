import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMessages } from "gt-next";

import {
  getSolutionItemHref,
  isLinkedSolutionItem,
  type SolutionItem,
} from "@/lib/solutions/solutions";
import { cn } from "@/lib/utils";

export function SolutionArrowIcon({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}): ReactNode {
  return (
    <svg
      className={cn("overflow-visible", className)}
      viewBox="0 0 22.4029 34.097"
      fill="none"
      style={style}
      aria-hidden="true"
    >
      <path
        d="M20.2816 11.2015L11.2015 2.12132L2.12132 11.2015"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="square"
      />
      <path
        d="M11.2052 32.597V2.89849"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function formatSolutionDate(date: string, locale = "en"): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function SolutionItemLink({
  className,
  item,
  ariaLabel,
  children,
}: {
  className: string;
  item: SolutionItem;
  ariaLabel?: string;
  children: ReactNode;
}): ReactNode {
  const href = getSolutionItemHref(item);

  if (isLinkedSolutionItem(item)) {
    return (
      <a
        className={className}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
      >
        {children}
      </a>
    );
  }

  return (
    <Link className={className} href={href} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

export function SolutionItemVisual({
  item,
  variant,
  width,
  height,
  preload = false,
  loading,
}: {
  item: SolutionItem;
  variant: "card" | "featured";
  width?: number;
  height?: number;
  preload?: boolean;
  loading?: "eager" | "lazy";
}): ReactNode {
  const m = useMessages();
  const shouldPreload = preload || variant === "featured";

  if (item.previewImage) {
    return (
      <Image
        className={cn(
          "absolute inset-0 h-full w-full object-cover",
          variant === "card" &&
            "transition-transform duration-300 group-hover:scale-102",
        )}
        src={item.previewImage}
        alt={item.previewImageAlt ? m(item.previewImageAlt) : ""}
        fill
        sizes={width ? `${width}px` : "100vw"}
        loading={shouldPreload ? "eager" : loading}
        preload={shouldPreload}
        quality={100}
      />
    );
  }

  if (variant === "featured") {
    return (
      <div className="from-db-navy-light to-grey-40 absolute inset-0 bg-linear-to-b" />
    );
  }

  return <div className="bg-grey-20 absolute inset-0" />;
}
