import type { Metadata } from "next";
import Sidebar from "./components/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Intern Resource Planner",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-surface text-slate-100 min-h-screen">
        <Sidebar />
        <main style={{ marginLeft: 240, minHeight: "100vh", padding: "32px 24px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
