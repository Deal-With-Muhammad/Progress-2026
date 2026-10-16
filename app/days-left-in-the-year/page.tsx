import type { Metadata } from "next";

import YearProgress from "@/components/year-progress";
import YearFacts from "@/components/year-facts";
import { siteYear } from "@/config/site";
import { getDaysLeftContent } from "@/lib/year-content";
import { buildJsonLd, serializeJsonLd } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/page-meta";

// Live numbers in the browser; the answers below are rendered on the server
// and refreshed hourly, so the year rolls over on 1 January by itself.
export const revalidate = 3600;

const path = "/days-left-in-the-year";

const copy = (year: number) => ({
  title: `Days Left in ${year}: How Many Days Are Left in the Year?`,
  description: `How many days are left in ${year}? A live count of the days, weeks, weekdays and hours left in the year in your time zone, with a month-by-month table. Free, no sign-up.`,
});

export function generateMetadata(): Metadata {
  const year = siteYear();

  return pageMetadata({ path, year, ...copy(year) });
}

export default function Page() {
  const content = getDaysLeftContent(new Date());
  const { year } = content;

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            buildJsonLd(year, {
              path,
              name: "Days left in the year",
              description: copy(year).description,
              featureList: [
                `Live count of the days left in ${year}, counting today`,
                "Weeks, weekdays (Monday to Friday) and hours left",
                "Measured in your own time zone, or any city you pick",
                "Month-by-month table of the days left",
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
        variant="days-left"
      />
      <YearFacts content={content} path={path} />
    </>
  );
}
