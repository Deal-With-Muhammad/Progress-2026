import type { LocationData, ProgressData } from "@/types";

import * as Flags from "country-flag-icons/react/3x2";
import clsx from "clsx";

import { liveDecimals, rangeLabel } from "@/lib/year";

interface ProgressDisplayProps {
  progress: ProgressData;
  location: LocationData;
}

const number = new Intl.NumberFormat("en");
const days = (n: number) => `${number.format(n)} ${n === 1 ? "day" : "days"}`;

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-default-50 p-4 text-center">
      <div className="text-3xl font-bold tabular-nums text-default-900 md:text-4xl">
        {value}
      </div>
      <div className="mt-1 text-xs text-default-600 md:text-base">{label}</div>
    </div>
  );
}

export default function ProgressDisplay({
  progress,
  location,
}: ProgressDisplayProps) {
  const Flag = Flags[location.countryCode as keyof typeof Flags];
  const label = rangeLabel(progress);
  const single = progress.years === 1;
  const { status } = progress;

  // Live ranges tick about once a second; finished or future ones are whole numbers.
  const [whole, fraction] =
    status === "in-progress"
      ? progress.percentage.toFixed(liveDecimals(progress.totalDays)).split(".")
      : [status === "complete" ? "100" : "0", undefined];

  const dayOf = `Day ${number.format(progress.daysElapsed + 1)} of ${number.format(progress.totalDays)}`;
  const statusText =
    status === "upcoming"
      ? `Starts in ${days(progress.daysUntilStart)}`
      : status === "complete"
        ? `Ended ${progress.daysSinceEnd === 0 ? "today" : `${days(progress.daysSinceEnd)} ago`}`
        : single
          ? dayOf
          : `${dayOf} · ${progress.years} years`;

  const tiles =
    status === "upcoming"
      ? [
          {
            value: number.format(progress.daysUntilStart),
            label: "Days until it starts",
          },
          {
            value: number.format(progress.totalDays),
            label: `Days in ${label}`,
          },
        ]
      : status === "complete"
        ? [
            {
              value: number.format(progress.totalDays),
              label: `Days in ${label}`,
            },
            {
              value: number.format(progress.daysSinceEnd),
              label: "Days since it ended",
            },
          ]
        : [
            {
              value: number.format(progress.daysElapsed),
              label: "Days Elapsed",
            },
            {
              value: number.format(progress.daysRemaining),
              label: "Days Remaining",
            },
          ];

  // Each year's slice of the bar; its label sits in the middle. Long ranges
  // label every few years so the labels don't collide.
  const edges = [0, ...progress.yearMarks.map((mark) => mark.at), 100];
  const segments = edges.slice(0, -1).map((at, i) => ({
    year: progress.from + i,
    center: (at + edges[i + 1]) / 2,
  }));
  const labelEvery = Math.max(1, Math.ceil(progress.years / 6));
  const width =
    status === "in-progress"
      ? progress.percentage
      : status === "complete"
        ? 100
        : 0;

  return (
    <div className="mx-auto w-full max-w-4xl px-4">
      <div className="mb-8 text-center">
        <div className="mb-2 flex items-center justify-center gap-3">
          {Flag && (
            <Flag
              className="h-6 w-8 rounded shadow-md sm:h-7 sm:w-10"
              role="img"
              title={`Flag of ${location.country}`}
            />
          )}
          <h2 className="text-xl font-bold text-default-900 md:text-3xl">
            {location.name}
          </h2>
        </div>
        <p className="text-sm text-default-600 md:text-base">
          {progress.currentDate}
        </p>
      </div>

      <div className="mb-6 rounded-2xl p-6 shadow-xl md:p-8">
        <div className="mb-6 text-center">
          <span
            className={clsx(
              "mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold md:text-sm",
              status === "in-progress" && "bg-success-50 text-success-700",
              status === "upcoming" && "bg-warning-50 text-warning-700",
              status === "complete" && "bg-default-100 text-default-700",
            )}
          >
            <span
              aria-hidden="true"
              className={clsx(
                "size-2 rounded-full",
                status === "in-progress" &&
                  "animate-pulse bg-success-500 motion-reduce:animate-none",
                status === "upcoming" && "bg-warning-500",
                status === "complete" && "bg-default-500",
              )}
            />
            {statusText}
          </span>
          <p className="mb-2 font-bold leading-none tabular-nums text-primary">
            <span className="text-6xl md:text-8xl">{whole}</span>
            {fraction ? (
              <span className="text-2xl md:text-4xl">.{fraction}</span>
            ) : null}
            <span className="text-3xl md:text-5xl">%</span>
          </p>
          <p className="text-lg text-default-500 md:text-xl">
            of {label} completed
          </p>
        </div>

        <div className="mb-8">
          <div
            aria-label={`${Math.floor(width)}% of ${label} completed`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={Math.floor(width)}
            className="relative h-8 overflow-hidden rounded-full bg-default-200"
            role="progressbar"
          >
            <div
              className="absolute left-0 top-0 h-full bg-primary transition-[width] duration-1000 ease-out"
              style={{ width: `${width}%` }}
            />
            {/* A thin line where each new year begins. */}
            {progress.yearMarks.map((mark) => (
              <span
                key={mark.year}
                aria-hidden="true"
                className="absolute top-0 h-full w-0.5 -translate-x-1/2 bg-background/70"
                style={{ left: `${mark.at}%` }}
              />
            ))}
          </div>
          {single ? null : (
            <div
              aria-hidden="true"
              className="relative mt-2 h-4 text-[11px] tabular-nums text-default-500 md:text-xs"
            >
              {segments
                .filter(
                  (segment) =>
                    (segment.year - progress.from) % labelEvery === 0,
                )
                .map((segment) => (
                  <span
                    key={segment.year}
                    className="absolute -translate-x-1/2"
                    style={{ left: `${segment.center}%` }}
                  >
                    {segment.year}
                  </span>
                ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {tiles.map((tile) => (
            <Tile key={tile.label} label={tile.label} value={tile.value} />
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-default-50 p-4 text-center">
        <p className="text-sm text-default-700">
          Time is constantly moving. Make every moment count! 🚀
        </p>
      </div>
    </div>
  );
}
