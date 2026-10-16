/**
 * Server-rendered answer content (intro, facts, steps, tables and FAQ) for
 * people, search engines and AI answer engines. Everything that depends on
 * today's date is computed at render time in UTC and labelled with that date;
 * the pages revalidate hourly, so the year rolls over on 1 January by itself.
 */
import { siteConfig, siteCopy, siteYear } from "@/config/site";
import {
  DAY_MS,
  getYearStats,
  isoWeekOf,
  isoWeeksInYear,
  isoWeeksOf,
  nextLeapYear,
  usWeekNumber,
  weekdaysBetween,
  type YearStats,
} from "@/lib/year";

export interface Faq {
  question: string;
  /** Plain-text answer, used both on the page and in the FAQPage JSON-LD. */
  answer: string;
  /** Optional link rendered on the page over the matching text in `answer`. */
  link?: { text: string; href: string };
}

export interface Fact {
  label: string;
  value: string;
}

export interface Step {
  title: string;
  text: string;
}

export interface Table {
  caption: string;
  columns: string[];
  rows: { cells: string[]; current?: boolean }[];
}

export interface PageContent {
  year: number;
  stats: YearStats;
  /** ISO date (YYYY-MM-DD) the content was computed for, in UTC. */
  asOfIso: string;
  /** Human date, e.g. "14 October 2026". */
  asOfLabel: string;
  /** The page's H1. */
  heading: string;
  /** One or two plain sentences that answer the page's question. */
  intro: string;
  summaryTitle: string;
  summary: string;
  facts: Fact[];
  stepsTitle: string;
  steps: Step[];
  table?: Table;
  faqs: Faq[];
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const shortDateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const weekdayFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  timeZone: "UTC",
});
const monthFormat = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  timeZone: "UTC",
});
const numberFormat = new Intl.NumberFormat("en-US");

const formatDate = (ms: number) => dateFormat.format(new Date(ms));
const shortDate = (ms: number) => shortDateFormat.format(new Date(ms));
const weekday = (ms: number) => weekdayFormat.format(new Date(ms));

/** One decimal place, rounded down so it never claims 100% before the year ends. */
export const formatPercent = (percentage: number) =>
  `${(Math.floor(percentage * 10) / 10).toFixed(1)}%`;

const plural = (n: number, word: string) =>
  `${numberFormat.format(n)} ${word}${n === 1 ? "" : "s"}`;

/** "are 77 days" / "is 1 day". */
const thereAre = (n: number, word: string) =>
  `${n === 1 ? "is" : "are"} ${plural(n, word)}`;

export function weeksAndDays(days: number) {
  const weeks = Math.floor(days / 7);
  const rest = days % 7;

  if (weeks === 0) return plural(rest, "day");
  if (rest === 0) return plural(weeks, "week");

  return `${plural(weeks, "week")} and ${plural(rest, "day")}`;
}

/** Shared date maths for every page, as of `now` in UTC. */
function basics(now: Date) {
  const year = siteYear(now);
  const stats = getYearStats(now, year, "UTC");
  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const nextYear = year + 1;
  const yearStart = Date.UTC(year, 0, 1);
  const nextYearStart = Date.UTC(nextYear, 0, 1);
  const asOfLabel = formatDate(today);

  return {
    year,
    nextYear,
    stats,
    today,
    yearStart,
    nextYearStart,
    week: isoWeekOf(today),
    /** Days until 1 January next year, counting today. */
    daysLeft: stats.daysRemaining,
    weekdaysLeft: weekdaysBetween(today, nextYearStart),
    asOfIso: new Date(today).toISOString().slice(0, 10),
    asOfLabel,
    asOf: `As of ${asOfLabel} (UTC)`,
    percent: formatPercent(stats.percentage),
    percentLeft: formatPercent(100 - stats.percentage),
  };
}

const authorFaq = (name: string): Faq => ({
  question: `Who made ${name}?`,
  answer: `${name} was designed and built by ${siteConfig.author.name}, a web and mobile app developer based in ${siteConfig.author.city}, ${siteConfig.author.country}. See more of his work at dealwithmuhammad.com.`,
  link: { text: "dealwithmuhammad.com", href: siteConfig.author.url },
});

const timeZoneNote =
  "Your time zone is detected automatically and can be changed with the Location button, so people in different time zones can see slightly different numbers at the same moment.";

/* ------------------------------------------------------------------------ */
/* Home: the year progress bar                                              */
/* ------------------------------------------------------------------------ */

