import { locale } from "next/root-params";

/**
 * gt-next request locale resolver. Reading the `[locale]` root segment (set by
 * the proxy rewrite) instead of headers/cookies keeps pages statically
 * prerenderable. Picked up by `getLocalePath` in next.config.mjs.
 */
export default async function getLocale(): Promise<string> {
  return await locale();
}
