import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { T } from "gt-next";
import { getGT, getLocale } from "gt-next/server";

import { getMetadata } from "@/lib/get-metadata";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";

export async function generateMetadata(): Promise<Metadata> {
  const gt = await getGT();
  return getMetadata({
    title: gt("Hackathon"),
    description: gt("Databricks developer hackathons."),
    noIndex: true,
    locale: await getLocale(),
    pathname: "/hackathon",
  });
}

/**
 * `/hackathon` redirects to the active event named by the `HACKATHON_EVENT_SLUG`
 * env var. Each event lives at `/hackathon/<slug>`. When no slug is configured,
 * a minimal, non-indexed placeholder is shown instead of redirecting nowhere.
 */
export default function HackathonPage(): ReactNode {
  const slug = (process.env.HACKATHON_EVENT_SLUG ?? "").trim();

  if (slug) {
    redirect(`/hackathon/${slug}`);
  }

  return (
    <main className="bg-black text-white">
      <section className="mx-auto flex min-h-[60vh] w-full max-w-400 flex-col items-center justify-center gap-8 px-5 py-24 text-center md:px-8 md:py-32">
        <T>
          <div className="flex flex-col items-center gap-5">
            <h1 className="font-sans text-3xl/[1.125] font-normal tracking-normal text-balance text-white md:text-5xl/[1.125] md:whitespace-nowrap">
              No active hackathon right now
            </h1>
            <p className="text-grey-80 max-w-md text-base leading-tight tracking-normal md:text-lg">
              There isn&rsquo;t a hackathon running at the moment. In the
              meantime, explore templates to jumpstart your next Databricks app.
            </p>
          </div>
        </T>
        <Button
          asChild
          variant="orange"
          size="xl"
          className="font-mono text-base leading-none font-medium tracking-tight text-black uppercase shadow-none"
        >
          <Link href="/templates" className="no-underline hover:no-underline">
            <T>Browse templates</T>
          </Link>
        </Button>
      </section>
      <Footer className="mx-auto max-w-432 border-t border-white/10 lg:px-8" />
    </main>
  );
}
