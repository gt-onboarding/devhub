import type { ReactNode } from "react";
import { T } from "gt-next";

import { BackLink } from "@/components/ui/back-link";
import { BrandStrip } from "@/components/ui/brand-strip";
import Footer from "@/components/footer";
import CTA from "@/components/home/cta";

export function HackathonSupportIntro({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}): ReactNode {
  return (
    <>
      <BackLink href="/hackathon" className="tracking-tight">
        <T>Back to the hackathon</T>
      </BackLink>

      <h1 className="mt-6 text-[2rem]/[1.125] font-normal tracking-[-0.04em] wrap-break-word text-white md:text-[2.5rem]/[1.125] lg:text-5xl/[1.125] xl:text-[3.5rem]/[1.125]">
        {title}
      </h1>
      <p className="text-grey-90 mt-4 text-base leading-snug tracking-[-0.04em] text-pretty md:text-lg">
        {children}
      </p>
    </>
  );
}

export function HackathonSupportFooter({
  children,
}: {
  children?: ReactNode;
}): ReactNode {
  return (
    <>
      <BrandStrip />

      <div className="bg-[#F9F7F4]">
        {children}
        <CTA className="border-grey-20 mx-auto mt-24 max-w-432 border pt-1.5 pb-16 md:mt-36 md:pb-22 lg:mt-46.5" />
        <Footer
          className="border-grey-20 mx-auto max-w-432 border-x border-b"
          variant="inline"
        />
      </div>
    </>
  );
}
