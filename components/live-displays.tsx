import type { LocationData, ProgressData } from "@/types";

import clsx from "clsx";

import { LocationHeader, Tile } from "@/components/ProgressDisplay";
import {
  DAY_MS,
  countdownTo,
  isoWeekOf,
  isoWeeksInYear,
  startOfDay,
  usWeekNumber,
  weekdaysBetween,
} from "@/lib/year";

/** The focused views each landing page opens on. "progress" is the home page. */
export type LiveVariant = "progress" | "days-left" | "new-year" | "week";

interface DisplayProps {
  progress: ProgressData;
  location: LocationData;
}

const number = new Intl.NumberFormat("en");
const shortDate = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const pad = (n: number) => String(n).padStart(2, "0");

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4">
      <div className="mb-6 rounded-2xl p-6 shadow-xl md:p-8">{children}</div>
    </div>
  );
}

function Hero({
  value,
  caption,
  long = false,
}: {
  value: string;
  caption: string;
  /** Long values (the countdown) start smaller so they fit on one line on phones. */
  long?: boolean;
}) {
  return (
    <div className="mb-6 text-center">
      <p
        className={clsx(
          "mb-2 whitespace-nowrap font-bold leading-none tabular-nums text-primary md:text-8xl",
          long ? "text-4xl sm:text-6xl" : "text-5xl sm:text-6xl",
        )}
      >
        {value}
      </p>
      <p className="text-lg text-default-500 md:text-xl">{caption}</p>
    </div>
  );
}

function Bar({ percentage, label }: { percentage: number; label: string }) {
  return (
    <div
      aria-label={label}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={Math.floor(percentage)}
      className="relative mb-8 h-4 overflow-hidden rounded-full bg-default-200"
      role="progressbar"
    >
      <div
        className="absolute left-0 top-0 h-full bg-primary transition-[width] duration-1000 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

/** Days left in the current year, counting today. */
export function DaysLeftDisplay({ progress, location }: DisplayProps) {
  const year = progress.from;
  const end = Date.UTC(year + 1, 0, 1);
  const today = startOfDay(progress.wallMs);
  const weeks = Math.floor(progress.daysRemaining / 7);
  const rest = progress.daysRemaining % 7;
  const hoursLeft = Math.floor((end - progress.wallMs) / (60 * 60 * 1000));

  return (
    <>
      <LocationHeader currentDate={progress.currentDate} location={location} />
      <Card>
        <Hero
          caption={`${progress.daysRemaining === 1 ? "day" : "days"} left in ${year}, counting today`}
          value={number.format(progress.daysRemaining)}
        />
        <Bar
          label={`${Math.floor(progress.percentage)}% of ${year} completed`}
          percentage={progress.percentage}
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Tile
            label="Weeks + days"
            value={rest ? `${weeks}w ${rest}d` : `${weeks}w`}
          />
          <Tile
            label="Weekdays (Mon–Fri)"
            value={number.format(weekdaysBetween(today, end))}
          />
          <Tile label="Hours left" value={number.format(hoursLeft)} />
          <Tile
            label="Of the year left"
            value={`${(100 - progress.percentage).toFixed(2)}%`}
          />
        </div>
      </Card>
    </>
  );
}

/** A live countdown to midnight on 1 January next year. */
export function NewYearDisplay({ progress, location }: DisplayProps) {
  const nextYear = progress.from + 1;
  const left = countdownTo(nextYear, progress.wallMs);

  return (
    <>
      <LocationHeader currentDate={progress.currentDate} location={location} />
      <Card>
        <Hero
          long
          caption={`until New Year ${nextYear} in ${location.city}`}
          value={`${number.format(left.days)}d ${pad(left.hours)}:${pad(left.minutes)}:${pad(left.seconds)}`}
        />
        <Bar
          label={`${Math.floor(progress.percentage)}% of ${progress.from} completed`}
          percentage={progress.percentage}
        />
        <div aria-live="off" className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Tile label="Days" value={number.format(left.days)} />
          <Tile label="Hours" value={pad(left.hours)} />
          <Tile label="Minutes" value={pad(left.minutes)} />
          <Tile label="Seconds" value={pad(left.seconds)} />
        </div>
      </Card>
    </>
  );
}

/** Today's ISO week number, with the US-style number alongside. */
export function WeekDisplay({ progress, location }: DisplayProps) {
  const week = isoWeekOf(progress.wallMs);
  const weeksInYear = isoWeeksInYear(week.year);
  const dayOfWeek = Math.round(
    (startOfDay(progress.wallMs) - week.monday) / DAY_MS,
  );

  return (
    <>
      <LocationHeader currentDate={progress.currentDate} location={location} />
      <Card>
        <Hero
          caption={`${shortDate.format(week.monday)} – ${shortDate.format(week.sunday)} · ISO week of ${week.year}`}
          value={`Week ${week.week}`}
        />
        <Bar
          label={`Week ${week.week} of ${weeksInYear}`}
          percentage={
            ((week.week - 1 + (dayOfWeek + 1) / 7) / weeksInYear) * 100
          }
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Tile label="ISO weeks this year" value={String(weeksInYear)} />
          <Tile
            label="Weeks after this one"
            value={String(weeksInYear - week.week)}
          />
          <Tile
            label="Day of the year"
            value={number.format(progress.daysElapsed + 1)}
          />
          <Tile
            label="US week (Sun start)"
            value={String(usWeekNumber(progress.wallMs))}
          />
        </div>
      </Card>
    </>
  );
}
