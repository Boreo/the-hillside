import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";

// Machine-readable facts for a bookable dwelling. Drives the facts strip on
// the page and Accommodation JSON-LD; prose should not restate these numbers.
const dwellingSchema = z.object({
  name: z.string(),
  sleeps: z.number().int().positive(),
  bedrooms: z.array(
    z.object({
      bed: z.enum(["queen", "king", "double", "twin"]),
      sleeps: z.number().int().positive().default(2),
      ensuite: z.boolean().default(false),
    }),
  ),
  amenities: z.array(z.string().min(1)),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    dwelling: dwellingSchema.optional(),
  }),
});

const gallery = defineCollection({
  loader: file("src/content/gallery.yaml"),
  schema: z.object({
    src: z.string().startsWith("/images/"),
    alt: z.string().min(1),
  }),
});

const reviews = defineCollection({
  loader: file("src/content/reviews.yaml"),
  schema: z.object({
    quote: z.string().min(1),
    author: z.string().min(1),
    location: z.string().min(1),
  }),
});

export const collections = { pages, gallery, reviews };
