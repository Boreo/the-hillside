// Review lookup and attribution wording shared by PullQuote.astro,
// ReviewBand.astro and reviews.astro.

import { getEntry } from "astro:content";

export async function getReview(id: string) {
  const review = await getEntry("reviews", id);
  if (!review) throw new Error(`Review ${id} not found in reviews.yaml`);
  return review.data;
}

export const attribution = ({ author, location }: { author: string; location?: string }) =>
  `— ${author}${location ? `, ${location}` : ""}`;
