"use client";

import { useEffect, useRef, useState, type Ref } from "react";
import { motion, useReducedMotion } from "framer-motion";
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

type IconProps = { className?: string };

const Chevron = ({
  className,
  dir,
}: IconProps & { dir: "left" | "right" | "down" }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2.2}
    viewBox="0 0 24 24"
  >
    <path
      d={
        dir === "left"
          ? "m15 18-6-6 6-6"
          : dir === "right"
            ? "m9 18 6-6-6-6"
            : "m6 9 6 6 6-6"
      }
    />
  </svg>
);

const ShareIcon = ({ className }: IconProps) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path d="M12 3v12M7 8l5-5 5 5M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
  </svg>
);

const CheckIcon = ({ className }: IconProps) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2.4}
    viewBox="0 0 24 24"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/** One year: a rounded control with the year menu, and ‹ › steps on larger screens. */
function YearControl({
  id,
  label,
  value,
  onChange,
  selectRef,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (year: number) => void;
  selectRef?: Ref<HTMLSelectElement>;
}) {
  const step = (by: number) =>
    onChange(Math.min(MAX_YEAR, Math.max(MIN_YEAR, value + by)));
  const stepButton =
    "hidden size-9 shrink-0 place-items-center rounded-full text-default-500 transition-colors hover:bg-default-100 hover:text-foreground active:scale-90 disabled:pointer-events-none disabled:opacity-30 sm:grid";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <label
        className="text-[11px] font-semibold uppercase tracking-[0.2em] text-default-400"
        htmlFor={id}
      >
        {label}
      </label>
      <div className="flex h-12 items-center rounded-full border border-default-200 bg-content1 px-1 shadow-sm transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 hover:border-default-300">
        <button
          aria-label={`${label}: previous year`}
          className={stepButton}
          disabled={value <= MIN_YEAR}
          type="button"
          onClick={() => step(-1)}
        >
          <Chevron className="size-4" dir="left" />
        </button>
        <div className="relative">
          <select
            ref={selectRef}
            className="h-10 cursor-pointer appearance-none bg-transparent pl-4 pr-8 text-lg font-semibold tabular-nums text-foreground outline-none sm:pl-2 sm:pr-7"
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
          <Chevron
            className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-default-400 sm:right-1.5"
            dir="down"
          />
        </div>
        <button
          aria-label={`${label}: next year`}
          className={stepButton}
          disabled={value >= MAX_YEAR}
          type="button"
          onClick={() => step(1)}
        >
          <Chevron className="size-4" dir="right" />
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
  const fromSelect = useRef<HTMLSelectElement>(null);
  const reduceMotion = useReducedMotion();

  const presets = presetsFor(thisYear);
  const activePreset = presets.find((p) => same(p.range, range));
  const options = [
    ...presets.map((p) => ({ ...p, active: p === activePreset })),
    // Lights up for any range the presets don't cover.
    { label: "Custom", range: null, active: !activePreset },
  ];

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
      className="mx-auto mb-10 flex w-full max-w-4xl flex-col items-center gap-6 px-4"
    >
      {/* Segmented control: one pill row on larger screens, a 3 × 2 grid on phones so every option shows. */}
      <div
        aria-label="Quick ranges"
        className="grid w-full max-w-sm grid-cols-3 gap-0.5 rounded-2xl bg-default-100 p-1 sm:flex sm:w-auto sm:max-w-none sm:rounded-full"
        role="group"
      >
        {options.map((option) => (
          <button
            key={option.label}
            aria-pressed={option.active}
            className={clsx(
              "relative rounded-xl px-1.5 py-2 text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/50 sm:shrink-0 sm:rounded-full sm:px-4 sm:text-sm",
              option.active
                ? "text-primary-foreground"
                : "text-default-500 hover:text-foreground",
            )}
            title={
              option.range
                ? rangeLabel(option.range)
                : "Pick your own years below"
            }
            type="button"
            onClick={() =>
              option.range
                ? onChange(option.range)
                : fromSelect.current?.focus()
            }
          >
            {option.active ? (
              <motion.span
                className="absolute inset-0 rounded-xl bg-primary shadow-sm sm:rounded-full"
                layoutId="range-preset-pill"
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: "spring", bounce: 0.18, duration: 0.45 }
                }
              />
            ) : null}
            <span className="relative whitespace-nowrap">{option.label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-end justify-center gap-2 sm:gap-4">
        <YearControl
          id="range-from"
          label="From"
          selectRef={fromSelect}
          value={range.from}
          onChange={setFrom}
        />
        <span
          aria-hidden="true"
          className="grid h-12 place-items-center px-0.5 text-default-300"
        >
          <svg
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
        <YearControl
          id="range-to"
          label="To"
          value={range.to}
          onChange={setTo}
        />
        <button
          aria-label={copied ? "Link copied" : "Share this range"}
          className={clsx(
            "ml-1 flex h-12 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium shadow-sm transition-colors sm:ml-2",
            copied
              ? "border-success-200 bg-success-50 text-success-700"
              : "border-default-200 bg-content1 text-default-600 hover:border-default-300 hover:text-foreground",
          )}
          type="button"
          onClick={share}
        >
          {copied ? (
            <CheckIcon className="size-4" />
          ) : (
            <ShareIcon className="size-4" />
          )}
          <span aria-live="polite" className="hidden sm:inline">
            {copied ? "Copied" : "Share"}
          </span>
        </button>
      </div>
    </section>
  );
}
