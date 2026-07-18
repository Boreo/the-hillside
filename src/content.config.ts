import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob, file } from "astro/loaders";
import type { SchemaContext } from "astro:content";

// Machine-readable facts for a bookable dwelling. Drives the facts strip on
// the page and Accommodation JSON-LD; prose should not restate these numbers.
const dwellingSchema = ({ image }: SchemaContext) =>
  z.object({
    name: z.string(),
    hero: z.object({
      src: image(),
      alt: z.string().min(1),
    }),
    sleeps: z.number().int().positive(),
    bedrooms: z.array(
      z.object({
        bed: z.enum(["queen", "king", "double", "twin"]),
        sleeps: z.number().int().positive().default(2),
        ensuite: z.boolean().default(false),
      }),
    ),
    amenities: z.array(z.string().min(1)),
    // Combined House & Villa bookings are direct-only, so that page points its
    // header CTA at the contact page instead of the booking engine.
    cta: z
      .object({
        label: z.string().min(1),
        href: z.string().startsWith("/"),
      })
      .default({ label: "Book Direct", href: "/book/" }),
  });

// Homepage-only content: section copy, image picks, captions and the
// pull-quote id live here so all content edits stay in markdown.
const homepageSchema = ({ image }: SchemaContext) =>
  z.object({
    heroLine: z.string().min(1),
    arrival: z.array(z.string().min(1)).min(1).max(3),
    dwellings: z.array(
      z.object({
        slug: z.string(),
        href: z.string().startsWith("/"),
        image: z.object({
          src: image(),
          alt: z.string().min(1),
        }),
        line: z.string().min(1),
      }),
    ).length(2),
    combinedLine: z.string().min(1),
    photoBand: z.array(
      z.object({
        src: image(),
        alt: z.string().min(1),
        caption: z.string().min(1),
      }),
    ).length(3),
    pullQuote: z.object({
      reviewId: z.string(),
      excerpt: z.string().min(1),
    }),
    reviewBand: z.array(
      z.object({
        reviewId: z.string(),
        excerpt: z.string().min(1),
      }),
    ).length(3),
    closing: z.object({
      image: z.object({
        src: image(),
        alt: z.string().min(1),
      }),
      line: z.string().min(1),
    }),
  });

const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: (ctx) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      dwelling: dwellingSchema(ctx).optional(),
      heroVideo: z
        .object({
          src: z.string().startsWith("/videos/"),
          poster: ctx.image(),
        })
        .optional(),
      homepage: homepageSchema(ctx).optional(),
    }),
});

const gallery = defineCollection({
  loader: file("src/content/gallery.yaml"),
  schema: ({ image }) =>
    z.object({
      src: image(),
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
