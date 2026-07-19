// Build-time structure for markdown pages (media rows style on any page;
// the other wrappers style only inside dwelling pages and are inert
// elsewhere — see global.css):
//  - runs of 2+ consecutive image-only paragraphs -> <div class="photo-run">
//  - a solitary image paragraph after a text paragraph -> <div class="media-row">
//    holding both, alternating sides via the media-row-flip class
//  - an h2 + optional image + link-bearing paragraph + optional link-only
//    CTA paragraph -> cross-sell card with a generated facts line;
//    consecutive cards group into <div class="cross-sell-row">
//  - remaining link-only paragraphs -> button-styled links
//  - every other photo -> anchor opening a per-photo :target lightbox
//    overlay appended at the page end

import { readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { isElement, isWhitespace, textOf, el, text, factIcon } from "./hast-utils.mjs";
import { sumFacts } from "./dwelling-facts.mjs";

const isImageParagraph = (node) => {
  if (!isElement(node, "p")) return false;
  const kids = node.children.filter((c) => !isWhitespace(c));
  return kids.length === 1 && kids[0].type === "element" && kids[0].tagName === "img";
};

const isTextParagraph = (node) =>
  isElement(node, "p") && !isImageParagraph(node) && textOf(node).trim().length > 0;

const hasLink = (node) =>
  isElement(node, "a") || (node.children ?? []).some((c) => c.type === "element" && hasLink(c));

const div = (className, children) => el("div", { className: [className] }, children);

// A paragraph that is only a link: the card's call-to-action, styled as a
// button.
const isCtaParagraph = (node) => {
  if (!node || !isElement(node, "p")) return false;
  const kids = node.children.filter((c) => !isWhitespace(c));
  return kids.length === 1 && kids[0].type === "element" && kids[0].tagName === "a";
};

const firstHref = (node) => {
  if (isElement(node, "a")) return node.properties?.href;
  for (const c of node.children ?? []) {
    const href = c.type === "element" && firstHref(c);
    if (href) return href;
  }
  return null;
};

// Sleeps/bedrooms for a dwelling page, read from its frontmatter so the
// numbers stay single-sourced; /house-and-villa/ is the two combined.
// Cached per process: in dev, frontmatter fact edits need a server restart
// to show in cross-sell cards.
const factsCache = new Map();
const dwellingFacts = (slug) => {
  if (factsCache.has(slug)) return factsCache.get(slug);
  const raw = readFileSync(
    path.join(process.cwd(), "src/content/pages", `${slug}.md`),
    "utf8",
  );
  // Anchored to the leading delimiter so a --- inside the body or a
  // frontmatter string can't truncate the parse.
  const frontmatter = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) throw new Error(`No frontmatter in ${slug}.md`);
  const d = parse(frontmatter[1]).dwelling;
  const facts = { sleeps: d.sleeps, bedrooms: d.bedrooms.length, bathrooms: d.bathrooms };
  factsCache.set(slug, facts);
  return facts;
};

const factsFor = (href) => {
  const slug = href.replaceAll("/", "");
  if (slug === "house-and-villa") {
    return sumFacts([dwellingFacts("hillside-house"), dwellingFacts("hillside-villa")]);
  }
  return dwellingFacts(slug);
};

const factsLine = ({ sleeps, bedrooms, bathrooms }) => {
  const span = (icon, text) => ({
    type: "element",
    tagName: "span",
    properties: {},
    children: [factIcon(icon), { type: "text", value: ` ${text}` }],
  });
  return {
    type: "element",
    tagName: "p",
    properties: { className: ["facts-line"] },
    children: [
      span("users", `Sleeps ${sleeps}`),
      span("bed", `${bedrooms} ${bedrooms === 1 ? "bedroom" : "bedrooms"}`),
      span("bathtub", `${bathrooms} ${bathrooms === 1 ? "bathroom" : "bathrooms"}`),
    ],
  };
};

