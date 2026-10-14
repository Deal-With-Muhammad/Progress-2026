"use client";

import type { LocationData, ProgressData } from "@/types";

import { useState, useEffect, useRef } from "react";

import ProgressDisplay from "@/components/ProgressDisplay";
import LocationModal from "@/components/LocationModal";
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
import { siteConfig } from "@/config/site";

/** The live, client-side counter (the hero of the page). */
export default function YearProgress() {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(
    null,
  );
  const [thisYear, setThisYear] = useState(siteConfig.year);
  const [range, setRange] = useState<YearRange>({
    from: siteConfig.year,
    to: siteConfig.year,
  });
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

    // A shared link like ?from=2026&to=2030 or ?year=2027.
    const fromLink = rangeFromSearch(window.location.search);

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

  return (
    <div className="min-h-screen">
      <Navbar
        currentLocation={currentLocation}
        onLocationClick={() => setIsModalOpen(true)}
      />

      <section aria-labelledby="page-title" className="py-16 md:pt-16">
        <h1
          className="mb-6 text-center text-xs md:text-sm font-semibold uppercase tracking-[0.25em] text-default-500"
          id="page-title"
        >
          {rangeLabel(range)} {range.from === range.to ? "Year " : ""}Progress
        </h1>

        <RangePicker
          range={range}
          thisYear={thisYear}
          onChange={handleRangeChange}
        />

        {currentLocation && progressData ? (
          <ProgressDisplay location={currentLocation} progress={progressData} />
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

      <LocationModal
        currentTimezone={currentLocation?.timezone ?? ""}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectLocation={handleLocationSelect}
      />
    </div>
  );
}
