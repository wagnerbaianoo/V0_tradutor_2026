import { NextResponse, type NextRequest } from "next/server"

const VERCEL_URL = process.env.VERCEL_URL
const PRODUCTION_URL = "https://v0-repository-link-git-main-portalcreattive-5042s-projects.vercel.app/" // <-- Substitua pelo seu domínio de produção

const allowedOrigins = VERCEL_URL
  ? [
      `https://${VERCEL_URL}`,
      `https://${PRODUCTION_URL}`,
      "http://localhost:3000",
    ]
  : [`https://${PRODUCTION_URL}`, "http://localhost:3000"]

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin")

  // Lida com requisições pre-flight (OPTIONS)
  if (request.method === "OPTIONS") {
    const headers = new Headers(request.headers)
    headers.set("Access-Control-Allow-Origin", origin || "*")
    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    return new Response(null, { headers })
  }

  const response = NextResponse.next()

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin)
  }

  return response
}

export const config = {
  matcher: "/api/:path*",
}