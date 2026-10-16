# Progress 2026

A live year progress bar: what percent of the current year has passed in your own time zone, updated every second, with the day of the year, ISO week number and days left until New Year. Focused pages: `/days-left-in-the-year`, `/days-until-new-year` and `/what-week-is-it`.

**Live:** https://progress.dealwithmuhammad.com · **Case study:** https://www.dealwithmuhammad.com/work/progress-2026

Built by [Muhammad Ahmad](https://www.dealwithmuhammad.com), web & mobile app developer in Kuala Lumpur, Malaysia.

## How it works

- The visitor's time zone is detected from their IP address (falling back to the browser's time zone) and can be changed from the Location menu.
- Progress = time since midnight on 1 January in that time zone ÷ length of the year (365 days in 2026, 366 in a leap year). The maths lives in `lib/year.ts`. The tracked year is the current UTC year (`siteYear()` in `config/site.ts`); pages revalidate hourly, so the brand ("Progress <year>"), titles and copy roll over on 1 January without a redeploy.
- Under each H1, a one-sentence answer, and below the live counter a summary, how-to, table and FAQ (all server-rendered, revalidated hourly, as of the UTC date; built in `lib/year-content.ts`) give people, crawlers and AI assistants real numbers without running JavaScript.
- Country flags are served as static SVGs from `/flags/XX.svg` (`app/flags`), and the time zone picker loads on first open, to keep the page's JavaScript small.

## SEO and analytics

- Metadata in `app/layout.tsx` and each page (`lib/page-meta.ts`); share images with today's numbers from `lib/og-image.tsx` (an `opengraph-image.tsx` per page).
- JSON-LD (`WebSite`, `WebApplication`, `FAQPage`, plus `WebPage` and `BreadcrumbList` on the focused pages), built by `lib/structured-data.ts`. Bump `CONTENT_UPDATED` in `config/site.ts` (and the sitemap dates) when you change the copy.
- `app/robots.ts` (allows search and AI crawlers), `app/sitemap.ts`, `app/manifest.ts` and `app/llms.txt/route.ts`.
- Visitor analytics via `https://www.dealwithmuhammad.com/dwm.js` (`data-site="progress"`); the footer shows the public visitor count from `/api/views?site=progress`. Changing the time zone sends a `change-timezone` event.

## Tech

[Next.js 15](https://nextjs.org/) (App Router), [HeroUI](https://heroui.com/), [Tailwind CSS 4](https://tailwindcss.com/) and TypeScript.

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

## License

[MIT](LICENSE)
