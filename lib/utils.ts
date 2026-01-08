import { getTimezone, getCountry } from 'countries-and-timezones';
import { countries } from 'countries-list';
import type { LocationData, ProgressData } from '@/types';

/**
 * Detects the user's location based on their system timezone or IP fallback.
 * No static list required!
 */
export async function detectUserLocation(): Promise<LocationData> {
  let userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  let countryCode = 'US'; // Default fallback

  try {
    // 1. Try IP-based detection for more accuracy (city/country)
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    if (data.timezone) userTz = data.timezone;
    if (data.country_code) countryCode = data.country_code;

    const countryInfo = countries[countryCode as keyof typeof countries];
    
    return {
      name: `${data.city || 'Unknown City'}, ${countryInfo?.name || 'Unknown Country'}`,
      timezone: userTz,
      countryCode: countryCode,
      city: data.city || 'Unknown City',
      country: countryInfo?.name || 'Unknown Country'
    };
  } catch (error) {
    console.error('Geolocation detection failed, falling back to system timezone:', error);
  }

  // 2. Fallback to system timezone info if API fails
  const tzInfo = getTimezone(userTz);
  const countryId = tzInfo?.country || 'US';
  const countryName = countries[countryId as keyof typeof countries]?.name || 'United States';
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
 * Calculates percentage of the current year (2026) completed
 */
export function calculateProgress(timezone: string): ProgressData {
  const targetYear = 2026;

  // Get current time in the SPECIFIC timezone correctly
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false
  });
  
  const parts = formatter.formatToParts(now);
  const p: any = {};
  parts.forEach(part => p[part.type] = part.value);

  // This creates a Date object representing the time IN that city
  const localNow = new Date(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  
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

/**
 * Converts ISO Country Code to Emoji Flag
 */
export function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  
  return countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
    .map(cp => String.fromCodePoint(cp))
    .join('');
}