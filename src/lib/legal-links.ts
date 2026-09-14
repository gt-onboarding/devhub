import { msg } from "gt-next";

/** Legal links rendered in the site footer. */
export type LegalLink = {
  label: string;
  href: string;
};

export const LEGAL_LINKS: LegalLink[] = [
  {
    label: msg("Privacy Notice"),
    href: "https://www.databricks.com/legal/privacynotice",
  },
  {
    label: msg("Terms of Use"),
    href: "https://www.databricks.com/legal/terms-of-use",
  },
  {
    label: msg("Modern Slavery Statement"),
    href: "https://www.databricks.com/legal/modern-slavery-policy-statement",
  },
  {
    label: msg("California Privacy"),
    href: "https://www.databricks.com/legal/supplemental-privacy-notice-california-residents",
  },
];

/** Current year as a string so ICU does not apply number formatting (e.g. "2,026"). */
export const COPYRIGHT_YEAR = String(new Date().getFullYear());

/** Resolve with `m(COPYRIGHT_LINE, { year: COPYRIGHT_YEAR })`. */
export const COPYRIGHT_LINE = msg(
  "© Databricks {year}. All rights reserved. Apache, Apache Spark, Spark and the Spark logo are trademarks of the Apache Software Foundation.",
);
