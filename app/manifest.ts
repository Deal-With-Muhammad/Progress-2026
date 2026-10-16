import type { MetadataRoute } from "next";

import { siteCopy } from "@/config/site";

// The name carries the year, so regenerate it daily.
export const revalidate = 86400;

export default function manifest(): MetadataRoute.Manifest {
  const copy = siteCopy();

  return {
    name: `${copy.name}: Year Progress Bar`,
    short_name: copy.name,
    description: copy.description,
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    categories: ["utilities", "productivity"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48 32x32 16x16",
        type: "image/x-icon",
      },
    ],
  };
}
