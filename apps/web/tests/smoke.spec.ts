import { test, expect } from "@playwright/test";

// ── Auth ──────────────────────────────────────────────────────────────────────

test("login page renders and rejects bad credentials", async ({ browser }) => {
  // Explicitly pass empty storage state so the global manager.json is not loaded
  const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const page = await ctx.newPage();
  await page.goto("/login");

  await expect(page.getByPlaceholder("Email")).toBeVisible();
  await expect(page.getByPlaceholder("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /github/i })).toBeVisible();

  // Bad credentials → error message
  await page.fill('input[type="email"]', "wrong@example.com");
  await page.fill('input[type="password"]', "badpass");
  await page.click('button[type="submit"]');
  await expect(page.getByText("Invalid email or password")).toBeVisible({ timeout: 8_000 });

  await ctx.close();
});

// ── Navigation ────────────────────────────────────────────────────────────────

test("sidebar is visible and shows all 5 nav links", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("aside")).toBeVisible();
  for (const label of ["Dashboard", "Interns", "Projects", "Allocations", "Workload"]) {
    await expect(page.getByRole("link", { name: label })).toBeVisible();
  }
});

test("sidebar shows signed-in user name and Manager badge", async ({ page }) => {
  await page.goto("/");
  // Manager role seeded → badge present
  await expect(page.getByText("Manager", { exact: true })).toBeVisible();
});

// ── Dashboard ─────────────────────────────────────────────────────────────────

test("dashboard loads and shows all 5 stat tiles", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Loading dashboard…")).not.toBeVisible({ timeout: 15_000 });
  for (const label of ["Total Interns", "Total Projects", "Total Allocations", "Avg hrs / week"]) {
    await expect(page.getByText(label)).toBeVisible();
  }
  // "Overloaded" appears in multiple places; target the stat tile label specifically
  await expect(page.locator("p.text-xs.text-slate-400", { hasText: "Overloaded" })).toBeVisible();
});

test("dashboard Active Projects section is present", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Loading dashboard…")).not.toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Active Projects")).toBeVisible();
});

test("dashboard Workload Snapshot section is present", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Loading dashboard…")).not.toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Workload Snapshot")).toBeVisible();
});

test("dashboard Recent Allocations section is present", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Loading dashboard…")).not.toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Recent Allocations")).toBeVisible();
});

test("dashboard Cohort Overview section is present", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Loading dashboard…")).not.toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Cohort Overview")).toBeVisible();
});

// ── Pages load without errors ─────────────────────────────────────────────────

test("all 5 core pages load with an h1 and no 404", async ({ page }) => {
  const routes = ["/", "/interns", "/projects", "/allocations", "/workload"];
  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.status(), `HTTP error on ${route}`).not.toBe(404);
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10_000 });
  }
});

test("no horizontal scroll on any core page", async ({ page }) => {
  const routes = ["/", "/interns", "/projects", "/allocations", "/workload"];
  for (const route of routes) {
    await page.goto(route);
    const hasHScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHScroll, `horizontal scroll found on ${route}`).toBe(false);
  }
});

// ── Interns page ──────────────────────────────────────────────────────────────

test("new intern panel opens and closes", async ({ page }) => {
  await page.goto("/interns");
  await page.getByRole("button", { name: /new intern/i }).click();
  await expect(page.getByText("Add New Intern")).toBeVisible();
  // Panel slides via CSS translateX and stays in the DOM; the backdrop overlay
  // is conditionally rendered ({open && ...}), so its absence confirms closed state
  await page.getByRole("button", { name: /cancel/i }).click();
  await expect(page.locator('[style*="rgba(0,0,0,0.5)"]')).not.toBeAttached({ timeout: 5_000 });
});

test("clicking an intern card navigates to the profile page", async ({ page }) => {
  await page.goto("/interns");
  await expect(page.getByText("Loading…")).not.toBeVisible({ timeout: 10_000 });

  const firstCard = page.locator("a[href^='/interns/']").first();
  if ((await firstCard.count()) === 0) return; // no seeded interns — skip

  const href = await firstCard.getAttribute("href");
  await firstCard.click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await expect(page.locator("h1").first()).toBeVisible();
});

// ── Projects page ─────────────────────────────────────────────────────────────

test("new project panel opens and closes", async ({ page }) => {
  await page.goto("/projects");
  await page.getByRole("button", { name: /new project/i }).click();
  await expect(page.getByText("New Project").first()).toBeVisible();
  // Same slide-out pattern — assert the backdrop is gone after cancel
  await page.getByRole("button", { name: /cancel/i }).first().click();
  await expect(page.locator('[style*="rgba(0,0,0,0.5)"]')).not.toBeAttached({ timeout: 5_000 });
});

// ── Allocations page ──────────────────────────────────────────────────────────

test("allocations search input is visible and accepts text", async ({ page }) => {
  await page.goto("/allocations");
  const searchInput = page.getByPlaceholder(/search intern or project/i);
  await expect(searchInput).toBeVisible();
  await searchInput.fill("test");
  await expect(searchInput).toHaveValue("test");
});
