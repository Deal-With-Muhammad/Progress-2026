"use client";

import { useState, useEffect } from "react";
import ProgressDisplay from "@/components/ProgressDisplay";
import LocationModal from "@/components/LocationModal";
import { detectUserLocation, calculateProgress } from "@/lib/utils";
import type { LocationData, ProgressData } from "@/types";
import Navbar from "@/components/navbar";

export default function Home() {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(
    null
  );
  const [progressData, setProgressData] = useState<ProgressData>({
    percentage: 0,
    currentDate: "",
    daysElapsed: 0,
    daysRemaining: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    const initializeLocation = async () => {
      const location = await detectUserLocation();
      setCurrentLocation(location);
      setIsDetecting(false);
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
  };

  if (isDetecting || !currentLocation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Detecting your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar
        onLocationClick={() => setIsModalOpen(true)}
        currentLocation={currentLocation}
      />

      <main
        className="py-4 md:pt-16
      "
      >
        <ProgressDisplay
          percentage={progressData.percentage}
          currentDate={progressData.currentDate}
          location={currentLocation}
          daysElapsed={progressData.daysElapsed}
          daysRemaining={progressData.daysRemaining}
        />
      </main>

      <LocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectLocation={handleLocationSelect}
        currentTimezone={currentLocation.timezone}
      />
    </div>
  );
}
