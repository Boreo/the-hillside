import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  // Uses the background dev server (`astro dev --background`, port 4321).
  use: { baseURL: "http://localhost:4321" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
