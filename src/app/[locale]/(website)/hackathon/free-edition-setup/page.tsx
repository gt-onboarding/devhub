import type { ReactNode } from "react";
import type { Metadata } from "next";
import { msg, T } from "gt-next";
import { getGT, getLocale } from "gt-next/server";

import { getMetadata } from "@/lib/get-metadata";
import { renderHackathonSupportMarkdown } from "@/lib/hackathon-support-markdown";
import { Prose } from "@/components/content/prose";
import { Faq, type HackathonFaqItem } from "@/components/hackathon/faq";
import {
  HackathonSupportFooter,
  HackathonSupportIntro,
} from "@/components/hackathon/hackathon-support-sections";

const inlineLink =
  "font-medium text-db-lava underline underline-offset-2 hover:text-db-lava-dark";

export async function generateMetadata(): Promise<Metadata> {
  const gt = await getGT();
  return getMetadata({
    title: gt("Set up Databricks Free Edition"),
    description: gt(
      "How to set up Databricks Free Edition for the hackathon: create your account, work locally, and get your team ready to build and demo.",
    ),
    noIndex: true,
    locale: await getLocale(),
    pathname: "/hackathon/free-edition-setup",
    type: "article",
  });
}

const faqs: HackathonFaqItem[] = [
  {
    question: msg("Can I use my company or enterprise Databricks account?"),
    answer: (
      <T>
        Please don't. Use Free Edition so every team is working under the same
        platform constraints.
      </T>
    ),
  },
  {
    question: msg("What if I already have a Free Edition account?"),
    answer: (
      <T>
        Use it. You do not need to create a new one unless your existing
        workspace is blocked, out of resources, or tied up with other work.
      </T>
    ),
  },
  {
    question: msg("What if I cannot get into my Free Edition account?"),
    answer: (
      <T>
        Create a new Free Edition account with another email address or email
        alias.
      </T>
    ),
  },
  {
    question: msg(
      "What if my existing Free Edition account has resources running that I do not want to tear down?",
    ),
    answer: (
      <T>
        Create a separate Free Edition account for the hackathon using another
        email address or alias.
      </T>
    ),
  },
  {
    question: msg("What if I use up my Free Edition credits or quota?"),
    answer: (
      <T>
        <p>
          While the default credit limits are generous, we can add credits if
          needed. If you hit a limit during the hackathon, simply post your
          account ID in the #get-databricks-credits{" "}
          <a
            className={inlineLink}
            href="https://discord.com/invite/bedRGCjFq"
            rel="noopener noreferrer"
            target="_blank"
          >
            Discord
          </a>{" "}
          channel.
        </p>
      </T>
    ),
  },
  {
    question: msg("What limits should I expect?"),
    answer: (
      <T>
        Free Edition is serverless-only and quota-limited. Plan to build
        efficiently, stop unused workloads, and avoid long-running jobs where
        possible.
      </T>
    ),
  },
  {
    question: msg("Can I add teammates to my Free Edition workspace?"),
    answer: (
      <T>
        <p>
          Yes, teammates can be added to your workspace for collaboration. This{" "}
          <a
            className={inlineLink}
            href="https://www.youtube.com/watch?v=eA1SZvKiCfk"
            rel="noopener noreferrer"
            target="_blank"
          >
            step-by-step video
          </a>{" "}
          shows you how.
        </p>
      </T>
    ),
  },
];

export default async function FreeEditionSetupPage(): Promise<ReactNode> {
  const gt = await getGT();
  const body = await renderHackathonSupportMarkdown({
    locale: await getLocale(),
    markdownSlug: "free-edition-setup",
  });

  return (
    <main className="bg-black text-white">
      <section className="pt-9 pb-24 md:pt-12 lg:pb-40 xl:pt-17.5">
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <article>
            <HackathonSupportIntro title={gt("Set up Databricks Free Edition")}>
              <T>
                Build and demo your hackathon project on Databricks Free
                Edition. Here&rsquo;s how to get your account and team set up.
              </T>
            </HackathonSupportIntro>

            <div className="mt-12 max-w-184 md:mt-16">
              <Prose variant="dark">{body}</Prose>
            </div>
          </article>
        </div>
      </section>

      <HackathonSupportFooter>
        <Faq
          title={gt("Frequently asked questions")}
          items={faqs}
          theme="light"
        />
      </HackathonSupportFooter>
    </main>
  );
}
