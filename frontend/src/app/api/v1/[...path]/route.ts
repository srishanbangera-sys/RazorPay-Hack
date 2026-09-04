import { NextRequest, NextResponse } from "next/server";

// Dynamic candidate ports to probe for the backend
const CANDIDATE_PORTS = [8080, 8008, 8000];
let cachedWorkingBase: string | null = null;

async function getBackendBase(): Promise<string> {
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL.replace(/\/+$/, "");
  }

  // If cached working base is available and still healthy, reuse it
  if (cachedWorkingBase) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600);
      const res = await fetch(`${cachedWorkingBase}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.status === "healthy") {
          return cachedWorkingBase;
        }
      }
    } catch {
      cachedWorkingBase = null;
    }
  }

  // Probe candidates
  for (const port of CANDIDATE_PORTS) {
    const candidate = `http://127.0.0.1:${port}`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600);
      const res = await fetch(`${candidate}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        // Ensure it's our merchant backend and not external service
        if (data.status === "healthy") {
          cachedWorkingBase = candidate;
          return candidate;
        }
      }
    } catch {
      // Continue to next port
    }
  }

  // Default to port 8080 (which user preferred) or fallback to 8008
  return "http://127.0.0.1:8080";
}

async function handleProxy(req: NextRequest, pathSegments: string[]) {
  const base = await getBackendBase();
  const search = req.nextUrl.search;
  const targetUrl = `${base}/api/v1/${pathSegments.join("/")}${search}`;

  const headers = new Headers();
  req.headers.forEach((val, key) => {
    if (!["host", "connection", "content-length"].includes(key.toLowerCase())) {
      headers.set(key, val);
    }
  });

  const method = req.method;
  let body: BodyInit | undefined = undefined;
  if (method !== "GET" && method !== "HEAD") {
    body = await req.text();
  }

  try {
    const res = await fetch(targetUrl, {
      method,
      headers,
      body,
    });

    const contentType = res.headers.get("content-type") || "application/json";
    const data = await res.arrayBuffer();

    return new NextResponse(data, {
      status: res.status,
      headers: {
        "content-type": contentType,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        detail: `Failed to connect to merchant backend at ${base}. Please ensure uvicorn is running: 'uvicorn app.main:app --reload --port 8080'`,
        error: err?.message,
      },
      { status: 503 }
    );
  }
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handleProxy(req, params.path);
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handleProxy(req, params.path);
}

export async function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handleProxy(req, params.path);
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handleProxy(req, params.path);
}
