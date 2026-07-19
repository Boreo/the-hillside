import { test, expect } from "@playwright/test";

test("gallery viewer opens on thumbnail click, cycles and closes", async ({ page }) => {
  await page.goto("/gallery/");
  const links = page.locator(".gallery-grid a.lightbox-open");
  const count = await links.count();
  expect(count).toBeGreaterThan(6);

  const viewer = page.locator(".gallery-viewer");
  await expect(viewer).not.toBeVisible();

  await links.first().click();
  await expect(viewer).toBeVisible();
  await expect(viewer.locator(".viewer-counter")).toHaveText(`1 / ${count}`);
  const firstAlt = await links.first().locator("img").getAttribute("alt");
  await expect(viewer.locator(".viewer-caption")).toHaveText(firstAlt!);

  await viewer.locator(".viewer-next").click();
  await expect(viewer.locator(".viewer-counter")).toHaveText(`2 / ${count}`);

  // Prev from the first photo wraps to the last.
  await viewer.locator(".viewer-prev").click();
  await viewer.locator(".viewer-prev").click();
  await expect(viewer.locator(".viewer-counter")).toHaveText(`${count} / ${count}`);

  await viewer.locator(".viewer-close").click();
  await expect(viewer).not.toBeVisible();
});

test("gallery viewer arrow keys navigate", async ({ page }) => {
  await page.goto("/gallery/");
  const count = await page.locator(".gallery-grid a.lightbox-open").count();
  await page.locator(".gallery-grid a.lightbox-open").first().click();
  const counter = page.locator(".viewer-counter");
  await page.keyboard.press("ArrowRight");
  await expect(counter).toHaveText(`2 / ${count}`);
  await page.keyboard.press("ArrowLeft");
  await expect(counter).toHaveText(`1 / ${count}`);
});

test("book page carries the embed container and direct-booking note", async ({ page }) => {
  await page.goto("/book/");
  await expect(page.locator(".book-note")).toContainText("House and Villa");
  await expect(page.locator(".ibe")).toHaveCount(1);
});

test("404 page renders with nav back home", async ({ page }) => {
  const response = await page.goto("/definitely-not-a-page/");
  expect(response!.status()).toBe(404);
  await expect(page.locator("main a.btn[href='/']")).toBeVisible();
});
