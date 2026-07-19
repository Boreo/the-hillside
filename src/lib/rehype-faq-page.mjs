// Build-time structure for the FAQ page (styling lives under the .faq-
// classes in global.css; the plugin is a no-op on every other page):
//  - a quick-answers chip strip after the intro, each chip quoting a short
//    fact verbatim from an answer (capacity, check-in/out, minimum stay,
//    pets) so the strip never invents wording
//  - each h2 and its following content -> <section class="faq-group"> with
//    the h2 as an eyebrow label
//  - inside a group, each h3 question and its answer -> an
//    <article class="faq-item"> with a slug id for deep links (/faq/#are-pets-allowed)
//  - a trailing h2 section with no h3s beneath it renders as the
//    <section class="faq-closing"> contact card

import { FACT_ICON_PATHS } from "./fact-icon-paths.mjs";

const isElement = (node, tag) => node.type === "element" && node.tagName === tag;

const isWhitespace = (node) => node.type === "text" && !node.value.trim();

const textOf = (node) => {
  if (node.type === "text") return node.value;
  return (node.children ?? []).map(textOf).join("");
};

const slugOf = (node) =>
  textOf(node)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const el = (tagName, properties, children) => ({ type: "element", tagName, properties, children });
const text = (value) => ({ type: "text", value });

const icon = (name) =>
  el("svg", { className: ["fact-icon"], viewBox: "0 0 256 256", ariaHidden: "true" }, [
    el("path", { fill: "currentColor", d: FACT_ICON_PATHS[name] }, []),
  ]);

// Each chip captures a phrase verbatim from the first answer paragraph that
// matches; if the wording changes and no longer matches, the chip drops out
// rather than drifting from the content.
const CHIP_RULES = [
  { icon: "users", pattern: /(sleeps up to 8 guests)/i },
  { icon: "clock", pattern: /(check-in is from \S+m)/i },
  { icon: "clock", pattern: /(check-out is by \S+m)/i },
  { icon: "calendar", pattern: /(2 night minimum stay)/i },
  { icon: "paw-print", pattern: /(we keep the property pet-free)/i },
];

const chipStrip = (nodes) => {
  const paragraphs = nodes.filter((n) => isElement(n, "p")).map((n) => textOf(n));
  const chips = CHIP_RULES.flatMap((rule) => {
    for (const p of paragraphs) {
      const match = p.match(rule.pattern);
      if (match) {
        const phrase = match[1].charAt(0).toUpperCase() + match[1].slice(1);
        return [el("span", { className: ["policy-chip"] }, [icon(rule.icon), text(phrase)])];
      }
    }
    return [];
  });
  return el("p", { className: ["policy-chips"] }, chips);
};

// Split a node list into a leading chunk plus one chunk per heading of the
// given tag; each chunk is [heading, ...content up to the next heading].
const splitAt = (nodes, tag) => {
  const chunks = [[]];
  for (const node of nodes) {
    if (isElement(node, tag)) chunks.push([]);
    chunks[chunks.length - 1].push(node);
  }
  return chunks;
};

export default function rehypeFaqPage() {
  return (tree, file) => {
    if (!file?.path?.includes("faq")) return;

    const nodes = tree.children.filter((c) => !isWhitespace(c));
    const [lead, ...groups] = splitAt(nodes, "h2");

    // Sticky "On this page" contents list of every question, sharing the
    // guest-info toc styling. Links target the per-question slug ids.
    const toc = el("nav", { className: ["policy-toc"], ariaLabel: "Questions on this page" }, [
      el("p", { className: ["policy-toc-label"] }, [text("On this page")]),
      el(
        "ol",
        {},
        nodes
          .filter((n) => isElement(n, "h3"))
          .map((h3) =>
            el("li", {}, [el("a", { href: `#${slugOf(h3)}` }, [text(textOf(h3))])]),
          ),
      ),
    ]);

    // The h1, intro and chip strip span the page like every other page;
    // below them the contents list sits beside the question column, which
    // keeps a readable measure without looking cut off.
    tree.children = [
      ...lead,
      chipStrip(nodes),
      el("div", { className: ["faq-layout"] }, [
        toc,
        el("div", { className: ["faq-wrap"] }, [
          ...groups.map(([h2, ...body]) => {
          const id = slugOf(h2);
          const [, ...questions] = splitAt(body, "h3");
          if (questions.length === 0) {
            // The prose sits in a wrapper div so rehype-photo-runs (which runs
            // later) doesn't match its h2 + link-paragraph cross-sell pattern.
            return el("section", { className: ["faq-closing"], id }, [
              h2,
              el("div", { className: ["faq-closing-body"] }, body),
            ]);
          }
          return el("section", { className: ["faq-group"], id }, [
            h2,
            el(
              "div",
              { className: ["faq-list"] },
              questions.map(([h3, ...answer]) => {
                h3.properties = { ...h3.properties, className: ["faq-q"] };
                return el("article", { className: ["faq-item"], id: slugOf(h3) }, [
                  h3,
                  el("div", { className: ["faq-a"] }, answer),
                ]);
              }),
            ),
          ]);
          }),
        ]),
      ]),
    ];
  };
}
