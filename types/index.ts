import type { RangeStats } from "@/lib/year";

import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};
export interface LocationData {
  name: string;
  timezone: string;
  countryCode: string;
  city: string;
  country: string;
}

/** Live progress through the selected range, plus the local date and time. */
export type ProgressData = RangeStats & {
  currentDate: string;
  /** Wall-clock time in the selected time zone, as a UTC timestamp. */
  wallMs: number;
};
