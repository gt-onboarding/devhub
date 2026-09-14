import type { ReactNode } from "react";
import type { Metadata } from "next";
import { T } from "gt-next";
import { getGT, getLocale } from "gt-next/server";

import { getMetadata } from "@/lib/get-metadata";
import { BackLink } from "@/components/ui/back-link";
import Footer from "@/components/footer";
import { QuickStartChecklist } from "@/components/hackathon/quick-start-checklist";
import CTA from "@/components/home/cta";

export async function generateMetadata(): Promise<Metadata> {
  const gt = await getGT();
  return getMetadata({
    title: gt("Hackathon quick start checklist"),
    description: gt(
      "Step-by-step checklist to get set up for the hackathon: install a coding agent, create a Free Edition account, get the dataset, set up the CLI, and scaffold your app.",
    ),
    noIndex: true,
    locale: await getLocale(),
    pathname: "/hackathon/quick-start-checklist",
    type: "article",
  });
}

export default function QuickStartChecklistPage(): ReactNode {
  return (
    <main className="bg-black text-white">
      <section className="pt-9 md:pt-12 xl:pt-17.5">
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <BackLink href="/hackathon">
            <T>Back to the hackathon</T>
          </BackLink>
          <T>
            <h1 className="mt-6.5 text-[2rem]/[1.125] font-normal tracking-[-0.04em] wrap-break-word text-white md:text-[2.5rem]/[1.125] lg:text-5xl/[1.125] xl:text-[3.5rem]/[1.125]">
              Hackathon quick start checklist
            </h1>
            <p className="text-grey-90 mt-4 text-lg/snug tracking-[-0.04em] text-pretty md:text-xl/snug">
              Work through these steps to get set up and start building.
            </p>
          </T>

          <div className="mt-10 md:mt-14">
            <QuickStartChecklist />
          </div>
        </div>
      </section>

      <div className="border-grey-20 mx-auto mt-24 max-w-432 border-x bg-black md:mt-36 lg:mt-44 xl:mt-60">
        <CTA className="pt-0 pb-16 lg:pb-22" theme="outline" />
        <Footer className="border-t border-white/10 bg-black lg:px-8" />
      </div>
    </main>
  );
}
