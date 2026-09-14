import type { ReactNode } from "react";
import { T } from "gt-next";

export function SolutionHero(): ReactNode {
  return (
    <header className="mb-14 md:mb-18 lg:mb-22 xl:mb-28.5">
      <T>
        <h1 className="font-heading m-0 max-w-232 text-4xl/[1.125] font-normal tracking-normal text-balance wrap-break-word text-white md:text-5xl/[1.125] lg:text-6xl/[1.125] xl:text-7xl/[1.125]">
          <span className="text-db-lava">Developer-first </span>
          perspectives on building on Databricks.
        </h1>
      </T>
    </header>
  );
}
