import type { MetadataRoute } from "next";

const SITE_URL = "https://dawndevs.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // The site is a single-route "book" — the four spreads live on one page, so
  // there is one canonical URL to expose to crawlers.
  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
