import type { ReactNode } from "react";
import type { Metadata } from "next";
import { T } from "gt-next";
import { getGT, getLocale } from "gt-next/server";

import { getMetadata } from "@/lib/get-metadata";
import { renderHackathonSupportMarkdown } from "@/lib/hackathon-support-markdown";
import { Prose } from "@/components/content/prose";
import {
  HackathonSupportFooter,
  HackathonSupportIntro,
} from "@/components/hackathon/hackathon-support-sections";

export async function generateMetadata(): Promise<Metadata> {
  const gt = await getGT();
  return getMetadata({
    title: gt("Hackathon challenge"),
    description: gt(
      "The full hackathon challenge prompt: build a Databricks App that turns messy healthcare facility data into trustworthy decisions, with a dataset overview and four tracks to pick from.",
    ),
    noIndex: true,
    locale: await getLocale(),
    pathname: "/hackathon/challenge",
    type: "article",
  });
}

export default async function ChallengePage(): Promise<ReactNode> {
  const gt = await getGT();
  const body = await renderHackathonSupportMarkdown({
    markdownSlug: "challenge",
    tablePresentation: "prose",
  });

  return (
    <main className="bg-black text-white">
      <section className="pt-9 pb-24 md:pt-12 lg:pb-40 xl:pt-17.5">
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <article>
            <HackathonSupportIntro title={gt("The challenge")}>
              <T>
                Build a Databricks App that turns messy healthcare facility data
                into decisions a non-technical planner can trust. Read the full
                prompt, dataset overview, and the four tracks below.
              </T>
            </HackathonSupportIntro>

            <div className="mt-12 max-w-184 md:mt-16">
              <Prose className="hackathon-challenge-prose" variant="dark">
                {body}
              </Prose>
            </div>
          </article>
        </div>
      </section>

      <HackathonSupportFooter />
    </main>
  );
}
