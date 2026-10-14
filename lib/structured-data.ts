import type { Faq } from "@/lib/year-content";

import { siteConfig } from "@/config/site";

const { author, url } = siteConfig;

const person = {
  "@type": "Person",
  "@id": author.id,
  name: author.name,
  url: author.url,
  jobTitle: author.jobTitle,
  address: {
    "@type": "PostalAddress",
    addressLocality: author.city,
    addressCountry: author.countryCode,
  },
  sameAs: author.sameAs,
};

/** JSON-LD graph for the home page: WebSite, WebApplication and FAQPage. */
export function buildJsonLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url: `${url}/`,
        name: siteConfig.name,
        alternateName: `${siteConfig.year} Year Progress`,
        description: siteConfig.description,
        inLanguage: "en",
        publisher: { "@id": author.id },
      },
      {
        "@type": "WebApplication",
        "@id": `${url}/#app`,
        name: siteConfig.name,
        alternateName: [
          `${siteConfig.year} Year Progress Bar`,
          `Year Progress ${siteConfig.year}`,
        ],
        url: `${url}/`,
        description: `A free web app that shows live how much of ${siteConfig.year} has passed in your own time zone, as a percentage updated every second, with the days elapsed and the days left until ${siteConfig.year + 1}.`,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any (web browser)",
        browserRequirements: "Requires JavaScript",
        inLanguage: "en",
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        featureList: [
          `Live percentage of ${siteConfig.year} completed, updated every second`,
          "Automatic time zone detection, or pick any city or time zone",
          "Days elapsed and days remaining in the year",
          "Light and dark themes",
        ],
        image: `${url}/opengraph-image`,
        author: person,
        creator: { "@id": author.id },
        publisher: { "@id": author.id },
        isPartOf: { "@id": `${url}/#website` },
        subjectOf: {
          "@type": "CreativeWork",
          name: `${siteConfig.name} case study`,
          url: siteConfig.links.caseStudy,
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}/#faq`,
        url: `${url}/`,
        isPartOf: { "@id": `${url}/#website` },
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };
}

/** Serialise JSON-LD for a <script> tag, escaping "<" so it can't close the tag. */
export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
