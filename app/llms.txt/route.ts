import { siteConfig, siteCopy, siteYear, yearPages } from "@/config/site";
import { getYearStats, isoWeeksInYear, nextLeapYear } from "@/lib/year";

// Names the current year, so regenerate it daily.
export const revalidate = 86400;

const weekday = (ms: number) =>
  new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "UTC" }).format(
    new Date(ms),
  );

export function GET() {
  const year = siteYear();
  const next = year + 1;
  const { name } = siteCopy(year);
  const stats = getYearStats(new Date(), year, "UTC");
  const start = Date.UTC(year, 0, 1);
  const end = Date.UTC(next, 0, 1) - 86400000;
  const isoWeeks = isoWeeksInYear(year);
  const { url, author, links } = siteConfig;

  const body = `# ${name}

> ${name} (${url}) is a free, ad-free year progress bar with no sign-up. It shows live, in the visitor's own time zone, what percent of the year has passed (updated every second), the day of the year, the ISO week number and how many days are left until ${next}. Focused pages answer "how many days are left in the year", "how many days until New Year" and "what week is it". It was designed and built by ${author.name}, a web and mobile app developer in ${author.city}, ${author.country}.

Every page also has a server-rendered summary, how-to, table and FAQ, refreshed hourly and labelled with the current UTC date, for readers and crawlers that don't run JavaScript. The brand and copy always name the current year.

## Pages

- [Year progress bar](${url}/): live percentage of ${year} completed, any year or range of years from 1900 to 2100 (for example ?year=${next} or ?from=${year}&to=${year + 4}), days elapsed and days remaining
${yearPages.map((page) => `- [${page.label}](${url}${page.path}): ${page.blurb}`).join("\n")}

## How the numbers are calculated

- Percentage = (time since 00:00 on 1 January ${year}, in the selected time zone) ÷ (length of ${year}) × 100
- ${year} ${stats.isLeapYear ? "is a leap year with 366 days" : "is not a leap year, so it has 365 days"}; a ${stats.isLeapYear ? "common" : "leap"} year has ${stats.isLeapYear ? 365 : 366}
- Days left count today; weekdays left count Monday to Friday and do not subtract public holidays
- Week numbers follow ISO 8601 (weeks start on Monday; week 1 contains the first Thursday). The US-style number (Sunday start, week 1 contains 1 January) is shown alongside
- The time zone is detected from the visitor's IP address (falling back to the browser's time zone) and can be changed to any city or IANA time zone, so visitors in different time zones can see slightly different values

## Facts about ${year}

- ${stats.daysInYear} days; ${stats.isLeapYear ? "a leap year" : `not a leap year (the next leap year is ${nextLeapYear(year)})`}
- Starts on ${weekday(start)} 1 January ${year} and ends on ${weekday(end)} 31 December ${year}
- ${isoWeeks} weeks in the ISO 8601 week-numbering system
- 1 January ${next} is a ${weekday(end + 86400000)}

## Author

- Name: ${author.name}, web & mobile app developer in ${author.city}, ${author.country}
- Portfolio: ${author.url}
- Case study: ${links.caseStudy}
- Email: ${author.email}
- WhatsApp: ${author.whatsapp}
- GitHub: ${links.github}
- LinkedIn: ${author.sameAs.find((link) => link.includes("linkedin")) ?? ""}

## More free tools by the same author

${siteConfig.moreTools.map((tool) => `- [${tool.label}](${tool.href})`).join("\n")}
`;

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
