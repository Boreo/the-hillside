import { test, expect } from "@playwright/test";

test("dwelling card facts lines carry sleeps/bedrooms icons", async ({ page }) => {
  await page.goto("/");
  const factsLines = page.locator(".dwellings .facts-line");
  await expect(factsLines).toHaveCount(3); // two cards + combined
  for (const line of await factsLines.all()) {
    await expect(line.locator("svg.fact-icon")).toHaveCount(2);
    await expect(line).toContainText(/Sleeps \d/);
    await expect(line).toContainText(/bedroom/i);
  }
});

test("review band shows three attributed quotes and links to reviews", async ({ page }) => {
  await page.goto("/");
  const band = page.locator(".review-band");
  await expect(band).toHaveCount(1);
  const quotes = band.locator("blockquote");
  await expect(quotes).toHaveCount(3);
  for (const q of await quotes.all()) {
    await expect(q.locator("footer")).toContainText(/—\s.+,\s.+/);
  }
  await expect(band.locator('a[href="/reviews/"]')).toHaveCount(1);
});
