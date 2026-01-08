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

export interface ProgressData {
  percentage: number;
  currentDate: string;
  daysElapsed: number;
  daysRemaining: number;
}