export function getYearContent(now: Date = new Date()): PageContent {
  const b = basics(now);
  const { year, nextYear, stats } = b;
  const { daysInYear, daysElapsed, dayOfYear } = stats;
  const name = siteCopy(year).name;
  const isoWeeks = isoWeeksInYear(year);
  const isoReason =
    isoWeeks === 53
      ? new Date(b.yearStart).getUTCDay() === 4
        ? " because it starts on a Thursday"
        : " because it is a leap year that starts on a Wednesday"
      : "";

  const faqs: Faq[] = [
    {
      question: `What percent of ${year} has passed?`,
      answer: `${b.asOf}, about ${b.percent} of ${year} has passed. Today is day ${dayOfYear} of ${daysInYear}. The live year progress bar at the top of this page shows the exact figure for your own time zone, updated every second.`,
    },
    {
      question: "How much of the year is left?",
      answer: `${b.asOf}, about ${b.percentLeft} of ${year} is left: ${plural(b.daysLeft, "day")} counting today, which is ${weeksAndDays(b.daysLeft)}.`,
    },
    {
      question: `How many days are left in ${year}?`,
      answer:
        b.daysLeft === 1
          ? `${b.asOf}, today is the last day of ${year}: only 1 day is left.`
          : `${b.asOf}, there ${thereAre(b.daysLeft, "day")} left in ${year}, counting today, or ${numberFormat.format(b.daysLeft - 1)} after today. See the days left in the year page for weeks, weekdays and a month-by-month table.`,
      link: {
        text: "days left in the year",
        href: "/days-left-in-the-year",
      },
    },
    {
      question: "What day of the year is it today?",
      answer: `${b.asOf}, today is day ${dayOfYear} of ${daysInYear} in ${year}, in ISO week ${b.week.week}. ${plural(daysElapsed, "full day")} of the year ${daysElapsed === 1 ? "is" : "are"} done.`,
      link: { text: `ISO week ${b.week.week}`, href: "/what-week-is-it" },
    },
    {
      question: "How is the percentage calculated?",
      answer: `The year progress bar takes the current date and time in your time zone, measures how long it has been since midnight on 1 January ${year}, and divides that by the length of the year: ${daysInYear} days (${numberFormat.format(daysInYear * 86400)} seconds) for ${year}${stats.isLeapYear ? "" : ", or 366 days in a leap year"}. ${timeZoneNote}`,
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
      answer: `Yes. Pick any year from 1900 to 2100, or a range such as ${year}–${year + 4} or 2010–${nextYear}, with the quick buttons or the From and To menus. A range that hasn't started yet shows 0% and how many days until it begins, a finished one shows 100%, and the link in your address bar opens the same range for anyone you share it with.`,
    },
    authorFaq(name),
  ];

  return {
    year,
    stats,
    asOfIso: b.asOfIso,
    asOfLabel: b.asOfLabel,
    heading: `${year} Year Progress`,
    intro: `${year} is ${b.percent} complete: today is day ${dayOfYear} of ${daysInYear}, and ${plural(b.daysLeft, "day")} ${b.daysLeft === 1 ? "is" : "are"} left until ${nextYear}, counting today (as of ${b.asOfLabel}, UTC).`,
    summaryTitle: `${year} progress today`,
    summary: `${b.asOf}, about ${b.percent} of ${year} has passed and ${b.percentLeft} is left. Today is day ${dayOfYear} of ${daysInYear}: ${plural(daysElapsed, "full day")} ${daysElapsed === 1 ? "is" : "are"} done and ${plural(b.daysLeft, "day")} ${b.daysLeft === 1 ? "is" : "are"} left, counting today.`,
    facts: [
      { label: "Year complete", value: b.percent },
      { label: "Day of the year", value: `${dayOfYear} of ${daysInYear}` },
      { label: "ISO week", value: `${b.week.week} of ${isoWeeks}` },
      {
        label: `Days until ${nextYear}`,
        value: numberFormat.format(b.daysLeft),
      },
    ],
    stepsTitle: "How to use the year progress bar",
    steps: [
      {
        title: "Open the page",
        text: `The bar starts straight away for ${year}, in the time zone of where you are. There is nothing to install and no account to make.`,
      },
      {
        title: "Check the time zone",
        text: "Your city and local time are shown above the bar. Use the Location button to switch to any city or time zone, for example to see the year from a friend's side of the world.",
      },
      {
        title: "Pick other years if you like",
        text: "Use This year, Next year, Next 5 years, This decade or Last 10 years, or set your own From and To years between 1900 and 2100.",
      },
      {
        title: "Share it",
        text: "The Share button copies a link that opens the same year or range for anyone you send it to.",
      },
    ],
    faqs,
  };
}

