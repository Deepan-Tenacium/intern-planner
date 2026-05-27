import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { INTERNAL_API_URL } from "../../../lib/api";
import type { Session } from "next-auth";

function authHeader(session: Session | null): Record<string, string> {
  const token = session?.user?.backendToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const path = params.path.join("/");
  const url = new URL(request.url);
  const res = await fetch(`${INTERNAL_API_URL}/${path}${url.search}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeader(session),
    },
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}

export async function POST(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const path = params.path.join("/");
  const body = await request.json();
  const res = await fetch(`${INTERNAL_API_URL}/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(session),
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}

export async function PATCH(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const path = params.path.join("/");
  const body = await request.json();
  const res = await fetch(`${INTERNAL_API_URL}/${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(session),
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}

export async function DELETE(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const path = params.path.join("/");
  const res = await fetch(`${INTERNAL_API_URL}/${path}`, {
    method: "DELETE",
    headers: authHeader(session),
  });

  if (res.status === 204) return new Response(null, { status: 204 });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}
