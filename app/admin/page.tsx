"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/Card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Badge } from "@/components/ui/Badge"
import { BarChart3, Users, Radio, Activity, Globe } from "lucide-react"
import EventManagement from "@/components/admin/EventManagement"
import StreamManagement from "@/components/admin/StreamManagement"
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard"
import UserManagement from "@/components/admin/UserManagement"
import { createClient } from "@/lib/supabase/client"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalStreams: 0,
    activeTranslators: 0,
    totalUsers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadDashboardStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadDashboardStats = async () => {
    try {
      setError(null)
      setLoading(true)
      const [
        { count: totalEvents },
        { count: activeEvents },
        { count: totalStreams },
        { count: activeTranslators },
        { count: totalUsers },
      ] = await Promise.all([
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("streams").select("*", { count: "exact", head: true }),
        supabase.from("translation_channels").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("users").select("*", { count: "exact", head: true }),
      ])

      setStats({
        totalEvents: totalEvents ?? 0,
        activeEvents: activeEvents ?? 0,
        totalStreams: totalStreams ?? 0,
        activeTranslators: activeTranslators ?? 0,
        totalUsers: totalUsers ?? 0,
      })
    } catch (error) {
      console.error("[v0] Error loading dashboard stats:", error)
      setError("Falha ao carregar as estatísticas. Tente recarregar a página.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Painel Administrativo</h1>
              <p className="text-gray-300">TranslateEvent V5 - Sistema de Gestão</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="default" className="bg-green-500/20 text-green-300">
                <Activity className="w-3 h-3 mr-1" />
                Sistema Online
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 text-red-300 border border-red-500/50 rounded-lg p-4 mb-8 flex items-center gap-3">
            <Activity className="w-5 h-5" />
            <div>
              <p className="font-bold">Ocorreu um Erro</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-300">Total Eventos</p>
                  <p className="text-2xl font-bold text-white">{loading ? "..." : stats.totalEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Activity className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-300">Eventos Ativos</p>
                  <p className="text-2xl font-bold text-white">{loading ? "..." : stats.activeEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Radio className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-300">Total Streams</p>
                  <p className="text-2xl font-bold text-white">{loading ? "..." : stats.totalStreams}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Globe className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-300">Tradutores Ativos</p>
                  <p className="text-2xl font-bold text-white">{loading ? "..." : stats.activeTranslators}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-300">Total Usuários</p>
                  <p className="text-2xl font-bold text-white">{loading ? "..." : stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-black/40 border-white/20">
            <TabsTrigger value="events" className="text-white data-[state=active]:bg-purple-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Eventos
            </TabsTrigger>
            <TabsTrigger value="streams" className="text-white data-[state=active]:bg-purple-600">
              <Radio className="w-4 h-4 mr-2" />
              Streams
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-purple-600">
              <Activity className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="users" className="text-white data-[state=active]:bg-purple-600">
              <Users className="w-4 h-4 mr-2" />
              Usuários
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="mt-6">
            <EventManagement onStatsUpdate={loadDashboardStats} />
          </TabsContent>

          <TabsContent value="streams" className="mt-6">
            <StreamManagement onStatsUpdate={loadDashboardStats} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserManagement onStatsUpdate={loadDashboardStats} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