/* ------------------------------------------------------------------------ */
/* Days left in the year                                                    */
/* ------------------------------------------------------------------------ */

export function getDaysLeftContent(now: Date = new Date()): PageContent {
  const b = basics(now);
  const { year, nextYear, stats } = b;
  const name = siteCopy(year).name;
  const currentMonth = new Date(b.today).getUTCMonth();

  const rows = Array.from({ length: 12 }, (_, month) => {
    const first = Date.UTC(year, month, 1);
    const inMonth = Math.round((Date.UTC(year, month + 1, 1) - first) / DAY_MS);
    const left = Math.round((b.nextYearStart - first) / DAY_MS);

    return {
      cells: [
        monthFormat.format(new Date(first)),
        String(inMonth),
        numberFormat.format(left),
        numberFormat.format(weekdaysBetween(first, b.nextYearStart)),
      ],
      current: month === currentMonth,
    };
  });

  const hoursLeft = Math.floor(
    (b.nextYearStart - now.getTime()) / (60 * 60 * 1000),
  );

  return {
    year,
    stats,
    asOfIso: b.asOfIso,
    asOfLabel: b.asOfLabel,
    heading: `How many days are left in ${year}?`,
    intro: `There ${thereAre(b.daysLeft, "day")} left in ${year}, counting today. That is ${weeksAndDays(b.daysLeft)}, including ${plural(b.weekdaysLeft, "weekday")} from Monday to Friday (as of ${b.asOfLabel}, UTC).`,
    summaryTitle: `Time left in ${year}`,
    summary: `${b.asOf}, ${plural(b.daysLeft, "day")} of ${year} ${b.daysLeft === 1 ? "is" : "are"} left counting today, or ${numberFormat.format(b.daysLeft - 1)} after today. That is about ${b.percentLeft} of the year, and roughly ${numberFormat.format(hoursLeft)} hours until midnight UTC on 1 January ${nextYear}.`,
    facts: [
      {
        label: "Days left (incl. today)",
        value: numberFormat.format(b.daysLeft),
      },
      { label: "Weeks left", value: weeksAndDays(b.daysLeft) },
      {
        label: "Weekdays left (Mon–Fri)",
        value: numberFormat.format(b.weekdaysLeft),
      },
      { label: "Year left", value: b.percentLeft },
    ],
    stepsTitle: "How to count the days left in the year",
    steps: [
      {
        title: "Find today's day number",
        text: `Today is day ${stats.dayOfYear} of ${year}.`,
      },
      {
        title: "Subtract it from the length of the year",
        text: `${year} has ${stats.daysInYear} days. ${stats.daysInYear} − ${stats.dayOfYear} = ${numberFormat.format(b.daysLeft - 1)} days after today.`,
      },
      {
        title: "Add one if today counts",
        text: `Counting today as well gives ${numberFormat.format(b.daysLeft)} days, the figure this page shows.`,
      },
      {
        title: "Or use a spreadsheet",
        text: "In Excel or Google Sheets, =DATE(YEAR(TODAY()),12,31)-TODAY() gives the days after today; add 1 to count today. =NETWORKDAYS(TODAY(),DATE(YEAR(TODAY()),12,31)) counts the weekdays left, including today.",
      },
    ],
    table: {
      caption: `Days left in ${year} on the 1st of each month`,
      columns: [
        "Month",
        "Days in month",
        "Days left on the 1st",
        "Weekdays left",
      ],
      rows,
    },
    faqs: [
      {
        question: `How many days are left in ${year}?`,
        answer: `${b.asOf}, there ${thereAre(b.daysLeft, "day")} left in ${year} counting today, or ${numberFormat.format(b.daysLeft - 1)} after today. The live counter above shows the figure for your own time zone.`,
      },
      {
        question: `How many weeks are left in ${year}?`,
        answer: `${b.asOf}, the time left in ${year} is ${weeksAndDays(b.daysLeft)}, counting today.`,
      },
      {
        question: `How many working days are left in ${year}?`,
        answer: `${b.asOf}, ${plural(b.weekdaysLeft, "weekday")} (Monday to Friday) ${b.weekdaysLeft === 1 ? "is" : "are"} left in ${year}, counting today. Public holidays differ by country and are not subtracted, so take off any that fall on a weekday where you live.`,
      },
      {
        question: "Does the count include today?",
        answer: `Yes. The main number counts today as a day left, because it isn't over yet. The number of days after today is one less: ${numberFormat.format(b.daysLeft - 1)}.`,
      },
      {
        question: "Why is the number different on another site?",
        answer:
          "Some sites count today and some don't, and the day changes at midnight in your own time zone. This page counts today and uses your local time zone, which you can change with the Location button.",
      },
      {
        question: `What percent of ${year} is left?`,
        answer: `${b.asOf}, about ${b.percentLeft} of ${year} is left and ${b.percent} has passed. The year progress bar shows the live percentage.`,
        link: { text: "year progress bar", href: "/" },
      },
      authorFaq(name),
    ],
  };
}

