"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function HexLogo() {
  return (
    <svg width="48" height="48" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <polygon points="13,1 25,7 25,19 13,25 1,19 1,7" fill="none" stroke="#6366f1" strokeWidth="1.5" />
      <polygon points="13,6 20,10 20,16 13,20 6,16 6,10" fill="#6366f1" opacity="0.25" />
      <circle cx="13" cy="13" r="3" fill="#6366f1" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession({ required: false });

  useEffect(() => {
    if (status === "authenticated") router.replace("/");
  }, [status, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.ok) {
      router.push("/");
    } else {
      setError("Invalid email or password");
    }
  }

  async function handleGitHub() {
    setLoading(true);
    await signIn("github");
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm bg-nav border border-card-border rounded-2xl p-8 sm:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <HexLogo />
          </div>
          <h1 className="text-white text-xl font-bold">Intern Resource Planner</h1>
          <p className="text-slate-500 text-sm mt-1.5">Tenacium DC</p>
        </div>

        {/* Divider */}
        <div className="border-t border-card-border mb-7" />

        {/* Credentials form */}
        <form onSubmit={handleCredentials} className="flex flex-col gap-3.5">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="w-full px-3.5 py-2.5 bg-card border border-card-border rounded-lg text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:opacity-60"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="w-full px-3.5 py-2.5 bg-card border border-card-border rounded-lg text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:opacity-60"
          />

          {error && (
            <p role="alert" className="text-red-400 text-[13px]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-800 disabled:opacity-70 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-nav"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* OR divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 border-t border-card-border" />
          <span className="text-slate-500 text-xs">or</span>
          <div className="flex-1 border-t border-card-border" />
        </div>

        {/* GitHub button */}
        <button
          onClick={handleGitHub}
          disabled={loading}
          className="w-full py-2.5 bg-card border border-card-border hover:bg-[#252840] disabled:opacity-70 text-slate-100 text-sm font-medium rounded-lg flex items-center justify-center gap-2.5 transition-colors cursor-pointer disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-nav"
        >
          <GitHubIcon />
          Continue with GitHub
        </button>

        {/* Footer note */}
        <p className="text-slate-500 text-xs text-center mt-7">
          Contact your manager to request access
        </p>
      </div>
    </div>
  );
}
