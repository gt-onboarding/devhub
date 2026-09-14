import type { Metadata } from "next";
import { getDefaultLocale, getLocales } from "gt-next";

import { resolveSiteUrl } from "@/lib/site-url";

const DEFAULT_SOCIAL_IMAGE = "/img/databricks-social-card.jpg";
const SITE_NAME = "Databricks Developer";

type OpenGraphKind = "article" | "website";

type MetadataOptions = {
  description: string;
  imagePath?: string;
  /** Current request locale. Non-default locales prefix canonical/OG URLs with `/{locale}`. */
  locale?: string;
  markdownPath?: string;
  noIndex?: boolean;
  pathname: string;
  rssPath?: string;
  title: string;
  titleMode?: "absolute" | "template";
  type?: OpenGraphKind;
};

export function absoluteSiteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const siteUrl = resolveSiteUrl();
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${siteUrl}${path === "/" ? "" : path}`;
}

/** Matches the proxy's `prefixDefaultLocale: false` routing: only non-default locales get a URL prefix. */
function localizedPathname(
  pathname: string,
  locale: string,
  defaultLocale: string,
): string {
  if (locale === defaultLocale) {
    return pathname;
  }
  return `/${locale}${pathname === "/" ? "" : pathname}`;
}

function buildLanguageAlternates(
  pathname: string,
  defaultLocale: string,
): Record<string, string> {
  const otherLocales = getLocales().filter(
    (locale) => locale !== defaultLocale,
  );
  return {
    [defaultLocale]: absoluteSiteUrl(pathname),
    ...Object.fromEntries(
      otherLocales.map((locale) => [
        locale,
        absoluteSiteUrl(localizedPathname(pathname, locale, defaultLocale)),
      ]),
    ),
    "x-default": absoluteSiteUrl(pathname),
  };
}

export function getMetadata({
  description,
  imagePath = DEFAULT_SOCIAL_IMAGE,
  locale = "en",
  markdownPath,
  noIndex = false,
  pathname,
  rssPath,
  title,
  titleMode = "template",
  type = "website",
}: MetadataOptions): Metadata {
  const defaultLocale = getDefaultLocale();
  const canonicalUrl = absoluteSiteUrl(
    localizedPathname(pathname, locale, defaultLocale),
  );
  const imageUrl = absoluteSiteUrl(imagePath);

  // Next's title `template` only applies to the document <title>, not to
  // openGraph/twitter titles. Mirror it here so social cards match the page
  // title (e.g. "Start here | Databricks Developer").
  const socialTitle =
    titleMode === "absolute" ? title : `${title} | ${SITE_NAME}`;
  const alternateTypes: NonNullable<Metadata["alternates"]>["types"] = {};

  if (markdownPath) {
    alternateTypes["text/markdown"] = markdownPath;
  }
  if (rssPath) {
    alternateTypes["application/rss+xml"] = rssPath;
  }

  const openGraph =
    type === "article"
      ? {
          title: socialTitle,
          description,
          siteName: SITE_NAME,
          type: "article" as const,
          url: canonicalUrl,
          images: [imageUrl],
        }
      : {
          title: socialTitle,
          description,
          siteName: SITE_NAME,
          type: "website" as const,
          url: canonicalUrl,
          images: [imageUrl],
        };

  return {
    title: titleMode === "absolute" ? { absolute: title } : title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: buildLanguageAlternates(pathname, defaultLocale),
      types:
        Object.keys(alternateTypes).length > 0 ? alternateTypes : undefined,
    },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? {
          follow: false,
          index: false,
        }
      : undefined,
  };
}
