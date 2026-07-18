# SiteMinder booking widget reference

How the `/book/` embed works, which parameters it accepts, and how to re-inspect
it when SiteMinder changes something.

## Architecture

- `src/pages/book.astro` renders `<div class="ibe" data-region="apac" data-channelcode="thehillsideretreatdirect" data-widget="embed">` and loads `https://widget.siteminder.com/ibe.min.js`.
- `ibe.min.js` builds an iframe pointing at the availability grid:
  `https://app-apac.thebookingbutton.com/properties/thehillsideretreatdirect/widget`
  (region template: `https://{app|app-apac}.thebookingbutton.com/...`, `apac` → `app-apac`).
  Note the newer `book-directonline.com` domain serves the full booking engine SPA,
  but the embed widget still lives on `thebookingbutton.com`.
- Property ID: `16207` (seen in the per-property stylesheet URL).

## Parameter pass-through

`ibe.min.js` forwards parameters into the iframe URL from two sources, read once
at script load:

1. **Page URL query string** — only names on this whitelist (from the script's
   `allowed_query_vars`):
   `check_in_date`, `check_out_date`, `number_nights`, `number_adults`,
   `number_children`, `number_infants`, `promo_code`, `campaign`, `locale`,
   `currency`, `room_type`, `room_rate`, `rate_plan`.
2. **`data-query-<name>` attributes** on the `.ibe` div — any name, forwarded as
   `<name>=<value>` (this is how `book.astro` injects `currency`).

Because the script reads these at load time, anything set from JS (like the geo
currency) must be in place before `ibe.min.js` executes — `book.astro` therefore
injects the script dynamically after setting `data-query-currency`.

## What the grid actually honours

Tested by diffing grid HTML with and without each parameter:

- `room_rate=<rate_id>` — adds `class='highlight'` to that listing's row
  (`.highlight td { background-color: #d2e1e6 }`). This is what the dwelling
  CTAs use. It highlights only; all listings still render, no scroll, no filter.
- `currency`, `locale`, `check_in_date` / `start_date` — honoured.
- `room_type`, `rate_plan` — no effect on the grid, tested with both rate IDs
  and the real room type IDs below (SiteMinder's setup wizard marks rate-plan
  restriction "WIP"). Re-test occasionally in case SiteMinder ships it.

## Rate IDs (hardcoded in dwelling CTAs)

- `413447` — Hillside House
- `413448` — Hillside Villa
- `444433` — House & Villa combined (always shows Sold; combined bookings are
  direct-only, so nothing links to this ID)

IDs change if rate plans are recreated in SiteMinder. CTAs carrying them:
`cta.href` frontmatter and the in-body "Book with us" links in
`src/content/pages/hillside-house.md` and `hillside-villa.md`.

## Room type IDs

Distinct from rate IDs; currently unused (nothing on the widget accepts them)
but valid for full-engine deep links (`room_type_id`). From the dashboard edit
URLs (`/extranet/properties/16207/room_types/<id>/edit`):

- `172917` — Hillside House
- `172918` — Hillside Villa

## Geo currency

`book.astro` fetches same-origin `/cdn-cgi/trace` (available on every
Cloudflare-served host, including workers.dev; no browser permission prompt),
parses `loc=<country>`, maps country → currency, sets `data-query-currency`,
then injects `ibe.min.js`. Unmapped countries and failures fall back to the
widget default (AUD); a 1.5 s timeout loads the widget regardless.

Supported currency codes are the `<option value>`s in the grid's currency
selector — grep the fetched grid HTML for `option value=` to refresh the list.

## How to re-inspect

All of the above was derived without dashboard access. To repeat:

```sh
# 1. The widget script — read its settings/whitelist directly
curl -s https://widget.siteminder.com/ibe.min.js -o ibe.min.js
npx -y prettier ibe.min.js > ibe.js
grep -n 'allowed_query_vars' -A 20 ibe.js     # parameter whitelist
grep -n 'region_subdomain\|domain' ibe.js     # iframe host mapping

# 2. The grid the iframe loads — server-rendered HTML, fully greppable
curl -sL -A Mozilla/5.0 \
  'https://app-apac.thebookingbutton.com/properties/thehillsideretreatdirect/widget' \
  -o grid.html
grep -o '#room_[0-9]*' grid.html | sort -u    # current rate IDs
# nightly prices + Sold cells sit in each row; photo filenames hint which
# dwelling a rate belongs to when names are absent (grid rows only say
# "Standard Rate")

# 3. Test whether a parameter does anything — diff against a baseline,
#    ignoring per-request noise (CSRF tokens, NREUM timing)
norm() { sed -E 's/(authenticity_token|value)="[^"]*"//g' | tr -s ' '; }
curl -sL -A Mozilla/5.0 "$GRID_URL" | norm > base.html
curl -sL -A Mozilla/5.0 "$GRID_URL?room_rate=413447" | norm > test.html
diff base.html test.html
```

Dead ends, so nobody retries them: `apac.book-directonline.com` doesn't resolve;
`book-directonline.com/api/*` is behind AWS WAF (403/JS challenge); the full
booking-engine SPA can't be scraped with curl. Room *type* IDs and rate-plan
codes are only visible in the SiteMinder dashboard (Booking Engine setup).

SiteMinder's own docs: the widget setup wizard lives in the dashboard
(Booking Engine → website integration); the public integration guide is
https://help.siteminder.com/s/article/Integrate-the-booking-engine-your-website-using-links-and-widgets
