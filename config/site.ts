export type SiteConfig = typeof siteConfig;

/**
 * The calendar year the site tracks: whatever year it is now in UTC. Pages
 * that show it revalidate hourly, so the brand, titles and copy roll over to
 * the new year within an hour of midnight UTC on 1 January.
 */
export function siteYear(now: Date = new Date()): number {
  return now.getUTCFullYear();
}

/** Date the page copy was last reviewed (for dateModified and the sitemap). */
export const CONTENT_UPDATED = "2026-10-16";
/** The same date for people: shown as "Updated October 2026". */
export const CONTENT_UPDATED_LABEL = "October 2026";

/** Year-dependent names and copy for the home page. */
export function siteCopy(year: number = siteYear()) {
  return {
    name: `Progress ${year}`,
    title: `${year} Year Progress Bar: What Percent of the Year Has Passed?`,
    description: `A live year progress bar: see what percent of ${year} has passed and how much of the year is left in your time zone, with the day of the year, week number and days left until ${year + 1}. Free, no sign-up, no ads.`,
    keywords: [
      "year progress",
      "year progress bar",
      `${year} progress`,
      `${year} progress bar`,
      `how much of ${year} has passed`,
      "how much of the year is left",
      "what percent of the year has passed",
      "percentage of the year passed",
      `days left in ${year}`,
      "days left in the year",
      `days until ${year + 1}`,
      "days until new year",
      "week number today",
      "day of the year",
    ],
  };
}

export const siteConfig = {
  url: "https://progress.dealwithmuhammad.com",

  author: {
    id: "https://www.dealwithmuhammad.com/#person",
    name: "Muhammad Ahmad",
    url: "https://www.dealwithmuhammad.com",
    jobTitle: "Web & Mobile App Developer",
    city: "Kuala Lumpur",
    country: "Malaysia",
    countryCode: "MY",
    email: "me@dealwithmuhammad.com",
    whatsapp: "https://wa.me/601139865270",
    sameAs: [
      "https://github.com/Deal-With-Muhammad",
      "https://www.linkedin.com/in/muhammad-ahmad-7009b8248/",
      "https://www.instagram.com/dealwithmuhammad/",
    ],
  },

  links: {
    github: "https://github.com/Deal-With-Muhammad",
    sponsor: "https://patreon.com/jrgarciadev",
    portfolio: "https://www.dealwithmuhammad.com",
    caseStudy: "https://www.dealwithmuhammad.com/work/progress-2026",
    stats: "https://www.dealwithmuhammad.com/stats/progress",
    downloader: "https://downloader.dealwithmuhammad.com",
    compressor: "https://compressor.dealwithmuhammad.com",
    qr: "https://qr.dealwithmuhammad.com",
    bgremove: "https://bgremove.dealwithmuhammad.com",
    ip: "https://ip.dealwithmuhammad.com",
    emailcheck: "https://emailcheck.dealwithmuhammad.com",
  },

  /** Other free tools by the same author, with descriptive link text. */
  moreTools: [
    {
      label: "Free video downloader",
      href: "https://downloader.dealwithmuhammad.com",
    },
    {
      label: "PDF & image compressor",
      href: "https://compressor.dealwithmuhammad.com",
    },
    { label: "QR code generator", href: "https://qr.dealwithmuhammad.com" },
    {
      label: "Background remover",
      href: "https://bgremove.dealwithmuhammad.com",
    },
    { label: "What is my IP", href: "https://ip.dealwithmuhammad.com" },
    { label: "Email checker", href: "https://emailcheck.dealwithmuhammad.com" },
  ],
};

/** The focused pages on this site, each built around one question. */
export const yearPages = [
  {
    path: "/days-left-in-the-year",
    label: "Days left in the year",
    blurb: "A live count of the days, weeks, weekdays and hours left.",
  },
  {
    path: "/days-until-new-year",
    label: "Days until New Year",
    blurb: "A countdown to midnight on 1 January in your time zone.",
  },
  {
    path: "/what-week-is-it",
    label: "What week is it?",
    blurb: "Today's ISO week number, with every week of the year listed.",
  },
] as const;

export type YearPagePath = (typeof yearPages)[number]["path"];
