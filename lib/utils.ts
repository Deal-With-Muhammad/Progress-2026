import { getTimezone } from 'countries-and-timezones';
import { countries as countriesList } from 'countries-list';
import type { LocationData, ProgressData } from '@/types';

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
 * Calculates accurate progress for 2026.
 * Fixes the "Karachi time" issue by using Intl to extract exact local parts.
 */
export function calculateProgress(timezone: string): ProgressData {
  const targetYear = 2026;
  const now = new Date();

  // Extract precise local time parts for the target timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false
  });
  
  const parts = formatter.formatToParts(now);
  const p: any = {};
  parts.forEach(part => p[part.type] = part.value);

  // Construct a date object that represents "Local Now"
  const localNow = new Date(
    parseInt(p.year), 
    parseInt(p.month) - 1, 
    parseInt(p.day), 
    parseInt(p.hour), 
    parseInt(p.minute), 
    parseInt(p.second)
  );
  
  const yearStart = new Date(targetYear, 0, 1, 0, 0, 0);
  const yearEnd = new Date(targetYear, 11, 31, 23, 59, 59);
  
  const totalMs = yearEnd.getTime() - yearStart.getTime();
  const elapsedMs = localNow.getTime() - yearStart.getTime();
  
  const progress = Math.max(0, Math.min(100, (elapsedMs / totalMs) * 100));

  return {
    percentage: parseFloat(progress.toFixed(4)),
    daysElapsed: Math.floor(elapsedMs / (1000 * 60 * 60 * 24)),
    daysRemaining: Math.ceil((yearEnd.getTime() - localNow.getTime()) / (1000 * 60 * 60 * 24)),
    currentDate: now.toLocaleString('en-US', {
      timeZone: timezone,
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
  };
}