"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGT, useMessages } from "gt-next";
import { ArrowUpRight } from "lucide-react";

import {
  getActiveProductHref,
  isExternalHref,
  isHeaderNavItemActive,
  PRODUCT_LINKS,
  type HeaderNavItem,
} from "@/lib/header-navigation";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

type HeaderNavProps = {
  className?: string;
  items: readonly HeaderNavItem[];
};

const PRODUCT_DROPDOWN_ROW_STEP = 24;
const PRODUCT_SCROLLBAR_STEP = 16;
const PRODUCT_SCROLL_DOT_TRACK_HEIGHT = 66;
const PRODUCT_SCROLL_DOT_Y_POSITIONS = Array.from(
  { length: 33 },
  (_, index) => index * 2 + 1.5,
);

function NavItemChrome({
  active,
  children,
  className,
}: {
  active: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      data-active={active ? "true" : undefined}
      className={cn(
        "group/nav-item relative inline-flex px-3 py-2 font-mono text-[0.9375rem] leading-none text-white no-underline hover:no-underline",
        className,
      )}
    >
      <span
        className={cn(
          "bg-grey-12 pointer-events-none absolute inset-0 overflow-hidden opacity-0 group-data-[state=open]/product-trigger:opacity-100",
          !active && "group-hover/nav-item:opacity-100",
        )}
        aria-hidden="true"
      >
        <span className="bg-orange absolute top-0 right-0 size-3 translate-x-1/2 -translate-y-1/2 rotate-45 overflow-hidden border-2 border-black" />
      </span>
      <span className="relative z-10">
        <span className={cn(active && "text-orange transition-colors")}>[</span>
        {children}
        <span className={cn(active && "text-orange transition-colors")}>]</span>
      </span>
    </span>
  );
}

function ProductDropdownFrame() {
  return (
    <svg
      data-product-dropdown-frame="true"
      className="pointer-events-none absolute top-2.5 left-1 z-30 h-[114px] w-[178px] overflow-visible text-white"
      viewBox="0 0 178 114"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M177.5 104.0319V113.5H0.5V0.5H177.5V1.44681V9.96809"
        stroke="currentColor"
      />
      <path
        d="M176.5 0.504639V1.45145V9.97272M176.5 113.5046V104.0365"
        stroke="currentColor"
      />
      <path d="M1.5 0.5V113.5" stroke="currentColor" />
    </svg>
  );
}

function ProductScrollArrow({
  direction,
  top,
}: {
  direction: "up" | "down";
  top: number;
}) {
  return (
    <span
      className="absolute left-[174.5px] z-30 size-3 text-white"
      style={{ top }}
    >
      <svg
        className={cn(
          "absolute top-[0.95px] left-[2.67px] h-[9.88514px] w-[6.6688px] overflow-visible",
          direction === "down" && "rotate-180",
        )}
        viewBox="0 0 6.6688 9.88514"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M5.87684 3.3344L3.3344 0.79196L0.79196 3.3344"
          stroke="currentColor"
          strokeWidth={1.12}
          strokeLinecap="square"
        />
        <path
          d="M3.33552 9.32514V1.00957"
          stroke="currentColor"
          strokeWidth={1.12}
          strokeLinecap="square"
        />
      </svg>
    </span>
  );
}

function ProductScrollDotColumn({ left, top }: { left: number; top: number }) {
  return (
    <svg
      data-product-dropdown-dot-column="true"
      className="absolute z-0 h-[66px] w-[3px] overflow-visible"
      style={{ left, top }}
      viewBox={`0 0 3 ${PRODUCT_SCROLL_DOT_TRACK_HEIGHT}`}
      fill="none"
      preserveAspectRatio="none"
    >
      {PRODUCT_SCROLL_DOT_Y_POSITIONS.map((dotY) => (
        <circle
          cx="1.5"
          cy={dotY}
          r="1"
          fill="currentColor"
          stroke="var(--grey-12)"
          key={dotY}
        />
      ))}
    </svg>
  );
}

function ProductScrollbar({
  highlightedProductIndex,
}: {
  highlightedProductIndex: number;
}) {
  return (
    <span
      className="pointer-events-none absolute inset-0 text-white"
      aria-hidden="true"
    >
      <ProductScrollDotColumn left={175.7} top={34} />
      <ProductScrollDotColumn left={177.9} top={35.04} />
      <ProductScrollDotColumn left={180.1} top={34} />
      <ProductScrollDotColumn left={182.3} top={35.04} />
      <ProductScrollArrow direction="up" top={21} />
      <span
        data-product-dropdown-thumb="true"
        className="absolute top-[34px] left-44 z-20 h-[18px] w-[9px] bg-white"
        style={{
          transform: `translateY(${
            highlightedProductIndex * PRODUCT_SCROLLBAR_STEP
          }px)`,
        }}
      />
      <ProductScrollArrow direction="down" top={100} />
    </span>
  );
}

