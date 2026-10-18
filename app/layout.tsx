import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import Script from "next/script";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { Providers } from "./providers";

import {
  CONTENT_UPDATED,
  CONTENT_UPDATED_LABEL,
  siteConfig,
  siteCopy,
  siteYear,
  yearPages,
} from "@/config/site";
import { fontSans } from "@/config/fonts";
import { VisitorCounter } from "@/components/visitor-counter";

// Computed per render (the pages revalidate hourly), so the year in the brand
// and titles rolls over on 1 January without a redeploy.
export function generateMetadata(): Metadata {
  const copy = siteCopy(siteYear());

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: copy.title,
      template: `%s · ${copy.name}`,
    },
    description: copy.description,
    applicationName: copy.name,
    keywords: copy.keywords,
    authors: [{ name: siteConfig.author.name, url: siteConfig.author.url }],
    creator: siteConfig.author.name,
    publisher: siteConfig.author.name,
    category: "utilities",
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      url: "/",
      siteName: copy.name,
      title: copy.title,
      description: copy.description,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description,
    },
    // The iOS home-screen icon is app/apple-icon.png.
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "48x48" },
        { url: "/icon.svg", type: "image/svg+xml" },
      ],
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

const footerLinkClass =
  "text-sm text-default-500 hover:text-primary transition-colors";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex flex-col">
            <main className="container mx-auto max-w-7xl  px-6 flex-grow">
              {children}
            </main>
            <footer className="w-full border-t border-default-100 px-6 py-8">
              <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
                <nav
                  aria-label="Year tools on this site"
                  className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1"
                >
                  <Link className={footerLinkClass} href="/">
                    Year progress bar
                  </Link>
                  {yearPages.map((page) => (
                    <Link
                      key={page.path}
                      className={footerLinkClass}
                      href={page.path}
                    >
                      {page.label}
                    </Link>
                  ))}
                </nav>
                <nav
                  aria-labelledby="more-tools"
                  className="flex flex-col items-center gap-1"
                >
                  <h2
                    className="text-xs font-semibold uppercase tracking-[0.2em] text-default-400"
                    id="more-tools"
                  >
                    More free tools
                  </h2>
                  <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                    {siteConfig.moreTools.map((tool) => (
                      <li key={tool.href}>
                        <Link
                          className={footerLinkClass}
                          href={tool.href}
                          rel="noopener"
                          target="_blank"
                        >
                          {tool.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <p className="text-sm text-default-600">
                  Built by{" "}
                  <Link
                    className="text-sm text-primary"
                    href={siteConfig.author.url}
                    rel="noopener"
                    target="_blank"
                  >
                    {siteConfig.author.name}, web &amp; mobile app developer
                  </Link>{" "}
                  in {siteConfig.author.city}, {siteConfig.author.country}
                  {" · "}
                  <Link
                    className={footerLinkClass}
                    href={siteConfig.links.caseStudy}
                    rel="noopener"
                    target="_blank"
                  >
                    How this year progress bar was built
                  </Link>
                  {" · "}
                  <Link
                    className={footerLinkClass}
                    href={siteConfig.links.github}
                    rel="noopener"
                    target="_blank"
                  >
                    GitHub
                  </Link>
                </p>
                <p className="text-xs text-default-500">
                  Updated{" "}
                  <time dateTime={CONTENT_UPDATED}>
                    {CONTENT_UPDATED_LABEL}
                  </time>
                </p>
                <VisitorCounter />
              </div>
            </footer>
          </div>
        </Providers>
        <Script
          data-site="progress"
          src="https://www.dealwithmuhammad.com/dwm.js"
          strategy="afterInteractive"
        />
        {/* The 9-dot app launcher shared by every DWM tool. */}
        <Script
          src="https://www.dealwithmuhammad.com/dwm-apps.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
