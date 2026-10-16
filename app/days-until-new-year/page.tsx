import type { Metadata } from "next";

import YearProgress from "@/components/year-progress";
import YearFacts from "@/components/year-facts";
import { siteYear } from "@/config/site";
import { getNewYearContent } from "@/lib/year-content";
import { buildJsonLd, serializeJsonLd } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/page-meta";

// Live numbers in the browser; the answers below are rendered on the server
// and refreshed hourly, so the year rolls over on 1 January by itself.
export const revalidate = 3600;

const path = "/days-until-new-year";

const copy = (year: number) => ({
  title: `Days Until New Year ${year + 1}: Live Countdown to 1 January`,
  description: `How many days until New Year ${year + 1}? A live countdown of the days, hours, minutes and seconds to midnight on 1 January ${year + 1} in your time zone, or any city you pick. Free, no sign-up.`,
});

export function generateMetadata(): Metadata {
  const year = siteYear();

  return pageMetadata({ path, year, ...copy(year) });
}

export default function Page() {
  const content = getNewYearContent(new Date());
  const { year } = content;

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            buildJsonLd(year, {
              path,
              name: "New Year countdown",
              description: copy(year).description,
              featureList: [
                `Live countdown to midnight on 1 January ${year + 1}`,
                "Days, hours, minutes and seconds, updated every second",
                "Counts down in your own time zone, or any city you pick",
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
        variant="new-year"
      />
      <YearFacts content={content} path={path} />
    </>
  );
}
