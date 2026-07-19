// Build-time structure for the guest-info page (styling lives under the
// .policy- classes in global.css; the plugin is a no-op on every other page):
//  - a key-facts chip strip after the h1, each chip quoting a one-line rule
//    verbatim from the body (check-in/out, children, smoking, pets, parties)
//  - each h2 and its following content -> <section class="policy-section">
//  - inside the practical section, each h3 topic -> a card in a
//    <div class="policy-topics"> grid; "Check-in:"/"Check-out:" lines get a
//    clock icon and emphasis
//  - the terms section renders as a two-column layout: a sticky
//    "On this page" contents list built from its h3s beside the prose,
//    with CSS-numbered clauses
//  - blockquotes and the "Effective ..." date line are styled via CSS only

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

// Quick-glance rules surfaced as chips at the top of the page. Each chip
// quotes the first body paragraph matching its pattern verbatim, so the
// strip never invents wording.
const CHIP_RULES = [
  { icon: "clock", pattern: /^check-in:/i },
  { icon: "clock", pattern: /^check-out:/i },
  { icon: "baby", pattern: /^children of any age/i },
  { icon: "cigarette-slash", pattern: /^smoking is not allowed/i },
  { icon: "paw-print", pattern: /^pets are not allowed/i },
  { icon: "confetti", pattern: /^parties\/events are not allowed/i },
];

const chipStrip = (nodes) => {
  const paragraphs = nodes.filter((n) => isElement(n, "p")).map((n) => textOf(n).trim());
  const chips = CHIP_RULES.flatMap((rule) => {
    const match = paragraphs.find((t) => rule.pattern.test(t));
    if (!match) return [];
    return [
      el("span", { className: ["policy-chip"] }, [
        icon(rule.icon),
        text(match.replace(/\.$/, "")),
      ]),
    ];
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

export default function rehypePolicyPage() {
  return (tree, file) => {
    if (!file?.path?.includes("guest-info")) return;

    const nodes = tree.children.filter((c) => !isWhitespace(c));
    const [lead, ...sections] = splitAt(nodes, "h2");

    tree.children = [
      ...lead,
      chipStrip(nodes),
      ...sections.map(([h2, ...body]) => {
        const id = slugOf(h2);
        const isTerms = body.some((n) => isElement(n, "h3") && /rental contract/i.test(textOf(n)));
        return isTerms ? termsSection(h2, id, body) : practicalSection(h2, id, body);
      }),
    ];
  };
}

// Practical stay info: each h3 topic becomes a card in a grid.
function practicalSection(h2, id, body) {
  const [intro, ...topics] = splitAt(body, "h3");
  for (const topic of topics) {
    for (const node of topic) {
      const t = textOf(node).trim();
      if (isElement(node, "p") && /^check-(in|out):/i.test(t)) {
        node.properties = { ...node.properties, className: ["policy-time"] };
        node.children = [icon("clock"), ...node.children];
      }
    }
  }
  return el("section", { className: ["policy-section"], id }, [
    h2,
    ...intro,
    el(
      "div",
      { className: ["policy-topics"] },
      topics.map((topic) => el("div", { className: ["policy-topic"] }, topic)),
    ),
  ]);
}

// Terms and conditions: contents list beside long-form prose.
function termsSection(h2, id, body) {
  const items = [];
  for (const node of body) {
    if (isElement(node, "h3")) {
      node.properties = { ...node.properties, id: slugOf(node) };
      items.push(
        el("li", {}, [el("a", { href: `#${slugOf(node)}` }, [text(textOf(node))])]),
      );
    }
    if (isElement(node, "p") && /^effective /i.test(textOf(node).trim())) {
      node.properties = { ...node.properties, className: ["policy-effective"] };
    }
  }
  return el("section", { className: ["policy-section", "policy-legal"], id }, [
    h2,
    el("nav", { className: ["policy-toc"], ariaLabel: "Policy contents" }, [
      el("p", { className: ["policy-toc-label"] }, [text("On this page")]),
      el("ol", {}, items),
    ]),
    el("div", { className: ["policy-legal-body"] }, body),
  ]);
}
