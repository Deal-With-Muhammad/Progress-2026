import type { Metadata } from "next";

import YearProgress from "@/components/year-progress";
import YearFacts from "@/components/year-facts";
import { siteCopy, siteYear } from "@/config/site";
import { getYearContent } from "@/lib/year-content";
import { buildJsonLd, serializeJsonLd } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/page-meta";

// The live counter runs in the browser; the intro, facts and FAQ are rendered
// on the server and refreshed hourly, so crawlers see real numbers and the
// year (in the title, H1 and copy) rolls over on 1 January by itself.
export const revalidate = 3600;

export function generateMetadata(): Metadata {
  const year = siteYear();
  const copy = siteCopy(year);

  return pageMetadata({
    path: "/",
    title: copy.title,
    description: copy.description,
    year,
  });
}

export default function Home() {
  const content = getYearContent(new Date());
  const { year } = content;
  const copy = siteCopy(year);

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            buildJsonLd(year, {
              path: "/",
              name: copy.name,
              description: `A free year progress bar that shows live what percent of ${year} has passed in your own time zone, updated every second, with the day of the year, ISO week number and the days left until ${year + 1}.`,
              featureList: [
                `Live percentage of ${year} completed, updated every second`,
                "Automatic time zone detection, or pick any city or time zone",
                "Day of the year, ISO week number, days elapsed and days remaining",
                "Any year or range of years from 1900 to 2100, with shareable links",
                "Light and dark themes",
              ],
              faqs: content.faqs,
            }),
          ),
        }}
        type="application/ld+json"
      />
      <YearProgress initialYear={year} intro={content.intro} />
      <YearFacts content={content} path="/" />
    </>
  );
}
