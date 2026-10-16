import type { MetadataRoute } from "next";

import { CONTENT_UPDATED, siteConfig, yearPages } from "@/config/site";

/** When each page's content last changed (bump it when you edit a page). */
const lastModified: Record<string, string> = {
  "/": CONTENT_UPDATED,
  "/days-left-in-the-year": "2026-10-16",
  "/days-until-new-year": "2026-10-16",
  "/what-week-is-it": "2026-10-16",
};

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", ...yearPages.map((page) => page.path)].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: lastModified[path] ?? CONTENT_UPDATED,
    changeFrequency: "daily",
    priority: path === "/" ? 1 : 0.8,
  }));
}
