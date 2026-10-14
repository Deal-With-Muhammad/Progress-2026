import { getTimezone } from 'countries-and-timezones';
import { countries as countriesList } from 'countries-list';
import type { LocationData, ProgressData } from '@/types';
import { getRangeStats, type YearRange } from '@/lib/year';

/**
 * Detects the user's location and correctly handles the country array in Timezone type.
 */
export async function detectUserLocation(): Promise<LocationData> {
  let userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  let countryCode = 'US';

  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    if (data.timezone) userTz = data.timezone;
    if (data.country_code) countryCode = data.country_code;

    const countryInfo = countriesList[countryCode as keyof typeof countriesList];
    
    return {
      name: `${data.city || 'Unknown City'}, ${countryInfo?.name || 'Unknown Country'}`,
      timezone: userTz,
      countryCode: countryCode,
      city: data.city || 'Unknown City',
      country: countryInfo?.name || 'Unknown Country'
    };
  } catch (error) {
    console.error('Geolocation failed:', error);
  }

  // FIX: Access tzInfo.countries[0] instead of tzInfo.country
  const tzInfo = getTimezone(userTz);
  const countryId = (tzInfo?.countries && tzInfo.countries.length > 0) 
    ? tzInfo.countries[0] 
    : 'US';
    
  const countryName = countriesList[countryId as keyof typeof countriesList]?.name || 'United States';
  const city = userTz.split('/').pop()?.replace(/_/g, ' ') || 'Unknown City';

  return {
    name: `${city}, ${countryName}`,
    timezone: userTz,
    countryCode: countryId,
    city: city,
    country: countryName
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
    currentDate: now.toLocaleString('en-US', {
      timeZone: timezone,
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
  };
}
