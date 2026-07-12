# The Hillside Retreat (thehillside.com.au)

Static Astro site for a two-dwelling holiday accommodation business on Tamborine Mountain, QLD. Hillside House sleeps 6 across 3 bedrooms, Hillside Villa sleeps 2, and the two combine for groups of up to 8.

## Stack

- Astro with static output, no client JS frameworks.
- Content is markdown in `src/content/pages/` (collection `pages`, schema in `src/content.config.ts` with `title` required and `description` optional). `src/pages/[...slug].astro` renders each entry and `index.md` is the homepage.
- `src/layouts/Base.astro` carries the nav, footer, `LodgingBusiness` JSON-LD with the full business details, and the booking URL constant.
- Styles are plain CSS with custom properties in `src/styles/global.css`.
- Images live in `public/images/`, named `<descriptive-name>.<ext>` and pre-resized to 2000px or less.

## Development

Run the dev server in background mode with `astro dev --background` and manage it with `astro dev stop|status|logs`. `npm run build` produces the static build in `dist/` and validates the content schema.

## Hosting

- Staging deploy: https://the-hillside.github-e53.workers.dev/ (Cloudflare Workers, connected to the GitHub repo).

## Business facts (Public information)

- Address: 25 Leona Court, Tamborine Mountain QLD 4272
- Phone: (+61) 0466 990 185. Email: stay@thehillside.com.au
- Booking engine: https://book-directonline.com/properties/thehillsideretreatdirect (SiteMinder/Little Hotelier). Embeddable via the SiteMinder widget: `<div class="ibe" data-region="apac" data-channelcode="thehillsideretreatdirect" data-widget="embed"></div>` plus `<script src="https://widget.siteminder.com/ibe.min.js"></script>` before `</body>`
- House and Villa combined bookings are direct only (email or phone), not via the booking engine.

## Editing rules

- Content edits go in `src/content/pages/*.md` and `src/content/{gallery,reviews}.yaml` only. Keep the owner's wording unless asked to rewrite.
- Dwelling facts (sleeps, bedrooms, amenities) live in `dwelling:` frontmatter on the dwelling pages, where they drive the facts strip and Accommodation JSON-LD. Update facts there, not in prose, because prose should not restate these numbers.
- Every image needs meaningful alt text. The gallery schema enforces this.
- Legacy Squarespace paths `/home` and `/further-inform` redirect via `astro.config.mjs`. Keep them.

## Documentation

Astro docs: https://docs.astro.build (routing, content collections, styling).
