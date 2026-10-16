import type { Metadata } from "next";

import YearProgress from "@/components/year-progress";
import YearFacts from "@/components/year-facts";
import { siteYear } from "@/config/site";
import { getWeekContent } from "@/lib/year-content";
import { buildJsonLd, serializeJsonLd } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/page-meta";

// Live numbers in the browser; the answers below are rendered on the server
// and refreshed hourly, so the year rolls over on 1 January by itself.
export const revalidate = 3600;

const path = "/what-week-is-it";

const copy = (year: number) => ({
  title: `What Week Is It? Today’s Week Number (${year})`,
  description: `What week number is it today? See the current ISO 8601 week number live in your time zone, the US-style week number, and every week of ${year} with its dates. Free, no sign-up.`,
});

export function generateMetadata(): Metadata {
  const year = siteYear();

  return pageMetadata({ path, year, ...copy(year) });
}

export default function Page() {
  const content = getWeekContent(new Date());
  const { year } = content;

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            buildJsonLd(year, {
              path,
              name: "What week is it?",
              description: copy(year).description,
              featureList: [
                "Live ISO 8601 week number in your own time zone",
                "US-style (Sunday start) week number alongside",
                "Monday to Sunday dates of the current week",
                `Table of every ISO week of ${year}`,
              ],
              faqs: content.faqs,
            }),
          ),
        }}
        type="application/ld+json"
      />
      <YearProgress
        heading={content.heading}
        initialYear={year}
        intro={content.intro}
        variant="week"
      />
      <YearFacts content={content} path={path} />
    </>
  );
}
