"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useGT } from "gt-next";
import { CircleArrowUp } from "lucide-react";
import { AnimatePresence, domAnimation, LazyMotion } from "motion/react";
import * as m from "motion/react-m";

import { cn } from "@/lib/utils";

type BackToTopProps = {
  className?: string;
  label?: string;
  withSeparator?: boolean;
};

export function BackToTop({
  className,
  label,
  withSeparator = false,
}: BackToTopProps): ReactNode {
  const gt = useGT();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > window.innerHeight);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {visible ? (
          <>
            {withSeparator ? (
              <m.span
                className="bg-prose-border my-3.5 h-px w-full"
                aria-hidden="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                role="none"
              />
            ) : null}
            <m.button
              className={cn(
                "text-grey-70 flex w-fit items-center gap-2 rounded text-sm leading-snug tracking-tight transition-colors duration-300 hover:text-white",
                className,
              )}
              onClick={handleClick}
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CircleArrowUp size={20} aria-hidden="true" />
              {label ?? gt("Back to top")}
            </m.button>
          </>
        ) : (
          <span className={cn("invisible h-5", className)} aria-hidden="true" />
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
