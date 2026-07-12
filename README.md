# The Hillside Retreat (thehillside.com.au)

Static site for a two-dwelling holiday accommodation business on Tamborine Mountain, QLD. Built with Astro, deployed on Cloudflare Pages, and maintained through an AI-assisted editing workflow where a human approves every change.

## Stack

- **Astro**: static output. Pages render from markdown at build time and no client-side JS frameworks ship.
- **Content**: markdown in `src/content/pages/`, a content collection whose frontmatter is schema-validated by `src/content.config.ts`.
- **Layout**: a single base layout carries the nav, footer, and `LodgingBusiness` JSON-LD for search engines and AI answer engines.
- **Styles**: plain CSS with custom properties.
- **Hosting**: Cloudflare Pages, which runs `npm run build` and serves `dist/`.
- **Booking**: SiteMinder/Little Hotelier direct booking engine. Pending domain whitelist approval.

## Why this architecture

The previous site was on Squarespace, on a subscription tier without code injection, which meant no structured data and every edit went through the dashboard.

This setup replaces the subscription with hosting that costs nothing on Cloudflare's free tier, JSON-LD emitted by the layout with no plan upgrade needed, and git as the content database. Every change is a reviewable, revertable commit, and the owner's wording lives in version control instead of CMS state.

## AI-assisted editing workflow

An AI coding agent maintains the content under human control. Four rules make that safe:

1. **Approval**: git is the gate. The agent proposes changes as commits and PRs, a human reviews and merges, and the deploy pipeline builds only from `main`.
2. **Provenance**: AI-assisted commits carry a `Co-Authored-By` trailer.
3. **Instructions**: the agent follows checked-in rules. `AGENTS.md` defines them and is versioned.
4. **Validation**: `npm run build` validates all content frontmatter.

The target end state: the non-technical owner emails a change request → GitHub issue → agent drafts a PR → human approves → Cloudflare Pages deploys. Each arrow is an explicit gate.

## Development

| Command | Action |
| :-- | :-- |
| `npm install` | Install dependencies |
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Static build to `dist/`, validates content schema |
| `npm run preview` | Preview the production build locally |

## Content editing

- Content lives in `src/content/pages/*.md`. `index.md` is the homepage and other files map to routes by filename.
- Images go in `public/images/`, named `<descriptive-name>.<ext>` and pre-resized to 2000px or less.
- Legacy Squarespace paths (`/home`, `/further-inform`) redirect via `astro.config.mjs`.
