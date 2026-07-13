import { test, expect, type Locator } from "@playwright/test";
import { DEMO_MODE } from "../src/consts";

const isMobile = (projectName: string) => projectName === "mobile";

// Demo mode strips hrefs from links outside the demo, so child-navigation
// tests can't run against a demo build.
const skipIfDisabled = async (link: Locator) => {
  test.skip(DEMO_MODE && (await link.getAttribute("aria-disabled")) === "true", "link disabled in demo mode");
};

test("accommodation anchor target exists on homepage", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#accommodation")).toHaveCount(1);
});

test("dropdown children link to the right pages", async ({ page }) => {
  await page.goto("/");
  const accomMenu = page.locator(".nav-drop", { hasText: "Accommodation" }).locator(".drop-menu");
  await expect(accomMenu.locator("a")).toHaveText([
    "Hillside House",
    "Hillside Villa",
    "House & Villa",
  ]);
});

test("desktop: hover opens menu, click on parent follows anchor", async ({ page }, testInfo) => {
  test.skip(isMobile(testInfo.project.name), "desktop only");
  await page.goto("/");
  const drop = page.locator(".nav-drop", { hasText: "Accommodation" });
  const menu = drop.locator(".drop-menu");

  await expect(menu).toBeHidden();
  await drop.locator(".nav-parent").hover();
  await expect(menu).toBeVisible();

  await drop.locator(".nav-parent").click();
  await expect(page).toHaveURL(/\/#accommodation$/);
});

test("desktop: menu stays open crossing gap and child navigates", async ({ page }, testInfo) => {
  test.skip(isMobile(testInfo.project.name), "desktop only");
  await page.goto("/");
  const drop = page.locator(".nav-drop", { hasText: "Your Stay" });
  await drop.locator(".nav-parent").hover();
  const link = drop.locator(".drop-menu a", { hasText: "Location" });
  await skipIfDisabled(link);
  await link.hover();
  await link.click();
  await expect(page).toHaveURL(/\/location\/$/);
});

test("mobile: first tap opens menu without navigating, second tap follows anchor", async ({ page }, testInfo) => {
  test.skip(!isMobile(testInfo.project.name), "mobile only");
  await page.goto("/");
  const drop = page.locator(".nav-drop", { hasText: "Accommodation" });
  const parent = drop.locator(".nav-parent");
  const menu = drop.locator(".drop-menu");

  await expect(menu).toBeHidden();
  await parent.tap();
  await expect(menu).toBeVisible();
  await expect(page).toHaveURL(/\/$/); // no navigation on first tap

  await parent.tap();
  await expect(page).toHaveURL(/\/#accommodation$/);
});

test("mobile: tapping a child link navigates", async ({ page }, testInfo) => {
  test.skip(!isMobile(testInfo.project.name), "mobile only");
  await page.goto("/");
  const drop = page.locator(".nav-drop", { hasText: "Accommodation" });
  await drop.locator(".nav-parent").tap();
  const villa = drop.locator(".drop-menu a", { hasText: "Hillside Villa" });
  await skipIfDisabled(villa);
  await villa.tap();
  await expect(page).toHaveURL(/\/hillside-villa\/$/);
});

test("mobile: tapping elsewhere closes an open menu", async ({ page }, testInfo) => {
  test.skip(!isMobile(testInfo.project.name), "mobile only");
  await page.goto("/");
  const drop = page.locator(".nav-drop", { hasText: "Accommodation" });
  const menu = drop.locator(".drop-menu");
  await drop.locator(".nav-parent").tap();
  await expect(menu).toBeVisible();
  await page.locator("h1").first().tap();
  await expect(menu).toBeHidden();
});

test("mobile: opening one dropdown closes the other", async ({ page }, testInfo) => {
  test.skip(!isMobile(testInfo.project.name), "mobile only");
  await page.goto("/");
  const accom = page.locator(".nav-drop", { hasText: "Accommodation" });
  const stay = page.locator(".nav-drop", { hasText: "Your Stay" });
  await accom.locator(".nav-parent").tap();
  await expect(accom.locator(".drop-menu")).toBeVisible();
  await stay.locator(".nav-parent").tap();
  await expect(stay.locator(".drop-menu")).toBeVisible();
  await expect(accom.locator(".drop-menu")).toBeHidden();
});
