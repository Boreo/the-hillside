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
    bathrooms: z.number().int().positive(),
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

// Scannable place cards (walks, lookouts, markets) for area-guide pages.
// Facts (distance, drive time, schedule) live here as data, matching the
// dwelling-facts rule: prose should not restate these numbers.
const placeGroupSchema = ({ image }: SchemaContext) =>
  z.object({
    heading: z.string().min(1),
    intro: z.string().min(1).optional(),
    places: z
      .array(
        z.object({
          name: z.string().min(1),
          facts: z
            .array(
              z.object({
                icon: z.enum(["walk", "car", "calendar"]),
                label: z.string().min(1),
              }),
            )
            .default([]),
          tag: z.string().min(1).optional(),
          blurb: z.string().min(1),
          link: z
            .object({
              href: z.string().min(1),
              label: z.string().min(1),
            })
            .optional(),
          image: z
            .object({
              src: image(),
              alt: z.string().min(1),
            })
            .optional(),
        }),
      )
      .min(1),
  });

// Treatment menu cards (mobile massage page). Same card treatment as
// placeGroups: duration/price facts as data, pressure as the chip, so
// prose never restates the numbers.
const treatmentGroupSchema = z.object({
  heading: z.string().min(1),
  intro: z.string().min(1).optional(),
  treatments: z
    .array(
      z.object({
        name: z.string().min(1),
        facts: z
          .array(
            z.object({
              icon: z.enum(["clock"]),
              label: z.string().min(1),
            }),
          )
          .default([]),
        tag: z.string().min(1).optional(),
        blurb: z.string().min(1).optional(),
        addons: z.string().min(1).optional(),
      }),
    )
    .min(1),
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
      // Restructure the body as an FAQ page (rehype-faq-page.mjs) and emit
      // FAQPage JSON-LD from its h3 questions (h2s are topic groups).
      faqSchema: z.boolean().default(false),
      // Restructure the body as the guest-info policy page
      // (rehype-policy-page.mjs): chip strip, topic cards, numbered terms.
      policyPage: z.boolean().default(false),
      placeGroups: z.array(placeGroupSchema(ctx)).min(1).optional(),
      treatmentGroups: z.array(treatmentGroupSchema).min(1).optional(),
      // Fine-print lines rendered after the card groups (e.g. the
      // massage oil ingredients note).
      notes: z.array(z.string().min(1)).min(1).optional(),
      // Prominent outbound links (e.g. local visitor guides) rendered as
      // outline buttons after the place groups.
      moreLinks: z
        .object({
          intro: z.string().min(1).optional(),
          links: z
            .array(
              z.object({
                href: z.string().min(1),
                label: z.string().min(1),
              }),
            )
            .min(1),
        })
        .optional(),
      // Button rendered after the place groups, since the groups render
      // below the markdown body.
      closingCta: z
        .object({
          label: z.string().min(1),
          href: z.string().startsWith("/"),
        })
        .optional(),
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
    location: z.string().min(1).optional(),
  }),
});

const reviewSources = defineCollection({
  loader: file("src/content/review-sources.yaml"),
  schema: z.object({
    platform: z.string().min(1),
    rating: z.number().positive().nullable(),
    scale: z.union([z.literal(5), z.literal(10)]),
    count: z.number().int().positive().nullable(),
    url: z.string().startsWith("https://"),
  }),
});

export const collections = { pages, gallery, reviews, reviewSources };
