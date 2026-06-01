import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { INTERNAL_API_URL } from "../../../lib/api";
import type { Session } from "next-auth";

function authHeader(session: Session | null): Record<string, string> {
  const token = session?.user?.backendToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function proxyRequest(
  request: Request,
  params: { path: string[] },
  method: string,
): Promise<Response> {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const path = params.path.join("/");
  const hasBody = method === "POST" || method === "PATCH";
  const url = new URL(request.url);

  const res = await fetch(`${INTERNAL_API_URL}/${path}${url.search}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeader(session),
    },
    ...(hasBody ? { body: JSON.stringify(await request.json()) } : {}),
  });

  if (res.status === 204) return new Response(null, { status: 204 });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}

export async function GET(request: Request, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params, "GET");
}

export async function POST(request: Request, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params, "POST");
}

export async function PATCH(request: Request, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params, "PATCH");
}

export async function DELETE(request: Request, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params, "DELETE");
}
