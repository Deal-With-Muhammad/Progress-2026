import type { Faq } from "@/lib/year-content";

import { CONTENT_UPDATED, siteConfig, siteCopy } from "@/config/site";

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

export interface JsonLdPage {
  /** "/" for the home page, or e.g. "/days-left-in-the-year". */
  path: string;
  /** Short page name, used for the web app and the breadcrumb. */
  name: string;
  description: string;
  featureList: string[];
  faqs: Faq[];
}

/**
 * JSON-LD graph for a page: WebSite, WebApplication, FAQPage and, below the
 * home page, a WebPage with a BreadcrumbList.
 */
export function buildJsonLd(year: number, page: JsonLdPage) {
  const copy = siteCopy(year);
  const pageUrl = `${url}${page.path === "/" ? "/" : page.path}`;
  const isHome = page.path === "/";

  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebSite",
      "@id": `${url}/#website`,
      url: `${url}/`,
      name: copy.name,
      alternateName: [`${year} Year Progress`, "Year Progress Bar"],
      description: copy.description,
      inLanguage: "en",
      publisher: { "@id": author.id },
    },
    {
      "@type": "WebApplication",
      "@id": `${pageUrl}#app`,
      name: isHome ? copy.name : page.name,
      ...(isHome
        ? {
            alternateName: [
              `${year} Year Progress Bar`,
              `Year Progress ${year}`,
            ],
          }
        : {}),
      url: pageUrl,
      description: page.description,
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
      featureList: page.featureList,
      image: `${pageUrl === `${url}/` ? url : pageUrl}/opengraph-image`,
      dateModified: CONTENT_UPDATED,
      author: person,
      creator: { "@id": author.id },
      publisher: { "@id": author.id },
      isPartOf: { "@id": `${url}/#website` },
      subjectOf: {
        "@type": "CreativeWork",
        name: "Progress year tracker case study",
        url: siteConfig.links.caseStudy,
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      url: pageUrl,
      dateModified: CONTENT_UPDATED,
      isPartOf: { "@id": `${url}/#website` },
      mainEntity: page.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ];

  if (!isHome) {
    graph.push(
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: page.name,
        description: page.description,
        inLanguage: "en",
        dateModified: CONTENT_UPDATED,
        isPartOf: { "@id": `${url}/#website` },
        mainEntity: { "@id": `${pageUrl}#app` },
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
        author: { "@id": author.id },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Year progress bar",
            item: `${url}/`,
          },
          { "@type": "ListItem", position: 2, name: page.name, item: pageUrl },
        ],
      },
    );
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

/** Serialise JSON-LD for a <script> tag, escaping "<" so it can't close the tag. */
export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
