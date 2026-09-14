import { spawnSync } from "node:child_process";

/**
 * Build-time translation step (runs after sync-appkit-docs.mjs in `prebuild`).
 *
 * `gt translate` extracts UI strings and translates the docs listed in
 * gt.config.json, including the AppKit docs that were just synced from the
 * upstream repo and therefore have no committed translations. Unchanged
 * content is served from the General Translation cache, so repeat builds
 * only download.
 *
 * It only runs on Vercel (or with GT_TRANSLATE_ON_BUILD=true) so local builds
 * and the pre-commit hook never call the API; run `pnpm translate` by hand
 * instead. Without credentials it skips, and the site falls back to English.
 */
const shouldTranslate =
  process.env.VERCEL === "1" || process.env.GT_TRANSLATE_ON_BUILD === "true";

if (!shouldTranslate) {
  console.log(
    "Skipping build-time translation (not on Vercel; set GT_TRANSLATE_ON_BUILD=true to force).",
  );
  process.exit(0);
}

if (!process.env.GT_API_KEY || !process.env.GT_PROJECT_ID) {
  console.warn(
    "GT_API_KEY / GT_PROJECT_ID are not set; skipping build-time translation. Untranslated pages fall back to English.",
  );
  process.exit(0);
}

const result = spawnSync("pnpm", ["exec", "gt", "translate"], {
  stdio: "inherit",
});

if (result.status !== 0) {
  console.error(
    `gt translate exited with status ${result.status ?? "unknown"}`,
  );
  process.exit(result.status ?? 1);
}
