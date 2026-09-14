require("tsx/cjs");

const { resolveSiteUrl } = require("./src/lib/site-url.ts");

const siteUrl = resolveSiteUrl(process.env);
const DEFAULT_LOCALE = require("./gt.config.json").defaultLocale;
const DEFAULT_LOCALE_PREFIX = new RegExp(`^/${DEFAULT_LOCALE}(?=/)`);

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  trailingSlash: false,
  exclude: ["/hackathon", "/hackathon/*", "/*/hackathon", "/*/hackathon/*"],
  // Pages are prerendered under `/[locale]`; the default locale is served at
  // the unprefixed URL (see src/proxy.ts), so drop its prefix from <loc>.
  transform: async (config, path) => ({
    loc:
      path === `/${DEFAULT_LOCALE}`
        ? "/"
        : path.replace(DEFAULT_LOCALE_PREFIX, ""),
    changefreq: config.changefreq,
    priority: config.priority,
    lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
  }),
};
