import { useGT } from "gt-next";

import {
  getHackathonBannerConfig,
  type HackathonBannerEnv,
} from "@/lib/hackathon-banner-server";

export function HackathonBanner() {
  const gt = useGT();
  const banner = getHackathonBannerConfig(process.env as HackathonBannerEnv, {
    defaultLeadText: gt("Databricks Developer Hackathon is live."),
    linkText: gt("See resources"),
  });

  if (!banner) {
    return null;
  }

  return (
    <div
      aria-label={gt("Hackathon announcement")}
      className="devhub-hackathon-banner"
      data-banner-id={banner.id}
      style={{
        backgroundColor: banner.backgroundColor,
        color: banner.textColor,
      }}
    >
      <div dangerouslySetInnerHTML={{ __html: banner.content }} />
    </div>
  );
}
