"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, Shield, Mic } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        return
      }

      if (authData.user) {
        // Get user profile with role
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("role")
          .eq("id", authData.user.id)
          .single()

        if (profileError) {
          // Create profile if it doesn't exist
          const { error: insertError } = await supabase.from("users").insert({
            id: authData.user.id,
            email: authData.user.email,
            name: authData.user.user_metadata?.name || authData.user.email?.split("@")[0],
            role: "USER",
          })

          if (insertError) {
            setError("Erro ao criar perfil do usuário")
            return
          }

          // Default to user dashboard for new users
          router.push("/")
          return
        }

        // Redirect based on role
        switch (profile.role) {
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
    } catch (err) {
      setError("Erro inesperado durante o login")
      console.error("[v0] Login error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">TranslateEvent</CardTitle>
          <CardDescription className="text-slate-300">Faça login para acessar o sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                placeholder="seu@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <Alert className="bg-red-500/20 border-red-500/50">
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/20">
            <div className="text-center text-sm text-slate-300 mb-4">Tipos de Acesso:</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex flex-col items-center p-2 bg-white/5 rounded-lg">
                <Shield className="w-4 h-4 mb-1 text-blue-400" />
                <span className="text-slate-300">Admin</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-white/5 rounded-lg">
                <Mic className="w-4 h-4 mb-1 text-green-400" />
                <span className="text-slate-300">Tradutor</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-white/5 rounded-lg">
                <User className="w-4 h-4 mb-1 text-purple-400" />
                <span className="text-slate-300">Usuário</span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Button variant="link" onClick={() => router.push("/")} className="text-slate-300 hover:text-white">
              Voltar para página inicial
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
