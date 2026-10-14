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
  const range = getRangeStats(date, { from: year, to: year }, timeZone);

  return {
    year,
    status: range.status,
    isLeapYear: isLeapYear(year),
    daysInYear: range.totalDays,
    percentage: range.percentage,
    daysElapsed: range.daysElapsed,
    daysRemaining: range.daysRemaining,
    dayOfYear: range.status === "in-progress" ? range.daysElapsed + 1 : 0,
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

/* ------------------------------------------------------------------------ */
/* Ranges of years (e.g. 2026–2030, or 2010–2027)                           */
/* ------------------------------------------------------------------------ */

/** Earliest and latest years the picker offers. */
export const MIN_YEAR = 1900;
export const MAX_YEAR = 2100;

/** Whole calendar years, `from` to `to` inclusive. A single year has from === to. */
export interface YearRange {
  from: number;
  to: number;
}

export interface RangeStats extends YearRange {
  status: YearStatus;
  /** Number of calendar years in the range. */
  years: number;
  totalDays: number;
  /** Share of the range that has passed, 0–100, unrounded. */
  percentage: number;
  /** Full days completed since 1 January of `from`. */
  daysElapsed: number;
  /** Days left until 1 January after `to`, counting today. */
  daysRemaining: number;
  /** Days until the range starts (only while upcoming). */
  daysUntilStart: number;
  /** Days since the range ended (only once complete). */
  daysSinceEnd: number;
  /** Where each year after the first begins, as a percentage of the range. */
  yearMarks: { year: number; at: number }[];
}

export function clampYear(year: number): number {
  return Math.min(MAX_YEAR, Math.max(MIN_YEAR, Math.trunc(year)));
}

/** Puts the years in order and inside the supported span. */
export function normalizeRange({ from, to }: YearRange): YearRange {
  const a = clampYear(from);
  const b = clampYear(to);

  return a <= b ? { from: a, to: b } : { from: b, to: a };
}

/** The calendar year it currently is in `timeZone`. */
export function currentYear(date: Date, timeZone = "UTC"): number {
  return new Date(wallClockMs(date, timeZone)).getUTCFullYear();
}

/** Progress through a range of whole years at `date`, measured in `timeZone`. */
export function getRangeStats(
  date: Date,
  range: YearRange,
  timeZone = "UTC",
): RangeStats {
  const { from, to } = normalizeRange(range);
  const now = wallClockMs(date, timeZone);
  const start = Date.UTC(from, 0, 1);
  const end = Date.UTC(to + 1, 0, 1);
  const totalDays = Math.round((end - start) / DAY_MS);
  const clamped = Math.min(Math.max(now, start), end);
  const daysElapsed = Math.floor((clamped - start) / DAY_MS);
  const status: YearStatus =
    now < start ? "upcoming" : now >= end ? "complete" : "in-progress";

  const yearMarks = [];

  for (let year = from + 1; year <= to; year++) {
    yearMarks.push({
      year,
      at: ((Date.UTC(year, 0, 1) - start) / (end - start)) * 100,
    });
  }

  return {
    from,
    to,
    status,
    years: to - from + 1,
    totalDays,
    percentage: ((clamped - start) / (end - start)) * 100,
    daysElapsed,
    daysRemaining: totalDays - daysElapsed,
    daysUntilStart:
      status === "upcoming" ? Math.ceil((start - now) / DAY_MS) : 0,
    daysSinceEnd: status === "complete" ? Math.floor((now - end) / DAY_MS) : 0,
    yearMarks,
  };
}

/**
 * Decimals that make the live percentage tick about once a second:
 * a single year needs 6, longer ranges 7.
 */
export function liveDecimals(totalDays: number): number {
  const secondsPerHundredth = (totalDays * 86400) / 100;

  return Math.min(7, Math.max(4, Math.ceil(Math.log10(secondsPerHundredth))));
}

/** "2027" or "2026–2030". */
export function rangeLabel({ from, to }: YearRange): string {
  return from === to ? String(from) : `${from}–${to}`;
}

/** Reads ?year=2027 or ?from=2026&to=2030 from a query string. */
export function rangeFromSearch(search: string): YearRange | null {
  const params = new URLSearchParams(search);
  const read = (key: string) => {
    const value = params.get(key);

    return value && /^\d{4}$/.test(value) ? Number(value) : null;
  };
  const year = read("year");

  if (year) return normalizeRange({ from: year, to: year });
  const from = read("from");
  const to = read("to");

  if (from || to) return normalizeRange({ from: from ?? to!, to: to ?? from! });

  return null;
}

/** The query string for a range ("" for the current year, the default). */
export function rangeToSearch(range: YearRange, thisYear: number): string {
  if (range.from === range.to) {
    return range.from === thisYear ? "" : `?year=${range.from}`;
  }

  return `?from=${range.from}&to=${range.to}`;
}
