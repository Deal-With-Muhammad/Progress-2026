"use client";

import type { LocationData, ProgressData } from "@/types";

import { useState, useEffect } from "react";

import ProgressDisplay from "@/components/ProgressDisplay";
import LocationModal from "@/components/LocationModal";
import Navbar from "@/components/navbar";
import { detectUserLocation, calculateProgress } from "@/lib/utils";
import { siteConfig } from "@/config/site";

/** The live, client-side counter (the hero of the page). */
export default function YearProgress() {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(
    null,
  );
  const [progressData, setProgressData] = useState<ProgressData>({
    percentage: 0,
    currentDate: "",
    daysElapsed: 0,
    daysRemaining: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const initializeLocation = async () => {
      const location = await detectUserLocation();

      // Don't overwrite a location the visitor picked while detection ran.
      setCurrentLocation((current) => current ?? location);
    };

    initializeLocation();
  }, []);

  useEffect(() => {
    if (!currentLocation) return;

    const updateProgress = () => {
      const progress = calculateProgress(currentLocation.timezone);

      setProgressData(progress);
    };

    updateProgress();
    const interval = setInterval(updateProgress, 1000);

    return () => clearInterval(interval);
  }, [currentLocation]);

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
          {siteConfig.year} Year Progress
        </h1>

        {currentLocation ? (
          <ProgressDisplay
            currentDate={progressData.currentDate}
            daysElapsed={progressData.daysElapsed}
            daysRemaining={progressData.daysRemaining}
            location={currentLocation}
            percentage={progressData.percentage}
            year={siteConfig.year}
          />
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
