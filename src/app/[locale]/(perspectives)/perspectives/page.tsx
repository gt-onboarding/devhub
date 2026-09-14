import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { T, useGT } from "gt-next";
import { getGT, getLocale } from "gt-next/server";

import { getMetadata } from "@/lib/get-metadata";
import { getPerspectiveEntries } from "@/lib/perspectives/perspective-entries";

export async function generateMetadata(): Promise<Metadata> {
  const gt = await getGT();
  return getMetadata({
    title: gt("Perspectives"),
    description: gt(
      "Answers to common questions about building data apps and AI agents on Databricks.",
    ),
    pathname: "/perspectives",
    locale: await getLocale(),
  });
}

export default function PerspectivesPage(): ReactNode {
  const gt = useGT();
  const entries = getPerspectiveEntries();

  return (
    <section className="mx-auto w-full max-w-4xl px-5 py-12 md:px-8 md:py-16">
      <header className="max-w-3xl">
        <span className="text-grey-50 m-0 block font-mono text-xs leading-none font-medium uppercase">
          <T>Perspectives</T>
        </span>
        <h1 className="font-heading md:leading-tighter lg:leading-tighter mt-5 max-w-4xl text-3xl leading-tight font-medium tracking-tight text-balance md:text-5xl lg:text-6xl">
          DevHub
        </h1>
        <p className="text-muted-foreground mt-2.5 max-w-lg text-lg leading-snug tracking-tight text-pretty lg:mt-4">
          <T>
            Answers to common questions about building data apps and AI agents
            on Databricks.
          </T>
        </p>
      </header>

      <div
        className="mt-12 flex flex-col gap-y-3.5"
        aria-label={gt("Perspective pages")}
      >
        {entries.map((entry) => (
          <article className="flex items-start gap-x-3" key={entry.slug}>
            <span
              className="bg-grey-80 relative top-3 h-px w-2.5 shrink-0"
              aria-hidden="true"
            />
            <Link
              className="hover:text-orange focus-visible:outline-db-cyan block text-base/snug font-normal text-white no-underline transition-colors hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-4"
              href={`/perspectives/${entry.slug}`}
            >
              {entry.question}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