export default function rehypePhotoRuns() {
  return (tree) => {
    const walk = (parent) => {
      if (!parent.children) return;
      // Whitespace between block elements is insignificant; dropping it
      // makes adjacency checks reliable.
      const nodes = parent.children.filter((c) => !isWhitespace(c));
      nodes.forEach(walk);

      // Group consecutive image paragraphs into photo runs.
      const grouped = [];
      let run = [];
      const flushRun = () => {
        if (run.length >= 2) grouped.push(div("photo-run", run));
        else grouped.push(...run);
        run = [];
      };
      for (const node of nodes) {
        if (isImageParagraph(node)) run.push(node);
        else {
          flushRun();
          grouped.push(node);
        }
      }
      flushRun();

      // Pair a remaining solitary image with the text paragraph
      // before it, alternating sides.
      const paired = [];
      let flip = false;
      for (const node of grouped) {
        const prev = paired[paired.length - 1];
        if (isImageParagraph(node) && prev && isTextParagraph(prev)) {
          paired.pop();
          const row = el(
            "div",
            { className: flip ? ["media-row", "media-row-flip"] : ["media-row"] },
            [prev, node],
          );
          paired.push(row);
          flip = !flip;
        } else {
          paired.push(node);
        }
      }

      // h2 + optional image paragraph + link-bearing paragraph +
      // optional link-only CTA paragraph -> cross-sell card, rebuilt as a
      // horizontal photo-beside-text row (the homepage combined-card
      // treatment); consecutive cards stack into one band.
      const carded = [];
      for (let i = 0; i < paired.length; i++) {
        const node = paired[i];
        const image = paired[i + 1] && isImageParagraph(paired[i + 1]) ? paired[i + 1] : null;
        let j = i + (image ? 2 : 1);
        const next = paired[j];
        const cta = isCtaParagraph(paired[j + 1]) ? paired[j + 1] : null;
        if (cta) j++;
        const after = paired[j + 1];
        if (
          isElement(node, "h2") &&
          next &&
          isTextParagraph(next) &&
          (cta || hasLink(next)) &&
          (!after || !isTextParagraph(after))
        ) {
          const body = [node, next];
          if (cta) {
            cta.properties = { ...cta.properties, className: ["cross-sell-cta"] };
            const a = cta.children.find((c) => isElement(c, "a"));
            a.properties = { ...a.properties, className: ["btn"] };
            const facts = factsFor(firstHref(cta));
            body.splice(1, 0, factsLine(facts));
            body.push(cta);
          }
          const children = [image, div("cross-sell-body", body)].filter(Boolean);
          const card = div("cross-sell-card", children);
          // The combined House & Villa stay books by enquiry only, so its
          // card renders demoted (smaller, outline CTA) wherever it appears.
          if (firstHref(cta ?? next) === "/house-and-villa/") {
            card.properties.className.push("cross-sell-secondary");
          }
          const prev = carded[carded.length - 1];
          if (prev && prev.type === "element" && prev.properties?.className?.[0] === "cross-sell-row") {
            prev.children.push(card);
          } else {
            const row = div("cross-sell-row", [card]);
            // An h2 directly before the first card is the section's
            // header; pull it into the band spanning the full row.
            const before = carded[carded.length - 1];
            if (before && isElement(before, "h2")) {
              carded.pop();
              before.properties = { ...before.properties, className: ["cross-sell-heading"] };
              row.children.unshift(before);
            }
            carded.push(row);
          }
          i = j;
        } else {
          carded.push(node);
        }
      }

      // Link-only paragraphs not absorbed into a cross-sell card (e.g.
      // "Book with us") render as buttons.
      for (const node of carded) {
        if (isCtaParagraph(node)) {
          const a = node.children.find((c) => isElement(c, "a"));
          a.properties = { ...a.properties, className: ["btn"] };
        }
      }

      parent.children = carded;
    };
    walk(tree);

    // Wrap each photo in an anchor to a per-photo lightbox overlay
    // appended at the page end. Cross-sell card photos stay plain.
    // Overlays are built after the walk so each one can link to its
    // neighbours (wrapping around) and show its position in the set.
    const photos = [];
    const enlarge = (parent) => {
      if (!parent.children) return;
      const classes = parent.properties?.className ?? [];
      if (classes.includes("cross-sell-row")) return;
      for (const node of parent.children) {
        if (isImageParagraph(node)) {
          const img = node.children.find((c) => isElement(c, "img"));
          const id = `photo-${photos.length + 1}`;
          photos.push(img);
          node.children = [
            {
              type: "element",
              tagName: "a",
              properties: {
                href: `#${id}`,
                className: ["lightbox-open"],
                ariaLabel: `Enlarge photo: ${img.properties?.alt ?? ""}`,
              },
              children: [img],
            },
          ];
        } else {
          enlarge(node);
        }
      }
    };
    enlarge(tree);

    // The first content image sits at or near the top of the page, so
    // load it eagerly instead of Astro's lazy default.
    const firstImg = (parent) => {
      for (const node of parent.children ?? []) {
        if (isElement(node, "img")) return node;
        const found = node.type === "element" ? firstImg(node) : null;
        if (found) return found;
      }
      return null;
    };
    const lead = firstImg(tree);
    if (lead) {
      lead.properties.loading = "eager";
      lead.properties.fetchPriority = "high";
    }

    const total = photos.length;
    tree.children.push(
      ...photos.map((img, i) => {
        const prev = ((i - 1 + total) % total) + 1;
        const next = ((i + 1) % total) + 1;
        return el("div", { id: `photo-${i + 1}`, className: ["lightbox"] }, [
            el(
              "a",
              { href: "#_", className: ["lightbox-backdrop"], ariaLabel: "Close enlarged photo" },
              [],
            ),
            el("img", { ...img.properties, loading: "lazy", fetchpriority: undefined }, []),
            el("span", { className: ["lightbox-meta"] }, [
              el("span", { className: ["lightbox-caption"] }, [
                text(img.properties?.alt ?? ""),
              ]),
              el("span", { className: ["lightbox-counter"] }, [
                text(`${i + 1} / ${total}`),
              ]),
            ]),
            el(
              "a",
              { href: `#photo-${prev}`, className: ["lightbox-prev"], ariaLabel: "Previous photo" },
              [text("←")],
            ),
            el(
              "a",
              { href: `#photo-${next}`, className: ["lightbox-next"], ariaLabel: "Next photo" },
              [text("→")],
            ),
            el("a", { href: "#_", className: ["lightbox-close"], ariaLabel: "Close enlarged photo" }, [
              text("×"),
            ]),
          ]);
      }),
    );
  };
}
