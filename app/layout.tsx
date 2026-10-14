import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import Script from "next/script";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { VisitorCounter } from "@/components/visitor-counter";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: siteConfig.keywords,
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
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

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
              <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 text-center">
                <p className="text-sm text-default-600">
                  Built by{" "}
                  <Link
                    className="text-sm text-primary"
                    href={siteConfig.author.url}
                    rel="noopener"
                    target="_blank"
                    title="Muhammad Ahmad's portfolio"
                  >
                    {siteConfig.author.name}
                  </Link>{" "}
                  — web &amp; mobile app developer in {siteConfig.author.city},{" "}
                  {siteConfig.author.country}
                </p>
                <nav
                  aria-label="More from Muhammad Ahmad"
                  className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1"
                >
                  <Link
                    className={footerLinkClass}
                    href={siteConfig.links.caseStudy}
                    rel="noopener"
                    target="_blank"
                  >
                    How it was built
                  </Link>
                  <Link
                    className={footerLinkClass}
                    href={siteConfig.links.downloader}
                    rel="noopener"
                    target="_blank"
                    title="DWM Downloader: free video downloader"
                  >
                    DWM Downloader
                  </Link>
                  <Link
                    className={footerLinkClass}
                    href={siteConfig.links.compressor}
                    rel="noopener"
                    target="_blank"
                    title="DWM Compressor: compress PDFs, images and video in your browser"
                  >
                    DWM Compressor
                  </Link>
                  <Link
                    className={footerLinkClass}
                    href={siteConfig.links.github}
                    rel="noopener"
                    target="_blank"
                  >
                    GitHub
                  </Link>
                </nav>
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
      </body>
    </html>
  );
}
