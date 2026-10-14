"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

import {
  MAX_YEAR,
  MIN_YEAR,
  normalizeRange,
  rangeLabel,
  type YearRange,
} from "@/lib/year";

interface RangePickerProps {
  range: YearRange;
  /** The current calendar year in the visitor's time zone. */
  thisYear: number;
  onChange: (range: YearRange) => void;
}

const YEARS = Array.from(
  { length: MAX_YEAR - MIN_YEAR + 1 },
  (_, i) => MIN_YEAR + i,
);

function presetsFor(year: number) {
  const decade = Math.floor(year / 10) * 10;

  return [
    { label: "This year", range: { from: year, to: year } },
    { label: "Next year", range: { from: year + 1, to: year + 1 } },
    { label: "Next 5 years", range: { from: year, to: year + 4 } },
    { label: "This decade", range: { from: decade, to: decade + 9 } },
    { label: "Last 10 years", range: { from: year - 9, to: year } },
  ];
}

const same = (a: YearRange, b: YearRange) => a.from === b.from && a.to === b.to;

function YearSelect({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (year: number) => void;
}) {
  const step = (by: number) =>
    onChange(Math.min(MAX_YEAR, Math.max(MIN_YEAR, value + by)));
  const stepButton =
    "hidden size-11 shrink-0 place-items-center rounded-xl bg-default-100 text-lg text-default-600 transition-colors hover:bg-default-200 hover:text-foreground active:scale-95 disabled:pointer-events-none disabled:opacity-40 sm:grid";

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <label
        className="text-xs font-medium uppercase tracking-wider text-default-500"
        htmlFor={id}
      >
        {label}
      </label>
      <div className="flex items-center gap-1.5">
        <button
          aria-label={`${label}: previous year`}
          className={stepButton}
          disabled={value <= MIN_YEAR}
          type="button"
          onClick={() => step(-1)}
        >
          ‹
        </button>
        <div className="relative min-w-0 flex-1">
          <select
            className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-default-200 bg-content1 pl-2 pr-6 text-center text-base font-semibold sm:pl-3 sm:pr-8 sm:text-lg tabular-nums text-foreground outline-none transition-colors hover:border-default-400 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
            id={id}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
          >
            {YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-2 top-1/2 sm:right-3 -translate-y-1/2 text-xs text-default-400"
          >
            ▾
          </span>
        </div>
        <button
          aria-label={`${label}: next year`}
          className={stepButton}
          disabled={value >= MAX_YEAR}
          type="button"
          onClick={() => step(1)}
        >
          ›
        </button>
      </div>
    </div>
  );
}

/** Quick presets plus From / To years, for one year or many. */
export default function RangePicker({
  range,
  thisYear,
  onChange,
}: RangePickerProps) {
  const [copied, setCopied] = useState(false);
  const strip = useRef<HTMLDivElement>(null);

  // On narrow screens the presets scroll sideways: keep the selected one in view.
  useEffect(() => {
    const container = strip.current;
    const active = container?.querySelector<HTMLElement>(
      '[aria-pressed="true"]',
    );

    if (!container || !active) return;
    const left = active.offsetLeft - container.offsetLeft;
    const visible =
      left >= container.scrollLeft &&
      left + active.offsetWidth <= container.scrollLeft + container.clientWidth;

    if (!visible) container.scrollTo({ left: left - 8, behavior: "smooth" });
  }, [range]);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);

    return () => window.clearTimeout(id);
  }, [copied]);

  // Moving one end past the other drags the other end along with it.
  const setFrom = (from: number) =>
    onChange(normalizeRange({ from, to: Math.max(from, range.to) }));
  const setTo = (to: number) =>
    onChange(normalizeRange({ from: Math.min(to, range.from), to }));

  async function share() {
    const url = window.location.href;
    const title = `${rangeLabel(range)} progress`;

    window.dwm?.("share");
    try {
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title, url });

        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Share sheet dismissed or clipboard blocked: nothing to do.
    }
  }

  return (
    <section
      aria-label="Choose the years to track"
      className="mx-auto mb-8 w-full max-w-4xl px-4"
    >
      <div className="rounded-2xl border border-default-200 bg-content1 p-4 shadow-sm md:p-5">
        <div
          ref={strip}
          aria-label="Quick ranges"
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]"
          role="group"
        >
          {presetsFor(thisYear).map((preset) => {
            const active = same(preset.range, range);

            return (
              <button
                key={preset.label}
                aria-pressed={active}
                className={clsx(
                  "flex shrink-0 flex-col items-start rounded-xl border px-3.5 py-2 text-left transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-default-200 text-foreground hover:border-default-400 hover:bg-default-100",
                )}
                type="button"
                onClick={() => onChange(preset.range)}
              >
                <span className="text-sm font-semibold">{preset.label}</span>
                <span
                  className={clsx(
                    "text-xs tabular-nums",
                    active ? "opacity-80" : "text-default-500",
                  )}
                >
                  {rangeLabel(preset.range)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-[1fr_1fr_auto] items-end gap-2 sm:flex sm:gap-3">
          <YearSelect
            id="range-from"
            label="From"
            value={range.from}
            onChange={setFrom}
          />
          <span
            aria-hidden="true"
            className="hidden h-11 items-center text-default-400 sm:flex"
          >
            →
          </span>
          <YearSelect
            id="range-to"
            label="To"
            value={range.to}
            onChange={setTo}
          />
          <button
            className="h-11 shrink-0 rounded-xl bg-default-100 px-4 text-sm font-medium text-default-700 transition-colors hover:bg-default-200 hover:text-foreground"
            type="button"
            onClick={share}
          >
            <span aria-live="polite">{copied ? "Link copied ✓" : "Share"}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
