import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

// Regenerated hourly, like the home page whose facts change every day.
export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${siteConfig.url}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
