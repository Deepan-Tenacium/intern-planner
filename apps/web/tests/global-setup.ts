import { request, FullConfig } from "@playwright/test";
import path from "path";
import fs from "fs";

async function loginAs(
  email: string,
  password: string,
  savePath: string
): Promise<void> {
  // Use Playwright's API request context to log in via NextAuth directly,
  // bypassing the browser UI. This avoids race conditions between router.push
  // and the middleware session check that cause the UI flow to loop back to /login.
  const ctx = await request.newContext({ baseURL: "http://localhost:3000" });

  // Step 1: fetch the CSRF token NextAuth requires for credentials sign-in
  const csrfRes = await ctx.get("/api/auth/csrf");
  const { csrfToken } = await csrfRes.json();

  // Step 2: POST credentials to the NextAuth callback endpoint
  await ctx.post("/api/auth/callback/credentials", {
    form: {
      csrfToken,
      email,
      password,
      json: "true",
    },
  });

  // Step 3: Save cookies / localStorage as Playwright storage state
  await ctx.storageState({ path: savePath });
  await ctx.dispose();
}

export default async function globalSetup(_config: FullConfig): Promise<void> {
  const authDir = path.join(process.cwd(), "playwright", ".auth");
  fs.mkdirSync(authDir, { recursive: true });

  await loginAs(
    "manager@tenacium.com",
    "manager123",
    path.join(authDir, "manager.json")
  );

  await loginAs(
    "intern@tenacium.com",
    "intern123",
    path.join(authDir, "intern.json")
  );
}
