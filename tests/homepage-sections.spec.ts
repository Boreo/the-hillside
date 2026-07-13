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
