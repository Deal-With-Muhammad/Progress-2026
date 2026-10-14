import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";
import { getYearStats } from "@/lib/year";
import { formatPercent } from "@/lib/year-content";

export const ogSize = { width: 1200, height: 630 };
export const ogAlt = `${siteConfig.name}: a progress bar showing how much of ${siteConfig.year} has passed, by Muhammad Ahmad`;

// HeroUI dark theme colours, to match the site's default look.
const colors = {
  background: "#000000",
  foreground: "#ffffff",
  muted: "#a1a1aa",
  subtle: "#d4d4d8",
  track: "#27272a",
  primary: "#006FEE",
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

/** Branded share image with the share of the year passed at request time (UTC). */
export async function renderOgImage() {
  const now = new Date();
  const { year } = siteConfig;
  const stats = getYearStats(now, year, "UTC");
  const percent =
    stats.status === "complete"
      ? "100%"
      : stats.status === "upcoming"
        ? "0%"
        : formatPercent(stats.percentage);
  const barWidth = Math.min(100, Math.max(0, stats.percentage));
  const asOf = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(now);

  const detail =
    stats.status === "in-progress"
      ? `Day ${stats.dayOfYear} of ${stats.daysInYear} · ${stats.daysRemaining} ${stats.daysRemaining === 1 ? "day" : "days"} left`
      : stats.status === "upcoming"
        ? `${year} starts on 1 January`
        : `${year} is complete`;

  const title = `How much of ${year} has passed?`;
  const brand = siteConfig.name.toUpperCase();
  const host = new URL(siteConfig.url).host;
  const byline = "by Muhammad Ahmad · dealwithmuhammad.com";
  const asOfText = `as of ${asOf}, UTC`;
  const caption = `of ${year} completed`;

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
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                background: colors.primary,
                marginRight: 16,
              }}
            />
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
