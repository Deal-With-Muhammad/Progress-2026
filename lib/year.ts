/**
 * Pure, dependency-free year maths shared by the live counter (client),
 * the server-rendered facts/FAQ and the Open Graph image.
 */

export const DAY_MS = 24 * 60 * 60 * 1000;

export type YearStatus = "upcoming" | "in-progress" | "complete";

export interface YearStats {
  year: number;
  status: YearStatus;
  isLeapYear: boolean;
  daysInYear: number;
  /** Share of the year that has passed, 0–100, unrounded. */
  percentage: number;
  /** Full days completed since 1 January (today is not counted). */
  daysElapsed: number;
  /** Days left in the year, counting today (during the year this is the days until 1 January). */
  daysRemaining: number;
  /** 1-based day of the year for today (0 before the year starts). */
  dayOfYear: number;
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function nextLeapYear(after: number): number {
  let year = after + 1;

  while (!isLeapYear(year)) year++;

  return year;
}

/**
 * The wall-clock time in `timeZone`, expressed as a UTC timestamp. Comparing it
 * with `Date.UTC(year, 0, 1)` gives calendar-accurate maths that is not skewed
 * by the browser's own time zone or daylight-saving changes.
 */
export function wallClockMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") % 24,
    get("minute"),
    get("second"),
    date.getUTCMilliseconds(),
  );
}

/** Progress through `year` at `date`, measured in the given IANA time zone. */
export function getYearStats(
  date: Date,
  year: number,
  timeZone = "UTC",
): YearStats {
  const now = wallClockMs(date, timeZone);
  const start = Date.UTC(year, 0, 1);
  const end = Date.UTC(year + 1, 0, 1);
  const daysInYear = Math.round((end - start) / DAY_MS);
  const clamped = Math.min(Math.max(now, start), end);
  const daysElapsed = Math.floor((clamped - start) / DAY_MS);
  const status: YearStatus =
    now < start ? "upcoming" : now >= end ? "complete" : "in-progress";

  return {
    year,
    status,
    isLeapYear: isLeapYear(year),
    daysInYear,
    percentage: ((clamped - start) / (end - start)) * 100,
    daysElapsed,
    daysRemaining: daysInYear - daysElapsed,
    dayOfYear: status === "in-progress" ? daysElapsed + 1 : 0,
  };
}

/** Number of ISO 8601 weeks in a year (52 or 53). */
export function isoWeeksInYear(year: number): number {
  const jan1 = new Date(Date.UTC(year, 0, 1)).getUTCDay(); // 0 = Sunday
  const thursday = 4;
  const wednesday = 3;

  return jan1 === thursday || (isLeapYear(year) && jan1 === wednesday)
    ? 53
    : 52;
}
