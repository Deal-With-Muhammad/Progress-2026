import { ImageResponse } from "next/og";

import { siteConfig, siteCopy, siteYear } from "@/config/site";
import { getYearStats, isoWeekOf, isoWeeksInYear } from "@/lib/year";
import { formatPercent } from "@/lib/year-content";

export const ogSize = { width: 1200, height: 630 };

/** Alt text for a page's share image. */
export const ogAlt = (what: string) =>
  `${what}, from the ${siteCopy().name} year progress bar by Muhammad Ahmad`;

export type OgVariant = "progress" | "days-left" | "new-year" | "week";

// HeroUI dark theme colours, to match the site's default look.
const colors = {
  background: "#000000",
  foreground: "#ffffff",
  muted: "#a1a1aa",
  subtle: "#d4d4d8",
  track: "#27272a",
  primary: "#1f6fe0",
};

/** Fetch Inter from Google Fonts; returns null (default font) if it fails. */
async function loadInter(weight: 400 | 700, text: string) {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await fetch(cssUrl, { signal: AbortSignal.timeout(4000) }).then(
      (res) => (res.ok ? res.text() : ""),
    );
    const fontUrl = css.match(
      /src: url\((.+?)\) format\('(opentype|truetype)'\)/,
    )?.[1];

    if (!fontUrl) return null;

    const res = await fetch(fontUrl, { signal: AbortSignal.timeout(4000) });

    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

/** Branded share image with live numbers at request time (UTC). */
export async function renderOgImage(variant: OgVariant = "progress") {
  const now = new Date();
  const year = siteYear(now);
  const stats = getYearStats(now, year, "UTC");
  const barWidth = Math.min(100, Math.max(0, stats.percentage));
  const asOf = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(now);
  const daysLeft = `${stats.daysRemaining} ${stats.daysRemaining === 1 ? "day" : "days"}`;
  const week = isoWeekOf(now.getTime());

  const { title, percent, caption, detail } = {
    progress: {
      title: `How much of ${year} has passed?`,
      percent: formatPercent(stats.percentage),
      caption: `of ${year} completed`,
      detail: `Day ${stats.dayOfYear} of ${stats.daysInYear} · ${daysLeft} left`,
    },
    "days-left": {
      title: `How many days are left in ${year}?`,
      percent: String(stats.daysRemaining),
      caption: stats.daysRemaining === 1 ? "day left" : "days left",
      detail: `${formatPercent(100 - stats.percentage)} of ${year} to go`,
    },
    "new-year": {
      title: `How many days until New Year ${year + 1}?`,
      percent: String(stats.daysRemaining),
      caption: `${stats.daysRemaining === 1 ? "day" : "days"} to go`,
      detail: `${formatPercent(stats.percentage)} of ${year} completed`,
    },
    week: {
      title: "What week is it?",
      percent: `Week ${week.week}`,
      caption: `of ${isoWeeksInYear(week.year)} in ${week.year}`,
      detail: `Day ${stats.dayOfYear} of ${stats.daysInYear} · ISO 8601 weeks`,
    },
  }[variant];

  const brand = siteCopy(year).name.toUpperCase();
  const host = new URL(siteConfig.url).host;
  const byline = "by Muhammad Ahmad · dealwithmuhammad.com";
  const asOfText = `as of ${asOf}, UTC`;

  const allText = [
    title,
    brand,
    host,
    byline,
    asOfText,
    caption,
    percent,
    detail,
  ].join("");
  const [regular, bold] = await Promise.all([
    loadInter(400, allText),
    loadInter(700, allText),
  ]);
  const fonts: { name: string; data: ArrayBuffer; weight: 400 | 700 }[] = [];

  if (regular) fonts.push({ name: "Inter", data: regular, weight: 400 });
  if (bold) fonts.push({ name: "Inter", data: bold, weight: 700 });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 72px",
          background: colors.background,
          color: colors.foreground,
          fontFamily: fonts.length ? "Inter" : undefined,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 26,
            color: colors.muted,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <svg
              height="44"
              style={{ marginRight: 18 }}
              viewBox="0 0 512 512"
              width="44"
            >
              <rect fill="#1f6fe0" height="512" rx="112" width="512" />
              <g transform="translate(72 72) scale(.72)">
                <path
                  d="M160 96H160A36 36 0 0 1 196 132V380A36 36 0 0 1 160 416H160A36 36 0 0 1 124 380V132A36 36 0 0 1 160 96Z"
                  fill="#ffffff"
                  fillRule="evenodd"
                />
                <path
                  d="M196 132H268A92 92 0 0 1 268 316H196"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="72"
                  opacity={0.3}
                />
                <path
                  d="M196 132H268A92 92 0 0 1 344 270"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="72"
                />
              </g>
            </svg>
            <span style={{ fontWeight: 700, letterSpacing: 5 }}>{brand}</span>
          </div>
          <span>{host}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>
            {title}
          </div>
          <div
            style={{ display: "flex", alignItems: "flex-end", marginTop: 24 }}
          >
            <span
              style={{
                fontSize: 148,
                fontWeight: 700,
                lineHeight: 1,
                color: colors.primary,
                letterSpacing: -4,
              }}
            >
              {percent}
            </span>
            <span
              style={{
                fontSize: 36,
                color: colors.muted,
                marginLeft: 24,
                marginBottom: 16,
              }}
            >
              {caption}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 32,
              width: "100%",
              height: 36,
              borderRadius: 18,
              background: colors.track,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${barWidth}%`,
                height: "100%",
                borderRadius: 18,
                background: colors.primary,
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 18,
              fontSize: 28,
              color: colors.subtle,
            }}
          >
            <span>{detail}</span>
            <span style={{ color: colors.muted }}>{asOfText}</span>
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 26, color: colors.muted }}>
          {byline}
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: fonts.length ? fonts : undefined,
      // The default is "immutable, max-age=1 year"; the image changes hourly.
      headers: {
        "cache-control":
          "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
