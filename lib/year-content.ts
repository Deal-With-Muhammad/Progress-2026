/**
 * Server-rendered answer content (summary, facts and FAQ) for search engines
 * and AI answer engines. Everything that depends on today's date is computed
 * at render time in UTC and labelled with that date.
 */
import { siteConfig } from "@/config/site";
import {
  DAY_MS,
  getYearStats,
  isoWeeksInYear,
  nextLeapYear,
  type YearStats,
} from "@/lib/year";

export interface Faq {
  question: string;
  /** Plain-text answer, used both on the page and in the FAQPage JSON-LD. */
  answer: string;
  /** Optional link rendered on the page over the matching text in `answer`. */
  link?: { text: string; href: string };
}

export interface YearContent {
  stats: YearStats;
  /** ISO date (YYYY-MM-DD) the content was computed for, in UTC. */
  asOfIso: string;
  /** Human date, e.g. "14 October 2026". */
  asOfLabel: string;
  summary: string;
  facts: { label: string; value: string }[];
  faqs: Faq[];
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const weekdayFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  timeZone: "UTC",
});
const numberFormat = new Intl.NumberFormat("en-US");

const formatDate = (ms: number) => dateFormat.format(new Date(ms));
const weekday = (ms: number) => weekdayFormat.format(new Date(ms));

/** One decimal place, rounded down so it never claims 100% before the year ends. */
export const formatPercent = (percentage: number) =>
  `${(Math.floor(percentage * 10) / 10).toFixed(1)}%`;

const plural = (n: number, word: string) =>
  `${numberFormat.format(n)} ${word}${n === 1 ? "" : "s"}`;

function weeksAndDays(days: number) {
  const weeks = Math.floor(days / 7);
  const rest = days % 7;

  if (weeks === 0) return plural(rest, "day");
  if (rest === 0) return plural(weeks, "week");

  return `${plural(weeks, "week")} and ${plural(rest, "day")}`;
}

