---
name: playwright-testing
description: Use this skill when asked to test a 
  feature, verify a page works, check if something 
  is broken, run a browser test, or use Playwright 
  to interact with the intern planner app. 
  Triggers on phrases like: "test", "verify", 
  "check if", "does X work", "run a test for", 
  "use playwright", "browser test", "smoke test",
  "end to end test", "e2e test".
---

# Playwright Testing Skill

## App Context
This skill is for testing the Intern Resource Planner
at http://localhost:3000

The app must be running before any tests:
docker compose up -d (from project root)

## Pages and URLs
/ → Dashboard (stat tiles, workload snapshot, recent allocations)
/interns → Intern grid with filter bar and New Intern button
/interns/[id] → Intern profile (skills, allocations, calendar)
/projects → Project cards with filter bar and New Project button
/allocations → Allocation table with search and filters
/workload → Workload bars sorted by load status
/skills-gap → Skills gap analysis per project
/timeline → Gantt chart of all projects

## Key UI Patterns
- Sidebar: fixed left, 240px wide, has 5 nav links
- Stat tiles: show numbers with labels below
- Cards: dark bg #1a1d27, border #2a2d3a
- Slide-in panels: appear from right, overlay behind
- Toasts: appear bottom-right, green=success red=error
- Load dots: green under 30h, amber 30-40h, red over 40h
- Filters: pill buttons at top of pages

## Common Selectors
New Intern button: getByRole("button", {name: /new intern/i})
New Project button: getByRole("button", {name: /new project/i})
Nav links: getByRole("link", {name: "Page Name"})
Intern cards: locator("a[href^='/interns/']")
Toast success: getByText("successfully")
Toast error: getByText("Failed")
Search input: getByPlaceholder(/search/i)
Cancel button: getByRole("button", {name: /cancel/i})

## How To Test With Playwright MCP

### For every test session:
1. Confirm docker compose is running before starting
2. Navigate to the relevant page
3. Wait for loading to complete (no spinners visible)
4. Interact with the feature being tested
5. Verify the expected outcome
6. Check for console errors
7. Take a screenshot and save to test-screenshots/

### For testing a CREATE flow:
1. Navigate to the page
2. Click the New [Thing] button
3. Verify the panel slides in
4. Fill in all required fields
5. Click submit
6. Verify toast appears saying "successfully"
7. Verify the new item appears in the list
8. Navigate away and back to verify persistence

### For testing a DELETE flow:
1. Find the item to delete
2. Click the delete/trash icon
3. Verify confirmation appears
4. Confirm the deletion
5. Verify toast appears
6. Verify item is gone from the list

### For testing navigation:
1. Click the nav link
2. Verify URL changed correctly
3. Verify page heading is visible
4. Verify no error messages appear
5. Verify the sidebar still shows correctly

### For testing filters:
1. Note how many items are visible
2. Click a filter
3. Verify count changed
4. Verify only matching items show
5. Click clear/all filter
6. Verify all items return

## Rules — Always Follow These

### Must always do:
- Wait for the page to fully load before interacting
  (no loading spinners, no "Loading..." text)
- Check for console errors after every page navigation
- Take a screenshot after every significant action
  Save to: test-screenshots/[feature]-[action].png
- Verify toasts appear after create/update/delete
- Report PASS or FAIL clearly at the end

### Must never do:
- Never assume a test passed without verifying
- Never interact with elements before they are visible
- Never skip the console error check
- Never use hard-coded wait times (waitForTimeout)
  unless absolutely necessary — use waitForSelector instead
- Never report a test as passing if there were 
  any console errors

### When a test fails:
- Take a screenshot immediately
- Report the exact error message
- Report which step failed
- Suggest what might be wrong
- Do NOT try to fix the app code — only report

## How To Report Results

After every test session report results like this:

---
TEST RESULTS: [Feature Name]
Date: [today]
Status: PASSED / FAILED / PARTIAL

Tests run:
Passed - [test name] — [what was verified]
Failed - [test name] — [what failed and why]
Warnings - [test name] — [passed but with warnings]

Screenshots saved:
- test-screenshots/[name].png

Console errors found:
- [list any errors, or "None"]

Recommendations:
- [anything that looks wrong or should be fixed]
---