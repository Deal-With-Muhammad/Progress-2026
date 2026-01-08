import { getFlagEmoji } from "@/lib/utils";
import type { LocationData } from "@/types";
import * as Flags from "country-flag-icons/react/3x2";
interface ProgressDisplayProps {
  percentage: number;
  currentDate: string;
  location: LocationData;
  daysElapsed: number;
  daysRemaining: number;
}

export default function ProgressDisplay({
  percentage,
  currentDate,
  location,
  daysElapsed,
  daysRemaining,
}: ProgressDisplayProps) {
  const Flag = Flags[location.countryCode as keyof typeof Flags];
  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          {Flag && (
            <Flag className="sm:w-10 sm:h-7 w-8 h-6 rounded shadow-md" />
          )}
          <h2 className="text-xl md:text-3xl font-bold text-default-900">
            {location.name}
          </h2>
        </div>
        <p className="text-default-600 text-sm md:text-base">{currentDate}</p>
      </div>

      <div className=" rounded-2xl shadow-xl p-6 md:p-8 mb-6">
        <div className="text-center mb-6">
          <div className="text-5xl md:text-7xl font-bold text-primary mb-2">
            {percentage}%
          </div>
          <p className="text-default-500 text-lg md:text-xl">
            of 2026 completed
          </p>
        </div>

        <div className="relative h-8 bg-default-200 rounded-full overflow-hidden mb-6">
          <div
            className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-default-50 rounded-xl p-4 text-center">
            <div className="text-3xl md:text-4xl font-bold text-default-900">
              {daysElapsed}
            </div>
            <div className="text-xs md:text-base text-default-600 mt-1">
              Days Elapsed
            </div>
          </div>
          <div className="bg-default-50 rounded-xl p-4 text-center">
            <div className="text-3xl md:text-4xl font-bold text-default-900">
              {daysRemaining}
            </div>
            <div className="text-xs md:text-base text-default-600 mt-1">
              Days Remaining
            </div>
          </div>
        </div>
      </div>

      <div className="bg-default-50  rounded-xl p-4 text-center">
        <p className="text-sm text-default-700">
          Time is constantly moving. Make every moment count! 🚀
        </p>
      </div>
    </div>
  );
}
