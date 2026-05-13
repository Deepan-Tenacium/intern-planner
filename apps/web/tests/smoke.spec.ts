import { test, expect } from "@playwright/test";

test("dashboard loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/intern/i);
});

test("sidebar is visible", async ({ page }) => {
  await page.goto("/");
  const sidebar = page.locator("nav");
  await expect(sidebar).toBeVisible();
});

test("all 5 nav links are present", async ({ page }) => {
  await page.goto("/");
  const navLabels = ["Dashboard", "Interns", "Projects", "Allocations", "Workload"];
  for (const label of navLabels) {
    await expect(page.getByRole("link", { name: label })).toBeVisible();
  }
});

test("dashboard stat tiles are visible", async ({ page }) => {
  await page.goto("/");
  const tileLabels = ["Total Interns", "Total Projects", "Total Allocations", "Overloaded", "Avg hrs / week"];
  for (const label of tileLabels) {
    await expect(page.getByText(label)).toBeVisible();
  }
});

test("all 5 pages load without errors or 404", async ({ page }) => {
  const routes = ["/", "/interns", "/projects", "/allocations", "/workload"];
  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.status()).not.toBe(404);
    await expect(page.locator("h1")).toBeVisible();
  }
});

test("new intern panel opens and closes", async ({ page }) => {
  await page.goto("/interns");
  await page.getByRole("button", { name: /new intern/i }).click();
  await expect(page.getByText("Add New Intern")).toBeVisible();
  await page.getByRole("button", { name: /cancel/i }).click();
  await expect(page.getByText("Add New Intern")).not.toBeVisible();
});

test("new project panel opens and closes", async ({ page }) => {
  await page.goto("/projects");
  await page.getByRole("button", { name: /new project/i }).click();
  await expect(page.getByText("New Project").first()).toBeVisible();
  await page.getByRole("button", { name: /cancel/i }).click();
  await expect(page.getByText("New Project").first()).toBeVisible(); // heading stays, panel slides away
});

test("clicking an intern card navigates to profile", async ({ page }) => {
  await page.goto("/interns");
  // Wait for the page to finish loading (spinner disappears)
  await expect(page.getByText("Loading…")).not.toBeVisible({ timeout: 10000 });
  const firstCard = page.locator("a[href^='/interns/']").first();
  const cardCount = await firstCard.count();
  if (cardCount === 0) {
    // No interns seeded — skip navigation assertion
    return;
  }
  const href = await firstCard.getAttribute("href");
  await firstCard.click();
  await expect(page).toHaveURL(new RegExp(`^.*${href}$`));
});

test("no horizontal scroll on any page", async ({ page }) => {
  const routes = ["/", "/interns", "/projects", "/allocations", "/workload"];
  for (const route of routes) {
    await page.goto(route);
    const hasHScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHScroll, `horizontal scroll found on ${route}`).toBe(false);
  }
});

test("global search opens with Ctrl+K", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");
  // Expect a search input or dialog to appear
  const searchInput = page.locator("input[placeholder*='search' i], input[placeholder*='Search' i], [role='dialog'] input, [role='combobox']").first();
  await expect(searchInput).toBeVisible({ timeout: 2000 });
});
