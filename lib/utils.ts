import { TIMEZONES } from './timezones';
import type { LocationData, ProgressData } from '@/types';

export async function detectUserLocation(): Promise<LocationData> {
  // Try to get user's timezone
  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Try to match exact timezone
  const exactMatch = TIMEZONES.find(tz => tz.timezone === userTz);
  if (exactMatch) {
    return {
      name: `${exactMatch.city}, ${exactMatch.country}`,
      timezone: exactMatch.timezone,
      countryCode: exactMatch.countryCode,
      city: exactMatch.city,
      country: exactMatch.country
    };
  }

  // Try IP-based geolocation as fallback
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    if (data.timezone) {
      const match = TIMEZONES.find(tz => tz.timezone === data.timezone);
      if (match) {
        return {
          name: `${match.city}, ${match.country}`,
          timezone: match.timezone,
          countryCode: match.countryCode,
          city: match.city,
          country: match.country
        };
      }
    }

    // Fallback to country code match
    if (data.country_code) {
      const countryMatch = TIMEZONES.find(tz => tz.countryCode === data.country_code);
      if (countryMatch) {
        return {
          name: `${countryMatch.city}, ${countryMatch.country}`,
          timezone: countryMatch.timezone,
          countryCode: countryMatch.countryCode,
          city: countryMatch.city,
          country: countryMatch.country
        };
      }
    }
  } catch (error) {
    console.error('Geolocation detection failed:', error);
  }

  // Ultimate fallback to first timezone (New York)
  const fallback = TIMEZONES[0];
  return {
    name: `${fallback.city}, ${fallback.country}`,
    timezone: fallback.timezone,
    countryCode: fallback.countryCode,
    city: fallback.city,
    country: fallback.country
  };
}

export function calculateProgress(timezone: string): ProgressData {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
  const yearStart = new Date(new Date('2026-01-01T00:00:00').toLocaleString('en-US', { timeZone: timezone }));
  const yearEnd = new Date(new Date('2026-12-31T23:59:59').toLocaleString('en-US', { timeZone: timezone }));
  
  const totalMs = yearEnd.getTime() - yearStart.getTime();
  const elapsedMs = now.getTime() - yearStart.getTime();
  const progress = Math.max(0, Math.min(100, (elapsedMs / totalMs) * 100));
  
  const elapsed = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
  const remaining = Math.ceil((yearEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    percentage: parseFloat(progress.toFixed(2)),
    daysElapsed: Math.max(0, elapsed),
    daysRemaining: Math.max(0, remaining),
    currentDate: now.toLocaleString('en-US', {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  };
}

export function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
