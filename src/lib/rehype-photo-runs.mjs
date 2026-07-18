// Build-time structure for markdown pages (styling is scoped to dwelling
// pages in global.css; the wrappers are inert elsewhere):
//  - runs of 2+ consecutive image-only paragraphs -> <div class="photo-run">
//  - a solitary image paragraph after a text paragraph -> <div class="media-row">
//    holding both, alternating sides via the media-row-flip class
//  - an h2 + optional image + link-bearing paragraph + optional link-only
//    CTA paragraph -> cross-sell card with a generated facts line;
//    consecutive cards group into <div class="cross-sell-row">
//  - every other photo -> anchor opening a per-photo :target lightbox
//    overlay appended at the page end

import { readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { FACT_ICON_PATHS } from "./fact-icon-paths.mjs";

const isWhitespace = (node) => node.type === "text" && !node.value.trim();

const isElement = (node, tag) => node.type === "element" && node.tagName === tag;

const isImageParagraph = (node) => {
  if (!isElement(node, "p")) return false;
  const kids = node.children.filter((c) => !isWhitespace(c));
  return kids.length === 1 && kids[0].type === "element" && kids[0].tagName === "img";
};

const textOf = (node) => {
  if (node.type === "text") return node.value;
  return (node.children ?? []).map(textOf).join("");
};

const isTextParagraph = (node) =>
  isElement(node, "p") && !isImageParagraph(node) && textOf(node).trim().length > 0;

const hasLink = (node) =>
  isElement(node, "a") || (node.children ?? []).some((c) => c.type === "element" && hasLink(c));

const div = (className, children) => ({
  type: "element",
  tagName: "div",
  properties: { className: [className] },
  children,
});

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
const dwellingFacts = (slug) => {
  const raw = readFileSync(
    path.join(process.cwd(), "src/content/pages", `${slug}.md`),
    "utf8",
  );
  const d = parse(raw.split("---")[1]).dwelling;
  return { sleeps: d.sleeps, bedrooms: d.bedrooms.length };
};

const factsFor = (href) => {
  const slug = href.replaceAll("/", "");
  if (slug === "house-and-villa") {
    const house = dwellingFacts("hillside-house");
    const villa = dwellingFacts("hillside-villa");
    return { sleeps: house.sleeps + villa.sleeps, bedrooms: house.bedrooms + villa.bedrooms };
  }
  return dwellingFacts(slug);
};

const factIcon = (name) => ({
  type: "element",
  tagName: "svg",
  properties: { className: ["fact-icon"], viewBox: "0 0 256 256", ariaHidden: "true" },
  children: [
    {
      type: "element",
      tagName: "path",
      properties: { fill: "currentColor", d: FACT_ICON_PATHS[name] },
      children: [],
    },
  ],
});

const factsLine = ({ sleeps, bedrooms }) => {
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
          const className = flip ? ["media-row", "media-row-flip"] : ["media-row"];
          const row = div("media-row", [prev, node]);
          row.properties.className = className;
          paired.push(row);
          flip = !flip;
        } else {
          paired.push(node);
        }
      }

      // h2 + optional image paragraph + link-bearing paragraph +
      // optional link-only CTA paragraph -> cross-sell card, rebuilt in the
      // homepage dwelling-card order (photo, heading, facts line, text,
      // button); consecutive cards join into one row.
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
          const children = [image, node, next, cta].filter(Boolean);
          if (cta) {
            cta.properties = { ...cta.properties, className: ["cross-sell-cta"] };
            const facts = factsFor(firstHref(cta));
            children.splice(2, 0, factsLine(facts));
          }
          const card = div("cross-sell-card", children);
          const prev = carded[carded.length - 1];
          if (prev && prev.type === "element" && prev.properties?.className?.[0] === "cross-sell-row") {
            prev.children.push(card);
          } else {
            carded.push(div("cross-sell-row", [card]));
          }
          i = j;
        } else {
          carded.push(node);
        }
      }

      parent.children = carded;
    };
    walk(tree);

    // Wrap each photo in an anchor to a per-photo lightbox overlay
    // appended at the page end. Cross-sell card photos stay plain.
    const overlays = [];
    const enlarge = (parent) => {
      if (!parent.children) return;
      const classes = parent.properties?.className ?? [];
      if (classes.includes("cross-sell-row")) return;
      for (const node of parent.children) {
        if (isImageParagraph(node)) {
          const img = node.children.find((c) => isElement(c, "img"));
          const id = `photo-${overlays.length + 1}`;
          overlays.push({
            type: "element",
            tagName: "a",
            properties: {
              id,
              href: "#_",
              className: ["lightbox"],
              ariaLabel: "Close enlarged photo",
            },
            children: [
              {
                type: "element",
                tagName: "img",
                properties: { ...img.properties, loading: "lazy" },
                children: [],
              },
            ],
          });
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
    tree.children.push(...overlays);
  };
}
