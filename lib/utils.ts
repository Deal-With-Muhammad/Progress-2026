import type { LocationData, ProgressData } from "@/types";

import { getRangeStats, wallClockMs, type YearRange } from "@/lib/year";

/** English country name for an ISO 3166 code, from the browser's own data. */
export function countryName(code: string): string | undefined {
  try {
    const name = new Intl.DisplayNames(["en"], { type: "region" }).of(code);

    return name && name !== code ? name : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Detects the visitor's city and time zone from their IP address, falling back
 * to the browser's time zone (and the country that time zone belongs to).
 */
export async function detectUserLocation(): Promise<LocationData> {
  let userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();

    if (data.timezone) userTz = data.timezone;
    const countryCode: string = data.country_code || "US";
    const country = countryName(countryCode) || "Unknown Country";

    return {
      name: `${data.city || "Unknown City"}, ${country}`,
      timezone: userTz,
      countryCode,
      city: data.city || "Unknown City",
      country,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Geolocation failed:", error);
  }

  // The time zone database is only needed for this fallback, so load it lazily.
  const { getTimezone } = await import("countries-and-timezones");
  const tzInfo = getTimezone(userTz);
  const countryId =
    tzInfo?.countries && tzInfo.countries.length > 0
      ? tzInfo.countries[0]
      : "US";
  const country = countryName(countryId) || "United States";
  const city = userTz.split("/").pop()?.replace(/_/g, " ") || "Unknown City";

  return {
    name: `${city}, ${country}`,
    timezone: userTz,
    countryCode: countryId,
    city,
    country,
  };
}

/**
 * Live progress through a range of years in the given time zone. Uses the
 * wall-clock time in that zone, so the browser's own time zone and
 * daylight-saving changes don't skew the result.
 */
export function calculateProgress(
  timezone: string,
  range: YearRange,
): ProgressData {
  const now = new Date();

  return {
    ...getRangeStats(now, range, timezone),
    wallMs: wallClockMs(now, timezone),
    currentDate: now.toLocaleString("en-US", {
      timeZone: timezone,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  };
}
