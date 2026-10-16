import { ogAlt, renderOgImage } from "@/lib/og-image";

export const alt = ogAlt("How many days until New Year");
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// Shows today's numbers, so refresh it hourly.
export const revalidate = 3600;

export default function TwitterImage() {
  return renderOgImage("new-year");
}
