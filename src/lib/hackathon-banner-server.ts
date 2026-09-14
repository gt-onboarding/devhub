/**
 * Server-side resolution of the site-wide hackathon banner.
 *
 * The banner is purely env-driven (strict string matching, like the `showDrafts`
 * flag — no implicit dev/CI handling and no date windows):
 *
 *   - `HACKATHON_BANNER_ENABLED="true"` → banner on. Any other value (including
 *     unset) → off.
 *   - `HACKATHON_EVENT_SLUG` → which event the banner points at. The link
 *     targets `/hackathon/<slug>`; with no slug it falls back to `/hackathon`,
 *     which itself redirects to the active event.
 *   - `HACKATHON_BANNER_TEXT` → optional override of the lead-in copy. The "See
 *     resources" link is always appended so a misconfigured override can never
 *     strand visitors on a banner with no way in.
 *
 * The resolver is a pure function so it can be unit-tested with synthetic envs.
 * The config builder is the thin imperative shell consumed by
 * the app environment at build time.
 */

export type HackathonBannerEnv = {
  HACKATHON_BANNER_ENABLED?: string;
  HACKATHON_BANNER_TEXT?: string;
  HACKATHON_EVENT_SLUG?: string;
};

type HackathonBannerConfig = {
  id: string;
  content: string;
  backgroundColor: string;
  textColor: string;
  isCloseable: boolean;
};

export function resolveHackathonBannerActive(env: HackathonBannerEnv): boolean {
  return env.HACKATHON_BANNER_ENABLED === "true";
}

type HackathonBannerCopy = {
  defaultLeadText: string;
  linkText: string;
};

// English fallbacks; the banner component passes locale-aware copy instead.
const DEFAULT_BANNER_COPY: HackathonBannerCopy = {
  defaultLeadText: "Databricks Developer Hackathon is live.",
  linkText: "See resources",
};

function bannerLinkHtml(slug: string, linkText: string): string {
  const target = slug ? `/hackathon/${slug}` : "/hackathon";
  return `<a href="${target}"><span class="banner-link-text">${linkText}</span></a>`;
}

export function getHackathonBannerConfig(
  env: HackathonBannerEnv = process.env as HackathonBannerEnv,
  copy: HackathonBannerCopy = DEFAULT_BANNER_COPY,
): HackathonBannerConfig | undefined {
  if (!resolveHackathonBannerActive(env)) return undefined;
  const slug = (env.HACKATHON_EVENT_SLUG ?? "").trim();
  const leadText = (env.HACKATHON_BANNER_TEXT ?? copy.defaultLeadText).trim();
  return {
    // Non-dismissible by design: the banner is the only on-site entry point to
    // the event during its window, so we don't want visitors to close it and
    // lose the way in. `id` is namespaced per event so any future re-enabling
    // of dismissals resets cleanly between events.
    id: `hackathon-${slug || "event"}`,
    // HACKATHON_BANNER_TEXT overrides only the lead-in copy; the "See
    // resources" link is always appended so visitors can never end up on a
    // banner with no way to reach the event.
    content: `<span class="banner-lead-text">${leadText}</span>${bannerLinkHtml(slug, copy.linkText)}`,
    backgroundColor: "#FF5F46",
    textColor: "#040406",
    isCloseable: false,
  };
}
