// Facts-line numbers for dwellings presented combined (House & Villa).
// Shared by DwellingCards.astro and rehype-photo-runs.mjs so the combined
// sleeps/bedrooms/bathrooms are always derived the same way from the
// per-dwelling frontmatter.

/**
 * @param {{ sleeps: number, bedrooms: number, bathrooms: number }[]} facts
 */
export const sumFacts = (facts) =>
  facts.reduce(
    (sum, f) => ({
      sleeps: sum.sleeps + f.sleeps,
      bedrooms: sum.bedrooms + f.bedrooms,
      bathrooms: sum.bathrooms + f.bathrooms,
    }),
    { sleeps: 0, bedrooms: 0, bathrooms: 0 },
  );
