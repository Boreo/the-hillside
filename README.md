# The Hillside Retreat (thehillside.com.au)

Static site for a two-dwelling holiday accommodation business on Tamborine Mountain, QLD. Built with Astro, deployed on Cloudflare Workers, and maintained through an AI-assisted editing workflow where a human approves every change.

## Stack

- **Astro**: static output. Pages render from markdown at build time and no client-side JS frameworks ship.
- **Content**: markdown in `src/content/pages/`, a content collection whose frontmatter is schema-validated by `src/content.config.ts`. The homepage is composed from components in `src/components/` with copy from `index.md` frontmatter.
- **Layout**: a single base layout carries the nav (dropdowns grouped Accommodation / Your Stay), footer, and `LodgingBusiness` JSON-LD for search engines and AI answer engines.
- **Styles**: plain CSS with custom properties (brand palette tokens); Fraunces variable font.
- **Hosting**: Cloudflare Workers (GitHub-connected), which runs `npm run build` and serves `dist/`. Staging: https://the-hillside.github-e53.workers.dev/
- **Tests**: Playwright in `tests/`.
- **Booking**: SiteMinder/Little Hotelier booking widget on `/book/`; renders only on SiteMinder-whitelisted domains (production domain and Workers staging URL are whitelisted).

## Structure

```
src/
  components/        Homepage sections (Hero, Arrival, DwellingCards, …)
  content/
    pages/           Page content as markdown; index.md holds homepage copy
    gallery.yaml     Gallery images with alt text
    reviews.yaml     Guest reviews
  layouts/           Base.astro — nav, footer, JSON-LD
  pages/             Routes: index.astro, [...slug].astro, book, gallery, reviews, palette-demo
  styles/            global.css with brand palette tokens
  content.config.ts  Content schemas
public/
  images/<category>/ house, villa, external, drone, amenities
  videos/            Hero drone video
tests/               Playwright specs
```

## Why this architecture

The previous site was on Squarespace, on a subscription tier without code injection, which meant no structured data and every edit went through the dashboard.

This setup replaces the subscription with hosting that costs nothing on Cloudflare's free tier, JSON-LD emitted by the layout with no plan upgrade needed, and git as the content database. Every change is a reviewable, revertable commit, and the owner's wording lives in version control instead of CMS state.

## AI-assisted editing workflow

An AI coding agent maintains the content under human control. Four rules make that safe:

1. **Approval**: git is the gate. The agent proposes changes as commits and PRs, a human reviews and merges, and the deploy pipeline builds only from `main`.
2. **Provenance**: AI-assisted commits carry a `Co-Authored-By` trailer.
3. **Instructions**: the agent follows checked-in rules. `CLAUDE.md` defines them (`AGENTS.md` is a symlink to it) and is versioned.
4. **Validation**: `npm run build` validates all content frontmatter.

The target end state: the non-technical owner emails a change request → GitHub issue → agent drafts a PR → human approves → Cloudflare Workers deploys. Each arrow is an explicit gate.

## Development

| Command | Action |
| :-- | :-- |
| `npm install` | Install dependencies |
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | `astro check` + static build to `dist/`, validates content schema |
| `npm run preview` | Build, then serve the production build via `wrangler dev` |
| `npm test` | Playwright tests |

## Content editing

- Content lives in `src/content/pages/*.md`; files map to routes by filename. Homepage copy is frontmatter in `index.md`.
- Images go in `public/images/<category>/` (`house`, `villa`, `external`, `drone`, `amenities`), named `<descriptive-name>.<ext>` and pre-resized to 2000px or less. The hero video is in `public/videos/`.
- Legacy Squarespace paths (`/home`, `/further-inform`) redirect via `astro.config.mjs`.
