import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export const INTERNAL_API_URL = process.env.INTERNAL_API_URL ?? "http://api:8000";

export async function serverFetchHeaders(): Promise<Record<string, string>> {
  const session = await getServerSession(authOptions);
  const token = session?.user?.backendToken ?? "";
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}
