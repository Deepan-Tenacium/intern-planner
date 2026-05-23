"use client";

import { useSession } from "next-auth/react";

export function useIsManager(): boolean {
  const { data: session } = useSession();
  return (session?.user as any)?.role === "manager";
}
