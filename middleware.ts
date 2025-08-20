import { NextResponse, type NextRequest } from "next/server"

// A URL canônica do seu site em produção.
// Configure esta variável de ambiente no seu painel da Vercel.
const PRODUCTION_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://v0-repository-link-nu.vercel.app"

// Gera a lista de origens permitidas dinamicamente.
function getAllowedOrigins() {
  const origins = [PRODUCTION_URL, "http://localhost:3000"]

  // Adiciona a URL de preview da Vercel, se disponível.
  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`)
  }

  return origins
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin")
  const allowedOrigins = getAllowedOrigins()

  // Lida com requisições pre-flight (OPTIONS)
  if (request.method === "OPTIONS") {
    const headers = new Headers(request.headers)
    // Permite a origem da requisição se ela estiver na lista de permissões.
    if (origin && allowedOrigins.includes(origin)) {
      headers.set("Access-Control-Allow-Origin", origin)
    }
    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey, x-client-info")
    return new Response(null, { headers })
  }

  const response = NextResponse.next()

  // Adiciona o header CORS para as requisições principais.
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin)
  }

  return response
}

export const config = {
  matcher: "/api/:path*",
}