"use client";

import type { LocationData, ProgressData } from "@/types";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

import ProgressDisplay from "@/components/ProgressDisplay";
import {
  DaysLeftDisplay,
  NewYearDisplay,
  WeekDisplay,
  type LiveVariant,
} from "@/components/live-displays";
import Navbar from "@/components/navbar";
import RangePicker from "@/components/range-picker";
import { detectUserLocation, calculateProgress } from "@/lib/utils";
import {
  currentYear,
  rangeFromSearch,
  rangeLabel,
  rangeToSearch,
  type YearRange,
} from "@/lib/year";

// The time zone picker (with every flag and time zone) loads on first open.
const LocationModal = dynamic(() => import("@/components/LocationModal"), {
  ssr: false,
});

interface YearProgressProps {
  /** The current year (UTC) when the page was rendered. */
  initialYear: number;
  /** Which view to open on; only "progress" offers other years. */
  variant?: LiveVariant;
  /** H1 for the focused views (the progress view names the chosen years). */
  heading?: string;
  /** Server-rendered answer shown under the H1 for the current year. */
  intro: string;
}

/** The live, client-side counter (the hero of the page). */
export default function YearProgress({
  initialYear,
  variant = "progress",
  heading,
  intro,
}: YearProgressProps) {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(
    null,
  );
  const [thisYear, setThisYear] = useState(initialYear);
  const [range, setRange] = useState<YearRange>({
    from: initialYear,
    to: initialYear,
  });
  const [modalLoaded, setModalLoaded] = useState(false);
  // False until the visitor (or a shared link) picks the years. A ref, so the
  // effects below see it immediately within the same render.
  const rangeChosen = useRef(false);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const initializeLocation = async () => {
      const location = await detectUserLocation();

      // Don't overwrite a location the visitor picked while detection ran.
      setCurrentLocation((current) => current ?? location);
    };

    initializeLocation();

    // A shared link like ?from=2026&to=2030 or ?year=2027 (home page only).
    const fromLink =
      variant === "progress" ? rangeFromSearch(window.location.search) : null;

    if (fromLink) {
      rangeChosen.current = true;
      setRange(fromLink);
    }
  }, []);

  // Until someone picks years, follow the current year where the visitor is.
  useEffect(() => {
    const timezone =
      currentLocation?.timezone ??
      Intl.DateTimeFormat().resolvedOptions().timeZone;
    const year = currentYear(new Date(), timezone);

    setThisYear(year);
    if (!rangeChosen.current) setRange({ from: year, to: year });
  }, [currentLocation]);

  useEffect(() => {
    if (!currentLocation) return;

    const updateProgress = () =>
      setProgressData(calculateProgress(currentLocation.timezone, range));

    updateProgress();
    const interval = setInterval(updateProgress, 1000);

    return () => clearInterval(interval);
  }, [currentLocation, range]);

  const handleRangeChange = (next: YearRange) => {
    rangeChosen.current = true;
    setRange(next);
    // Keep the address shareable without adding a history entry per click.
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${rangeToSearch(next, thisYear)}`,
    );
    window.dwm?.("change-range");
  };

  const handleLocationSelect = (location: LocationData) => {
    setCurrentLocation(location);
    window.dwm?.("change-timezone");
  };

  const openModal = () => {
    setModalLoaded(true);
    setIsModalOpen(true);
  };

  const isThisYear = range.from === initialYear && range.to === initialYear;
  const Display =
    variant === "days-left"
      ? DaysLeftDisplay
      : variant === "new-year"
        ? NewYearDisplay
        : variant === "week"
          ? WeekDisplay
          : ProgressDisplay;

  return (
    <div className="min-h-screen">
      <Navbar currentLocation={currentLocation} onLocationClick={openModal} />

      <section aria-labelledby="page-title" className="py-16 md:pt-16">
        {variant === "progress" ? (
          <h1
            className="mb-4 text-center text-xs md:text-sm font-semibold uppercase tracking-[0.25em] text-default-500"
            id="page-title"
          >
            {rangeLabel(range)} {range.from === range.to ? "Year " : ""}
            Progress
          </h1>
        ) : (
          <h1
            className="mb-4 text-center text-2xl md:text-4xl font-bold text-default-900"
            id="page-title"
          >
            {heading}
          </h1>
        )}

        {/* The answer in one sentence, in the server HTML, before any controls. */}
        {isThisYear ? (
          <p className="mx-auto mb-8 max-w-2xl px-4 text-center text-default-600 md:text-lg">
            {intro}
          </p>
        ) : (
          <div className="mb-8" />
        )}

        {variant === "progress" ? (
          <RangePicker
            range={range}
            thisYear={thisYear}
            onChange={handleRangeChange}
          />
        ) : null}

        {currentLocation && progressData ? (
          <Display location={currentLocation} progress={progressData} />
        ) : (
          <div
            aria-live="polite"
            className="flex min-h-[420px] items-center justify-center"
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Detecting your location...</p>
            </div>
          </div>
        )}
      </section>

      {modalLoaded ? (
        <LocationModal
          currentTimezone={currentLocation?.timezone ?? ""}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelectLocation={handleLocationSelect}
        />
      ) : null}
    </div>
  );
}
