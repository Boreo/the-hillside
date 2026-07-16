# The Hillside Retreat (thehillside.com.au)

Static Astro site for a two-dwelling holiday accommodation business on Tamborine Mountain, QLD. Hillside House sleeps 6 across 3 bedrooms, Hillside Villa sleeps 2, and the two combine for groups of up to 8.

## Stack

- Astro with static output, no client JS frameworks.
- Content is markdown in `src/content/pages/` (collection `pages`, schema in `src/content.config.ts` with `title` required and `description` optional). `src/pages/[...slug].astro` renders each entry.
- The homepage is `src/pages/index.astro`, composed from `src/components/` (Hero, Arrival, DwellingCards, ReviewBand, PhotoBand, PullQuote, Closing; FactIcon renders dwelling fact icons) with copy from `src/content/pages/index.md` frontmatter.
- Standalone routes in `src/pages/`: `book.astro` (SiteMinder embed), `gallery.astro` and `reviews.astro` (driven by `src/content/gallery.yaml` and `reviews.yaml`), `palette-demo.astro`.
- `src/layouts/Base.astro` carries the nav (dropdowns grouped Accommodation / Your Stay), footer, `LodgingBusiness` JSON-LD with the full business details, and the booking URL constant. New pages must be added to a nav group.
- Styles are plain CSS with custom properties (brand palette tokens) in `src/styles/global.css`; body font is Fraunces via `@fontsource-variable/fraunces`. `/palette-demo` previews the tokens.
- Images live in `public/images/<category>/` (`house`, `villa`, `external`, `drone`, `amenities`; logo/emblem at root), named `<descriptive-name>.<ext>` and pre-resized to 2000px or less. The hero drone video is in `public/videos/`.

## Development

- Dev server: run in background mode with `astro dev --background`; manage with `astro dev stop|status|logs`.
- `npm run build` runs `astro check` then a static build to `dist/`; it validates content schema and types. Treat any `astro check` output as a defect.
- `npm run preview` builds then serves via `wrangler dev`.
- `npm test` runs Playwright tests in `tests/`.

## Hosting

- Cloudflare Workers, GitHub-connected; deploys build from `main`.
- Staging: https://the-hillside.github-e53.workers.dev/

## Business facts (public information)

- Address: 25 Leona Court, Tamborine Mountain QLD 4272
- Phone: (+61) 0466 990 185. Email: stay@thehillside.com.au
- Booking engine widget renders only on SiteMinder-whitelisted domains (thehillside.com.au and the Workers staging URL are whitelisted).
- House and Villa combined bookings are direct only (email or phone), not via the booking engine.

## Editing rules

- Content edits go in `src/content/pages/*.md` and `src/content/{gallery,reviews}.yaml` only. Keep the owner's wording unless asked to rewrite.
- Dwelling facts (sleeps, bedrooms, amenities) live in `dwelling:` frontmatter on the dwelling pages, where they drive the facts strip and Accommodation JSON-LD. Update facts there, not in prose, because prose should not restate these numbers.
- Every image needs meaningful alt text. The gallery schema enforces this.
- Legacy Squarespace paths `/home` and `/further-inform` redirect via `astro.config.mjs`. Keep them.

## Documentation

Astro docs: https://docs.astro.build (routing, content collections, styling).