/* ------------------------------------------------------------------------ */
/* Days until New Year                                                      */
/* ------------------------------------------------------------------------ */

export function getNewYearContent(now: Date = new Date()): PageContent {
  const b = basics(now);
  const { year, nextYear, stats } = b;
  const name = siteCopy(year).name;
  const newYearsDay = weekday(b.nextYearStart);
  const newYearsEve = weekday(b.nextYearStart - DAY_MS);

  return {
    year,
    stats,
    asOfIso: b.asOfIso,
    asOfLabel: b.asOfLabel,
    heading: `How many days until New Year ${nextYear}?`,
    intro: `There ${thereAre(b.daysLeft, "day")} until New Year ${nextYear}, counting today. 1 January ${nextYear} is a ${newYearsDay}, and the live countdown below runs to midnight in your own time zone (as of ${b.asOfLabel}, UTC).`,
    summaryTitle: `Countdown to ${nextYear}`,
    summary: `${b.asOf}, New Year's Day ${nextYear} is ${plural(b.daysLeft, "day")} away, or ${weeksAndDays(b.daysLeft)}. ${year} is ${b.percent} complete. New Year's Eve is ${newYearsEve}, 31 December ${year}.`,
    facts: [
      {
        label: `Days until ${nextYear}`,
        value: numberFormat.format(b.daysLeft),
      },
      { label: "Weeks", value: weeksAndDays(b.daysLeft) },
      { label: "1 January falls on", value: newYearsDay },
      { label: `${year} complete`, value: b.percent },
    ],
    stepsTitle: "How the New Year countdown works",
    steps: [
      {
        title: "It counts to your midnight",
        text: `The countdown runs to 00:00 on 1 January ${nextYear} in the time zone shown above it, which is detected from where you are.`,
      },
      {
        title: "Count down somewhere else",
        text: "Use the Location button to pick any city or time zone, for example to count down with family abroad.",
      },
      {
        title: "Leave it open",
        text: "The days, hours, minutes and seconds update every second, so you can keep the tab open on New Year's Eve.",
      },
    ],
    faqs: [
      {
        question: `How many days until New Year ${nextYear}?`,
        answer: `${b.asOf}, there ${thereAre(b.daysLeft, "day")} until 1 January ${nextYear}, counting today. The live countdown above shows the days, hours, minutes and seconds left in your time zone.`,
      },
      {
        question: `What day of the week is New Year's Day ${nextYear}?`,
        answer: `1 January ${nextYear} is a ${newYearsDay}, and New Year's Eve, 31 December ${year}, is a ${newYearsEve}.`,
      },
      {
        question: "Where does the New Year start first and last?",
        answer:
          "The first places to reach midnight are Kiribati's Line Islands, including Kiritimati, at UTC+14. The last inhabited places are American Samoa and Niue at UTC−11, a full day later. Pick any of them with the Location button to see their countdown.",
      },
      {
        question: "Does the countdown use my time zone?",
        answer: `Yes. It counts down to midnight where you are. ${timeZoneNote}`,
      },
      {
        question: `How many weeks until ${nextYear}?`,
        answer: `${b.asOf}, ${nextYear} is ${weeksAndDays(b.daysLeft)} away, counting today.`,
      },
      authorFaq(name),
    ],
  };
}

/* ------------------------------------------------------------------------ */
/* What week is it?                                                         */
/* ------------------------------------------------------------------------ */

