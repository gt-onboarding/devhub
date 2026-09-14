/**
 * gt-next region resolver. The default reads a cookie, which forces every
 * route dynamic; DevHub does not use regional formatting, so disable it.
 */
export default async function getRegion(): Promise<undefined> {
  return undefined;
}
