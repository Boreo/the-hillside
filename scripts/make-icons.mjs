// Regenerates the public/ favicon set from the emblem. Run: node scripts/make-icons.mjs
import sharp from "sharp";

const SRC = "src/assets/images/the-hillside-retreat-emblem.png";
const PAPER = "#faf8f4"; // --paper token; apple-touch-icon must be opaque

// The emblem is 468x512; pad onto a square canvas before resizing.
async function icon(size, out, { background, pad }) {
  const inner = Math.round(size * (1 - pad * 2));
  const emblem = await sharp(SRC)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background },
  })
    .composite([{ input: emblem, gravity: "centre" }])
    .png()
    .toFile(out);
  console.log("wrote", out);
}

await icon(192, "public/icon-192.png", { background: { r: 0, g: 0, b: 0, alpha: 0 }, pad: 0 });
await icon(512, "public/icon-512.png", { background: { r: 0, g: 0, b: 0, alpha: 0 }, pad: 0 });
await icon(180, "public/apple-touch-icon.png", { background: PAPER, pad: 0.1 });
