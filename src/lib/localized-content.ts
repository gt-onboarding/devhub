import { existsSync } from "fs";
import { join } from "path";

import gtConfig from "../../gt.config.json";

/**
 * `gt translate` writes translated markdown to `src/content/<locale>/<same
 * relative path under src/content/>` (see the `transform` rule in
 * gt.config.json). Pages render the translation when it exists and fall back
 * to the English source otherwise.
 */
export function hasTranslatedContent(
  relativePath: string,
  locale: string,
): boolean {
  if (locale === gtConfig.defaultLocale) {
    return false;
  }

  return existsSync(
    join(process.cwd(), "src", "content", locale, relativePath),
  );
}

/** Absolute path to the translated file when present, else the English one. */
export function resolveLocalizedContentPath(
  relativePath: string,
  locale: string,
): string {
  return hasTranslatedContent(relativePath, locale)
    ? join(process.cwd(), "src", "content", locale, relativePath)
    : join(process.cwd(), "src", "content", relativePath);
}