export function getYearContent(
  now: Date = new Date(),
  year: number = siteConfig.year,
): YearContent {
  const stats = getYearStats(now, year, "UTC");
  const { status, daysInYear, daysElapsed, daysRemaining, dayOfYear } = stats;

  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const yearStart = Date.UTC(year, 0, 1);
  const nextYearStart = Date.UTC(year + 1, 0, 1);
  const lastDay = nextYearStart - DAY_MS;
  const daysUntilStart = Math.round((yearStart - today) / DAY_MS);
  const daysUntilNextYear = Math.round((nextYearStart - today) / DAY_MS);
  const nextYear = year + 1;

  const asOfIso = new Date(today).toISOString().slice(0, 10);
  const asOfLabel = formatDate(today);
  const asOf = `As of ${asOfLabel} (UTC)`;
  const percent =
    status === "in-progress" ? `about ${formatPercent(stats.percentage)}` : "";

  let summary: string;
  let howMuch: string;
  let daysLeft: string;
  let untilNext: string;

  if (status === "upcoming") {
    summary = `${asOf}, ${year} hasn't started yet. It begins on ${weekday(yearStart)}, 1 January ${year}, in ${plural(daysUntilStart, "day")}.`;
    howMuch = `None yet. ${asOf}, ${year} hasn't started: it begins on ${weekday(yearStart)}, 1 January ${year}.`;
    daysLeft = `All ${daysInYear} of them. ${asOf}, ${year} hasn't started yet; it begins in ${plural(daysUntilStart, "day")}.`;
    untilNext = `${asOf}, there are ${plural(daysUntilNextYear, "day")} until 1 January ${nextYear}.`;
  } else if (status === "complete") {
    summary = `${year} is over: it ended at midnight on ${formatDate(lastDay)}, so 100% of the year has passed (as of ${asOfLabel}, UTC).`;
    howMuch = `All of it. ${year} ended at midnight on ${formatDate(lastDay)}, so 100% of the year has passed.`;
    daysLeft = `None. ${year} ended on ${formatDate(lastDay)}.`;
    untilNext = `${nextYear} has already begun: it started on ${weekday(nextYearStart)}, 1 January ${nextYear}.`;
  } else {
    summary = `${asOf}, ${percent} of ${year} has passed. Today is day ${dayOfYear} of ${daysInYear}: ${plural(daysElapsed, "full day")} ${daysElapsed === 1 ? "is" : "are"} done and ${plural(daysRemaining, "day")} ${daysRemaining === 1 ? "is" : "are"} left, counting today.`;
    howMuch = `${asOf}, ${percent} of ${year} has passed. Today is day ${dayOfYear} of ${daysInYear}. The live counter at the top of this page shows the exact figure for your own time zone, updated every second.`;
    daysLeft =
      daysRemaining === 1
        ? `${asOf}, today is the last day of ${year}: only 1 day is left.`
        : `${asOf}, ${plural(daysRemaining, "day")} are left in ${year}, counting today, or ${numberFormat.format(daysRemaining - 1)} after today. That is ${weeksAndDays(daysRemaining)}.`;
    untilNext = `${asOf}, there ${daysUntilNextYear === 1 ? "is" : "are"} ${plural(daysUntilNextYear, "day")} until 1 January ${nextYear}, which falls on a ${weekday(nextYearStart)}.`;
  }

  const isoWeeks = isoWeeksInYear(year);
  const isoReason =
    isoWeeks === 53
      ? new Date(yearStart).getUTCDay() === 4
        ? ` because it starts on a Thursday`
        : ` because it is a leap year that starts on a Wednesday`
      : "";

  const faqs: Faq[] = [
    { question: `How much of ${year} has passed?`, answer: howMuch },
    { question: `How many days are left in ${year}?`, answer: daysLeft },
    { question: `How many days until ${nextYear}?`, answer: untilNext },
    {
      question: "How is the percentage calculated?",
      answer: `${siteConfig.name} takes the current date and time in your time zone, measures how long it has been since midnight on 1 January ${year}, and divides that by the length of the year: ${daysInYear} days (${numberFormat.format(daysInYear * 86400)} seconds) for ${year}${stats.isLeapYear ? "" : ", or 366 days in a leap year"}. Your time zone is detected automatically and can be changed with the Location button, so people in different time zones can see slightly different numbers at the same moment.`,
    },
    {
      question: `Is ${year} a leap year?`,
      answer: stats.isLeapYear
        ? `Yes. ${year} is a leap year with 366 days, so February ${year} has 29 days. The next leap year after it is ${nextLeapYear(year)}.`
        : `No. ${year} is a common year with 365 days, so February ${year} has 28 days. The next leap year is ${nextLeapYear(year)}.`,
    },
    {
      question: `How many weeks are in ${year}?`,
      answer: `${year} has ${daysInYear} days, which is ${weeksAndDays(daysInYear)}. In the ISO 8601 week-numbering system used by many calendars, ${year} has ${isoWeeks} weeks${isoReason}.`,
    },
    {
      question: "Can I see the progress of another year or several years?",
      answer: `Yes. Pick any year from 1900 to 2100, or a range such as ${year}–${year + 4} or 2010–${year + 1}, with the quick buttons or the From and To menus. A range that hasn't started yet shows 0% and how many days until it begins, a finished one shows 100%, and the link in your address bar opens the same range for anyone you share it with.`,
    },
    {
      question: `Who made ${siteConfig.name}?`,
      answer: `${siteConfig.name} was designed and built by ${siteConfig.author.name}, a web and mobile app developer based in ${siteConfig.author.city}, ${siteConfig.author.country}. See more of his work at dealwithmuhammad.com.`,
      link: { text: "dealwithmuhammad.com", href: siteConfig.author.url },
    },
  ];

  const facts = [
    {
      label: "Year complete",
      value:
        status === "in-progress"
          ? formatPercent(stats.percentage)
          : status === "complete"
            ? "100%"
            : "0%",
    },
    {
      label: "Day of the year",
      value: status === "in-progress" ? `${dayOfYear} of ${daysInYear}` : "–",
    },
    {
      label: `Days until ${nextYear}`,
      value: numberFormat.format(Math.max(0, daysUntilNextYear)),
    },
    { label: "Leap year", value: stats.isLeapYear ? "Yes" : "No" },
  ];

  return { stats, asOfIso, asOfLabel, summary, facts, faqs };
}
