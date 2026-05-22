import type { Metadata } from "next";
import AppShell from "./components/AppShell";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Intern Resource Planner",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-surface text-slate-100 min-h-screen">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
