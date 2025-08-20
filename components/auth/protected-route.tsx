"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
  redirectTo?: string
}

export function ProtectedRoute({ children, allowedRoles = [], redirectTo = "/login" }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push(redirectTo)
          return
        }

        // If no specific roles required, just check if authenticated
        if (allowedRoles.length === 0) {
          setAuthorized(true)
          setLoading(false)
          return
        }

        // Check user role
        const { data: profile } = await supabase.from("users").select("role").eq("id", session.user.id).single()

        if (profile && allowedRoles.includes(profile.role)) {
          setAuthorized(true)
        } else {
          // Redirect based on user role
          switch (profile?.role) {
            case "SUPER_ADMIN":
            case "ADMIN":
              router.push("/admin")
              break
            case "TRANSLATOR":
              router.push("/translator")
              break
            default:
              router.push("/")
              break
          }
        }
      } catch (error) {
        console.error("[v0] Auth check error:", error)
        router.push(redirectTo)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push(redirectTo)
      }
    })

    return () => subscription.unsubscribe()
  }, [allowedRoles, redirectTo, router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return <>{children}</>
}
