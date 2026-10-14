# Progress 2026

A live progress bar for the year: how much of 2026 has passed in your own time zone, updated every second, with the days elapsed and the days left until 2027.

**Live:** https://progress.dealwithmuhammad.com · **Case study:** https://www.dealwithmuhammad.com/work/progress-2026

Built by [Muhammad Ahmad](https://www.dealwithmuhammad.com), web & mobile app developer in Kuala Lumpur, Malaysia.

## How it works

- The visitor's time zone is detected from their IP address (falling back to the browser's time zone) and can be changed from the Location menu.
- Progress = time since midnight on 1 January in that time zone ÷ length of the year (365 days in 2026, 366 in a leap year). The maths lives in `lib/year.ts`; the tracked year is `siteConfig.year` in `config/site.ts`.
- Below the live counter, a server-rendered summary and FAQ (revalidated hourly, as of the UTC date) give crawlers and AI assistants real numbers without running JavaScript.

## SEO and analytics

- Metadata, Open Graph and Twitter cards in `app/layout.tsx`; a share image with the current percentage in `app/opengraph-image.tsx`.
- JSON-LD (`WebSite`, `WebApplication`, `FAQPage`) in `app/page.tsx`, built by `lib/structured-data.ts`.
- `app/robots.ts` (allows search and AI crawlers), `app/sitemap.ts`, `app/manifest.ts` and `public/llms.txt`.
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
