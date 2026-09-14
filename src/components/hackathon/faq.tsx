import type { ReactNode } from "react";
import { useMessages } from "gt-next";
import { Accordion as AccordionPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { Accordion, AccordionItem } from "@/components/ui/accordion";

export type HackathonFaqItem = {
  question: string;
  answer: ReactNode;
};

type HackathonFaqTheme = "light" | "dark";

type FaqProps = {
  items: HackathonFaqItem[];
  title?: string;
  theme?: HackathonFaqTheme;
  className?: string;
};

const themeClasses: Record<
  HackathonFaqTheme,
  {
    title: string;
    accordion: string;
    item: string;
    trigger: string;
    content: string;
    icon: string;
  }
> = {
  light: {
    title: "text-black",
    accordion: "text-black",
    item: "border-grey-80",
    trigger: "text-black hover:text-black/80",
    content: "text-grey-50",
    icon: "text-orange",
  },
  dark: {
    title: "text-white",
    accordion: "text-white",
    item: "border-grey-20",
    trigger: "text-white hover:text-white/80",
    content: "text-grey-90",
    icon: "text-grey-70",
  },
};

function FaqIcon({ className }: { className?: string }): ReactNode {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("size-6 shrink-0", className)}
    >
      <path
        d="M3 12.5H21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        data-slot="faq-icon-vertical"
        d="M12 3.5V21.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        className="origin-center transition-transform duration-200 ease-out [transform-box:fill-box]"
      />
    </svg>
  );
}

export function Faq({
  title,
  items,
  theme = "light",
  className,
}: FaqProps): ReactNode {
  const m = useMessages();
  const classes = themeClasses[theme];

  return (
    <section className={cn("faq w-full py-12 md:py-16 lg:py-24", className)}>
      <div className="mx-auto flex w-full max-w-4xl flex-col px-5 md:px-8">
        {title && (
          <h2
            className={cn(
              "mb-5 text-3xl leading-[1.125] tracking-[-0.04em] md:text-4xl md:leading-[1.125]",
              classes.title,
            )}
          >
            {title}
          </h2>
        )}
        <Accordion
          type="single"
          collapsible
          defaultValue={items.length > 0 ? "item-0" : undefined}
          className={classes.accordion}
        >
          {items.map(({ question, answer }, index) => (
            <AccordionItem
              className={cn(
                classes.item,
                index === items.length - 1 && "last:border-b",
              )}
              key={index}
              value={`item-${index}`}
            >
              <AccordionPrimitive.Header className="flex leading-5">
                <AccordionPrimitive.Trigger
                  data-slot="accordion-trigger"
                  className={cn(
                    "focus-visible:ring-db-cyan/70 flex w-full flex-1 items-start justify-between gap-x-4 rounded-md py-6 text-left tracking-tight transition-colors outline-none hover:no-underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50",
                    classes.trigger,
                  )}
                >
                  <span className="text-lg leading-tight font-medium tracking-tight text-pretty md:text-xl md:leading-tight">
                    {m(question)}
                  </span>
                  <FaqIcon className={classes.icon} />
                </AccordionPrimitive.Trigger>
              </AccordionPrimitive.Header>
              <AccordionPrimitive.Content
                data-slot="accordion-content"
                className="overflow-hidden text-sm data-[state=closed]:animate-[faq-accordion-up_200ms_ease-out] data-[state=open]:animate-[faq-accordion-down_200ms_ease-out]"
              >
                <div
                  className={cn(
                    "[&_a]:decoration-none [&_a]:decoration-none [&_a]:text-orange [&_a]:hover:text-db-lava flex flex-col gap-y-5 pt-1 pr-8 pb-3 text-base tracking-tight md:pt-0 md:pr-10",
                    classes.content,
                  )}
                >
                  {answer}
                </div>
              </AccordionPrimitive.Content>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
