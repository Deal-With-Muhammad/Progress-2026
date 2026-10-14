export type SiteConfig = typeof siteConfig;

/** The year this site tracks. Bump it (and the copy that names it) for a new year. */
const year = 2026;

export const siteConfig = {
  name: `Progress ${year}`,
  year,
  url: "https://progress.dealwithmuhammad.com",
  title: `${year} Year Progress Bar: How Much of ${year} Has Passed?`,
  description: `See live how much of ${year} has passed in your time zone: the exact percentage of the year, days elapsed and days left until ${year + 1}. Free, no sign-up.`,
  keywords: [
    "year progress",
    "year progress bar",
    `${year} progress`,
    `${year} progress bar`,
    `how much of ${year} has passed`,
    "what percentage of the year is over",
    "percentage of the year passed",
    `days left in ${year}`,
    "days left in the year",
    `how many days until ${year + 1}`,
    `days until ${year + 1}`,
    `${year} countdown`,
    "year progress percentage",
    "day of the year",
  ],

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
};
