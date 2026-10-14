import type { Metadata } from "next";

import YearProgress from "@/components/year-progress";
import YearFacts from "@/components/year-facts";
import { getYearContent } from "@/lib/year-content";
import { buildJsonLd, serializeJsonLd } from "@/lib/structured-data";

// The live counter runs in the browser; the facts and FAQ below it are
// rendered on the server and refreshed hourly so crawlers see real numbers.
export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  const content = getYearContent(new Date());

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildJsonLd(content.faqs)),
        }}
        type="application/ld+json"
      />
      <YearProgress />
      <YearFacts content={content} />
    </>
  );
}
