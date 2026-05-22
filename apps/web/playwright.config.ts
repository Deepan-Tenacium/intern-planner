import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  globalSetup: "./tests/global-setup",
  use: {
    baseURL: "http://localhost:3000",
    headless: false,
    screenshot: "only-on-failure",
    storageState: "playwright/.auth/manager.json",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
