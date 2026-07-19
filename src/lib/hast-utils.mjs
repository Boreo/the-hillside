// Shared hast helpers for the rehype plugins in this directory.

import { FACT_ICON_PATHS } from "./fact-icon-paths.mjs";

export const isElement = (node, tag) => node.type === "element" && node.tagName === tag;

export const isWhitespace = (node) => node.type === "text" && !node.value.trim();

export const textOf = (node) => {
  if (node.type === "text") return node.value;
  return (node.children ?? []).map(textOf).join("");
};

export const slugOf = (node) =>
  textOf(node)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

export const el = (tagName, properties, children) => ({
  type: "element",
  tagName,
  properties,
  children,
});

export const text = (value) => ({ type: "text", value });

export const factIcon = (name) =>
  el("svg", { className: ["fact-icon"], viewBox: "0 0 256 256", ariaHidden: "true" }, [
    el("path", { fill: "currentColor", d: FACT_ICON_PATHS[name] }, []),
  ]);

// Split a node list into a leading chunk plus one chunk per heading of the
// given tag; each chunk is [heading, ...content up to the next heading].
export const splitAt = (nodes, tag) => {
  const chunks = [[]];
  for (const node of nodes) {
    if (isElement(node, tag)) chunks.push([]);
    chunks[chunks.length - 1].push(node);
  }
  return chunks;
};
