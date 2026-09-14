import type { ReactNode } from "react";
import { T, useGT } from "gt-next";

import { getDocsSearchItems } from "@/lib/docs-content";
import { HackathonBanner } from "@/components/hackathon/hackathon-banner";
import { Header } from "@/components/header/header";
import { SiteBanner } from "@/components/site-banner/site-banner";

export default function WebsiteLayout({ children }: { children: ReactNode }) {
  const gt = useGT();
  const searchItems = getDocsSearchItems();

  return (
    <>
      <div aria-label={gt("Skip to main content")} role="region">
        <a className="skip-to-content" href="#devhub-main-content">
          <T>Skip to main content</T>
        </a>
      </div>
      <SiteBanner />
      <HackathonBanner />
      <Header searchItems={searchItems} />
      <div id="devhub-main-content" tabIndex={-1}>
        {children}
      </div>
    </>
  );
}
