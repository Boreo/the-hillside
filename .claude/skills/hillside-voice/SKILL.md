---
name: hillside-voice
description: Use when writing, rewriting, or humanizing any guest-facing copy for The Hillside Retreat — page prose in src/content/pages/, homepage frontmatter copy, alt text, meta descriptions, booking CTAs, guest emails, or policy text. Also use when the humanizer skill runs on this project's content: this profile is the voice sample to match, overriding the user's personal voice profile.
---

# The Hillside Retreat — site voice

Derived from the owner's Squarespace copy (`archive/squarespace/extracted/`). The speakers are the owners themselves, a couple hosting guests at their own home — not a marketing agency and not the developer. When humanizing this site's copy, match THIS voice, not `~/.claude/skills/voice/SKILL.md`.

The old copy mixes two strands: a genuine host voice worth keeping, and Squarespace-era promotional filler that reads as AI slop. Keep the first, never reproduce the second.

## The genuine voice (keep and imitate)

1. **First-person-plural host.** "We're delighted to offer…", "We can't wait to welcome you", "Our commitment to cleanliness". The owners address the guest directly as "you"/"your stay". Never third-person brand voice ("The Hillside Retreat offers…") in body prose — that register is only for policy/terms text.
2. **Courteous, slightly formal hospitality idiom.** "Please do not hesitate to get in touch", "we'll be delighted to help with availability, pricing, and any special requests". Warmer and more formal than contemporary web copy; keep it. Exclamation marks: none in the corpus, use none.
3. **Precise specs, stated plainly.** 60" flat screen TV, 7.3 kW Type 2 charger, sleeps up to 8 across 4 bedrooms, 30 minutes to Surfers Paradise, $150 cancellation fee, check-in 2.00pm. Concrete numbers carry the selling; give the number, not an adjective.
4. **Amenity lists as fragments.** Bulleted noun phrases, no verbs, capitalised appliance names: "Wood burning fireplace.", "Bed linen and towels supplied." Keep that shape in any comprises/facts list.
5. **Practical guest-first asides.** "Stay fresh and wrinkle-free throughout your visit", "wake to a fully charged car", "everyone can be together without being on top of each other". One small human touch per section, tied to a concrete amenity — this is the best of the corpus.
6. **British-flavoured Australian vocabulary.** Hob, shower room, fitted kitchen, walk-in wardrobe, verandah, whilst, al fresco. Keep these terms. Spelling: standardise to Australian English (-ise; cosy not cozy, savour not savor, tranquillity not tranquility) — the corpus drifts American and the drift is an artefact, not the voice.
7. **Policy register is plain and firm.** House rules and terms drop all warmth: "Smoking is not allowed inside the dwelling.", "Parties/events are not allowed", "Sadly, we cannot accept any leaver bookings." A single softener ("We want you to enjoy your stay but…") then the rule. Don't cushion rules with hospitality language.
8. **Contact CTAs name the channel.** Real email and phone number in the sentence ("Contact us at stay@thehillside.com.au or on 0466 990 185"), not "reach out today".

## Corpus slop (never reproduce, cut on sight)

The old copy also contains exactly the patterns the humanizer exists to remove. Treat these as defects even though they appear in the source:

- Stacked scene-setting openers: "Nestled in the serene embrace of nature", "Nestled in the heart of", "captivating destination". One "secluded" or "tranquil" per page is brand vocabulary; three per paragraph is slop.
- Grandiose formulas: "the epitome of hillside luxury", "pièce de résistance", "where love and tranquility intertwine", "let the magic of this destination be the backdrop".
- Adjective stacks with no fact attached: "unforgettable experience and vista amidst the stunning landscapes", "enchanted and inspired", "serenity and sophistication".
- Rule-of-three tourism boilerplate: "Whether you're seeking relaxation, adventure, or simply a break from the ordinary", "where nature, culture, and relaxation converge in perfect harmony".
- Repeated template sentences ("The interior is tastefully and neutrally decorated…" appears verbatim on two pages). Each page says a thing once, its own way.

Load-bearing brand vocabulary that survives (sparingly, ~once each per page): secluded, tranquil, hinterland, breathtaking views, retreat, "hidden Hinterland gem".

## Calibration pair

Slop (from the corpus): "Discover the epitome of hillside luxury with our stunning 3-bedroom accommodation option Hillside House. Nestled in the serene embrace of nature, this retreat offers a haven of tranquility."

Voice (also from the corpus, lightly standardised): "This spacious 3 bedroom family home has breathtaking views of the coastline and Guanaba Valley. A large wrap around verandah with seating and gas BBQ provides the perfect spot for dining al fresco."

## Hard rules

- Owner-supplied wording (issues, emails) is raw material: polish it into this voice — fix grammar and spelling, trim repetition — while keeping his facts and any distinctive phrasing. Existing page copy is only rewritten when the change request touches it.
- Dwelling numbers (sleeps, bedrooms) live in `dwelling:` frontmatter, not prose — don't restate them when writing page prose.
- No em dashes, no "That said", no negative parallelisms, no summary closers — the humanizer skill's pattern list applies on top of this profile.
- Alt text: literal and specific ("Wraparound verandah with outdoor dining table overlooking the Guanaba Valley"), never promotional.
