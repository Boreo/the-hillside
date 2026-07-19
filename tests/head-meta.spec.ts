import { test, expect } from "@playwright/test";

test("pages carry a canonical URL on the production domain", async ({ page }) => {
  await page.goto("/hillside-house/");
  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveAttribute(
    "href",
    "https://www.thehillside.com.au/hillside-house/",
  );
});

test("homepage canonical is the bare domain", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://www.thehillside.com.au/",
  );
});

test("pages carry Open Graph tags with an absolute image URL", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    "https://www.thehillside.com.au/",
  );
  const ogImage = await page
    .locator('meta[property="og:image"]')
    .getAttribute("content");
  expect(ogImage).toMatch(/^https:\/\/www\.thehillside\.com\.au\//);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
});
