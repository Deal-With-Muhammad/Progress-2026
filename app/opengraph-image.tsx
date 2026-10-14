import { ogAlt, renderOgImage } from "@/lib/og-image";

export const alt = ogAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// Shows the live percentage, so refresh it hourly.
export const revalidate = 3600;

export default function OpengraphImage() {
  return renderOgImage();
}
