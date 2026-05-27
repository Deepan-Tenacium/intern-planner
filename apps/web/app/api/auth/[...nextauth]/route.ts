import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

const API_URL = process.env.INTERNAL_API_URL ?? "http://api:8000";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        let res: Response;
        try {
          res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
        } catch (err) {
          console.error("[NextAuth] Credentials fetch failed:", err);
          return null;
        }
        if (!res.ok) {
          console.error("[NextAuth] Credentials login failed:", res.status, await res.text());
          return null;
        }
        const { access_token } = await res.json();
        // Decode the JWT payload to get user info (no verification needed here —
        // the backend already validated the credentials before issuing it)
        const payload = JSON.parse(
          Buffer.from(access_token.split(".")[1], "base64url").toString()
        );
        return {
          id: String(payload.user_id),
          email: payload.email,
          name: payload.name ?? payload.email,
          role: payload.role,
          backendToken: access_token,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github") {
        // Exchange the GitHub OAuth code for our own backend JWT
        const res = await fetch(
          `${API_URL}/auth/github/callback?code=${account.providerAccountId}`,
          { method: "GET" }
        );
        // If backend returns a token, store it on the user object
        if (res.ok) {
          const { access_token } = await res.json();
          user.backendToken = access_token;
          const payload = JSON.parse(
            Buffer.from(access_token.split(".")[1], "base64url").toString()
          );
          user.role = payload.role;
        }
        // Allow sign in even if backend call failed — the session will just
        // lack a backendToken; the user will hit auth errors on API calls
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role;
        token.backendToken = user.backendToken;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.backendToken = token.backendToken;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  session: { strategy: "jwt" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