function ProductDropdown({
  activeProductHref,
  highlightedProductHref,
  onHighlightChange,
  onHighlightReset,
}: {
  activeProductHref: string | undefined;
  highlightedProductHref: string | undefined;
  onHighlightChange: (href: string) => void;
  onHighlightReset: () => void;
}) {
  const gt = useGT();
  const highlightedProductIndex = Math.max(
    0,
    PRODUCT_LINKS.findIndex(({ href }) => href === highlightedProductHref),
  );

  return (
    <div
      className="bg-grey-12 relative h-[135px] w-[185px] font-mono text-sm leading-none text-white"
      onMouseLeave={onHighlightReset}
      onBlur={(event) => {
        const nextFocusedElement = event.relatedTarget;

        if (
          !(nextFocusedElement instanceof Node) ||
          !event.currentTarget.contains(nextFocusedElement)
        ) {
          onHighlightReset();
        }
      }}
    >
      <ProductDropdownFrame />
      <span
        data-product-dropdown-highlight="true"
        className="pointer-events-none absolute top-[18px] left-2.5 z-10 h-[22px] w-[166px] bg-white"
        style={{
          transform: `translateY(${
            highlightedProductIndex * PRODUCT_DROPDOWN_ROW_STEP
          }px)`,
        }}
        aria-hidden="true"
      />
      <div className="absolute top-[18px] left-2.5 z-20 flex w-[166px] flex-col gap-0.5">
        {PRODUCT_LINKS.map((product) => {
          const isProductActive = product.href === activeProductHref;
          const isProductHighlighted = product.href === highlightedProductHref;
          const isExternal = isExternalHref(product.href);

          return (
            <NavigationMenuLink
              active={isProductActive}
              asChild
              className={cn(
                "focus-visible:outline-db-cyan !flex !h-[22px] !w-full !flex-row !items-center !gap-0 !rounded-none !bg-transparent !px-2 !py-1 font-mono text-sm leading-none tracking-normal no-underline !transition-none outline-none hover:!bg-transparent hover:no-underline focus:!bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 data-[active=true]:!bg-transparent",
                isProductHighlighted
                  ? "!text-grey-12 hover:!text-grey-12 focus:!text-grey-12"
                  : "!text-white hover:!text-white focus:!text-white",
              )}
              key={product.href}
            >
              <Link
                aria-current={isProductActive ? "page" : undefined}
                href={product.href}
                onFocus={() => onHighlightChange(product.href)}
                onPointerEnter={() => onHighlightChange(product.href)}
                {...(isExternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {product.label}
                {isExternal && (
                  <ArrowUpRight
                    className={cn(
                      "ml-1 size-3.5 shrink-0",
                      isProductHighlighted ? "text-grey-12" : "text-white",
                    )}
                    aria-label={gt("(opens in a new tab)")}
                  />
                )}
              </Link>
            </NavigationMenuLink>
          );
        })}
      </div>
      <ProductScrollbar highlightedProductIndex={highlightedProductIndex} />
    </div>
  );
}

export function HeaderNav({ className, items }: HeaderNavProps) {
  const gt = useGT();
  const m = useMessages();
  const pathname = usePathname() ?? "/";
  const activeProductHref = getActiveProductHref(pathname);
  const [highlightedProductHref, setHighlightedProductHref] = useState<
    string | null
  >(null);
  const productHighlightHref =
    highlightedProductHref ?? activeProductHref ?? PRODUCT_LINKS[0]?.href;

  return (
    <NavigationMenu
      viewport={false}
      delayDuration={0}
      className={cn("flex max-w-none flex-none justify-start", className)}
      aria-label={gt("Main")}
    >
      <NavigationMenuList className="flex justify-start gap-0.5">
        {items.map((item) => {
          const { href, label } = item;

          if (item.id === "product") {
            const isActive = Boolean(activeProductHref);

            return (
              <NavigationMenuItem
                key={href}
                onPointerLeave={() => setHighlightedProductHref(null)}
              >
                <NavigationMenuTrigger className="group/product-trigger focus-visible:outline-db-cyan h-auto rounded-none bg-transparent! p-0 font-mono text-white shadow-none !transition-none hover:bg-transparent! hover:text-white! focus:bg-transparent! focus:text-white! focus-visible:outline-offset-2 data-[active=true]:!bg-transparent data-[state=open]:bg-transparent! data-[state=open]:text-white! [&>svg]:hidden">
                  <NavItemChrome active={isActive}>{m(label)}</NavItemChrome>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-grey-12! z-60 mt-0! h-[135px]! w-[185px]! overflow-visible! rounded-none! border-0! p-0! shadow-none! !transition-none !duration-0 group-data-[viewport=false]/navigation-menu:!duration-0 data-[motion^=from-]:!animate-none data-[motion^=to-]:!animate-none data-[state=closed]:!animate-none group-data-[viewport=false]/navigation-menu:data-[state=closed]:!animate-none data-[state=open]:!animate-none group-data-[viewport=false]/navigation-menu:data-[state=open]:!animate-none">
                  <ProductDropdown
                    activeProductHref={activeProductHref}
                    highlightedProductHref={productHighlightHref}
                    onHighlightChange={setHighlightedProductHref}
                    onHighlightReset={() => setHighlightedProductHref(null)}
                  />
                </NavigationMenuContent>
              </NavigationMenuItem>
            );
          }

          const isActive = isHeaderNavItemActive(item, pathname);

          return (
            <NavigationMenuItem key={href}>
              <NavigationMenuLink
                active={isActive}
                asChild
                className="block rounded-none bg-transparent p-0 text-white no-underline hover:bg-transparent hover:text-white hover:no-underline focus:bg-transparent focus:text-white data-active:bg-transparent data-active:hover:cursor-default"
              >
                <Link href={href}>
                  <NavItemChrome active={isActive}>{m(label)}</NavItemChrome>
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
