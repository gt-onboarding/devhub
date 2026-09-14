import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { T } from "gt-next";
import { getGT } from "gt-next/server";

import { getDocsSearchItems } from "@/lib/docs-content";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";
import { Header } from "@/components/header/header";
import CTA from "@/components/home/cta";

export async function generateMetadata(): Promise<Metadata> {
  const gt = await getGT();
  return {
    title: gt("Page Not Found"),
  };
}

export default function WebsiteNotFound(): ReactNode {
  const searchItems = getDocsSearchItems();
  return (
    <>
      <Header searchItems={searchItems} />
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-black text-white xl:min-h-[calc(100vh-4rem)]">
        <main className="flex grow">
          <section className="not-found flex grow items-center justify-center px-5 py-20 md:px-8">
            <div className="flex max-w-md flex-col items-center justify-center md:max-w-lg">
              <T>
                <h1 className="text-foreground text-8xl leading-none font-semibold tracking-tighter md:text-9xl md:leading-none">
                  <span className="sr-only">Error</span>404
                  <span className="sr-only">: Page Not Found</span>
                </h1>
                <p className="text-foreground mt-2.5 text-center text-base leading-normal tracking-tight md:text-lg md:leading-normal">
                  We know this isn&apos;t where you intended to land, but we
                  hope you have some fun while you&apos;re here.
                </p>
              </T>
              <Button
                className="mt-6 h-10 rounded-none bg-white px-7 font-mono text-base leading-none font-medium tracking-tight text-black uppercase shadow-none hover:bg-white/90 lg:h-11 xl:mt-8"
                asChild
              >
                <Link className="no-underline hover:no-underline" href="/">
                  <T>Go to homepage</T>
                </Link>
              </Button>
            </div>
          </section>
        </main>
        <div className="border-grey-20 mx-auto mt-18 w-full max-w-432 border-x bg-black md:mt-26">
          <CTA className="pt-0 pb-16 lg:pb-22" theme="outline" />
          <Footer className="border-t border-white/10 bg-black lg:px-8" />
        </div>
      </div>
    </>
  );
}
