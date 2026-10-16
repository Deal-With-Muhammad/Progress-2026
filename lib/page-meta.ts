import type { Metadata } from "next";

import { siteCopy } from "@/config/site";

/** Title, description, canonical and social cards for one page. */
export function pageMetadata({
  path,
  title,
  description,
  year,
}: {
  path: string;
  title: string;
  description: string;
  year: number;
}): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      siteName: siteCopy(year).name,
      title,
      description,
      locale: "en_US",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
