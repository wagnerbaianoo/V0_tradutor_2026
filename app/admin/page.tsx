"use client"

<<<<<<< HEAD
import { useState, useEffect, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Badge } from "@/components/ui/Badge"
=======
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
>>>>>>> 00fbeb209c81f778312fc1a9d0e625ea8dc3373c
import { BarChart3, Users, Radio, Activity, Globe } from "lucide-react"
import { EventManagement } from "@/components/admin/event-management"
import { StreamManagement } from "@/components/admin/stream-management"
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard"
import { UserManagement } from "@/components/admin/user-management"
import { createClient } from "@/lib/supabase/client"
import { StatCard } from "@/components/admin/StatCard"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalStreams: 0,
    activeTranslators: 0,
    totalUsers: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

<<<<<<< HEAD
  const loadDashboardStats = useCallback(async () => {
=======
  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
>>>>>>> 00fbeb209c81f778312fc1a9d0e625ea8dc3373c
    try {
      const [eventsResult, streamsResult, translatorsResult, usersResult] = await Promise.all([
        supabase.from("events").select("id, is_active"),
        supabase.from("streams").select("id, enabled"),
        supabase.from("translation_channels").select("id, is_active"),
        supabase.from("users").select("id, role"),
      ])

      const events = eventsResult.data || []
      const streams = streamsResult.data || []
      const translators = translatorsResult.data || []
      const users = usersResult.data || []

      setStats({
        totalEvents: events.length,
        activeEvents: events.filter((e) => e.is_active).length,
        totalStreams: streams.length,
        activeTranslators: translators.filter((t) => t.is_active).length,
        totalUsers: users.length,
      })
    } catch (error) {
      console.error("[v0] Error loading dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadDashboardStats()
  }, [loadDashboardStats])

  const statCards = [
    {
      title: "Total Eventos",
      value: stats.totalEvents,
      Icon: BarChart3,
      iconBgColor: "bg-blue-500/20",
      iconColor: "text-blue-400",
    },
    {
      title: "Eventos Ativos",
      value: stats.activeEvents,
      Icon: Activity,
      iconBgColor: "bg-green-500/20",
      iconColor: "text-green-400",
    },
    { title: "Total Streams", value: stats.totalStreams, Icon: Radio, iconBgColor: "bg-purple-500/20", iconColor: "text-purple-400" },
    {
      title: "Tradutores Ativos",
      value: stats.activeTranslators,
      Icon: Globe,
      iconBgColor: "bg-orange-500/20",
      iconColor: "text-orange-400",
    },
    { title: "Total Usuários", value: stats.totalUsers, Icon: Users, iconBgColor: "bg-cyan-500/20", iconColor: "text-cyan-400" },
  ]

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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {statCards.map((card) => (
            <StatCard key={card.title} {...card} loading={loading} />
          ))}
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