export function getWeekContent(now: Date = new Date()): PageContent {
  const b = basics(now);
  const { year, stats, week } = b;
  const name = siteCopy(year).name;
  const weeksInIsoYear = isoWeeksInYear(week.year);
  const weeksLeft = weeksInIsoYear - week.week;
  const range = `${weekday(week.monday)} ${formatDate(week.monday)} to ${weekday(week.sunday)} ${formatDate(week.sunday)}`;
  const usWeek = usWeekNumber(b.today);
  const newYearWeek = isoWeekOf(b.nextYearStart);

  return {
    year,
    stats,
    asOfIso: b.asOfIso,
    asOfLabel: b.asOfLabel,
    heading: "What week is it?",
    intro: `It is week ${week.week} of ${week.year}. ISO week ${week.week} runs from ${range} (as of ${b.asOfLabel}, UTC).`,
    summaryTitle: `Week ${week.week} of ${week.year}`,
    summary: `${b.asOf}, it is ISO week ${week.week} of ${weeksInIsoYear} in ${week.year}, and today is day ${stats.dayOfYear} of the year. ${weeksLeft === 0 ? "This is the last ISO week of the year." : `${plural(weeksLeft, "more week")} ${weeksLeft === 1 ? "follows" : "follow"} this one before ISO week 1 of ${week.year + 1}.`} Calendars that start weeks on Sunday and count the week containing 1 January as week 1 (the US style, and Excel's WEEKNUM) call this week ${usWeek}.`,
    facts: [
      { label: "ISO week number", value: String(week.week) },
      {
        label: "This week",
        value: `${shortDate(week.monday)} – ${shortDate(week.sunday)}`,
      },
      {
        label: `ISO weeks in ${week.year}`,
        value: String(weeksInIsoYear),
      },
      { label: "US week number", value: String(usWeek) },
    ],
    stepsTitle: "How ISO week numbers work",
    steps: [
      {
        title: "Weeks run Monday to Sunday",
        text: "ISO 8601, the international standard used across Europe and much of Asia, starts every week on Monday.",
      },
      {
        title: "Week 1 holds the first Thursday",
        text: "Week 1 is the week with the year's first Thursday in it, which is also the week that contains 4 January.",
      },
      {
        title: "Years have 52 or 53 weeks",
        text: `A year has 53 ISO weeks when it starts on a Thursday, or is a leap year starting on a Wednesday. ${week.year} has ${weeksInIsoYear}.`,
      },
      {
        title: "In a spreadsheet",
        text: "=ISOWEEKNUM(TODAY()) in Excel or Google Sheets gives the ISO week number. =WEEKNUM(TODAY()) gives the US-style number instead.",
      },
    ],
    table: {
      caption: `All ISO weeks of ${week.year}`,
      columns: ["Week", "Monday", "Sunday"],
      rows: isoWeeksOf(week.year).map((w) => ({
        cells: [String(w.week), formatDate(w.monday), formatDate(w.sunday)],
        current: w.week === week.week,
      })),
    },
    faqs: [
      {
        question: "What week number is it today?",
        answer: `${b.asOf}, it is ISO week ${week.week} of ${week.year}, which runs from ${range}. The live display above uses your own time zone.`,
      },
      {
        question: "Why does my calendar show a different week number?",
        answer: `Two systems are common. ISO 8601 starts weeks on Monday and makes the week with the first Thursday week 1; this is week ${week.week}. The US style starts weeks on Sunday and makes the week containing 1 January week 1; this is week ${usWeek}. The two can differ by one, especially near the start and end of a year.`,
      },
      {
        question: `How many weeks are in ${week.year}?`,
        answer: `${week.year} has ${weeksInIsoYear} ISO weeks. As a count of days, ${week.year} has ${weeksAndDays(getYearStats(now, week.year, "UTC").daysInYear)}.`,
      },
      {
        question: "Which week does 1 January belong to?",
        answer: `In ISO 8601, 1 January is in week 1 only if it falls on a Monday to Thursday; otherwise it belongs to the last week (52 or 53) of the previous year. 1 January ${year + 1} is a ${weekday(b.nextYearStart)}, so it is in ISO week ${newYearWeek.week} of ${newYearWeek.year}.`,
      },
      {
        question: "How do I get the week number in Excel or Google Sheets?",
        answer:
          "Use =ISOWEEKNUM(A1) for the ISO week number of the date in A1, or =ISOWEEKNUM(TODAY()) for today. =WEEKNUM(A1) gives the US-style number, and =WEEKNUM(A1,21) also gives the ISO number.",
      },
      authorFaq(name),
    ],
  };
}
