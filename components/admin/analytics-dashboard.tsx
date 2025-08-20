"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Globe, Users, Clock, TrendingUp, BarChart3 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface LanguageStats {
  language: string
  flag: string
  count: number
  percentage: number
}

interface LatencyData {
  channel: string
  latency: number
  status: "good" | "warning" | "error"
}

export function AnalyticsDashboard() {
  const [languageStats, setLanguageStats] = useState<LanguageStats[]>([])
  const [latencyData, setLatencyData] = useState<LatencyData[]>([])
  const [realTimeStats, setRealTimeStats] = useState({
    activeUsers: 0,
    totalSessions: 0,
    avgSessionDuration: 0,
    peakConcurrency: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadAnalytics()

    // Set up real-time updates
    const interval = setInterval(loadAnalytics, 30000) // Update every 30s
    return () => clearInterval(interval)
  }, [])

  const loadAnalytics = async () => {
    try {
      await Promise.all([loadLanguageStats(), loadLatencyData(), loadRealTimeStats()])
    } catch (error) {
      console.error("[v0] Error loading analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadLanguageStats = async () => {
    try {
      // Simulate language usage data (in production, this would come from actual usage logs)
      const mockLanguageStats: LanguageStats[] = [
        { language: "Português", flag: "🇧🇷", count: 1247, percentage: 45.2 },
        { language: "English", flag: "🇺🇸", count: 892, percentage: 32.3 },
        { language: "Español", flag: "🇪🇸", count: 456, percentage: 16.5 },
        { language: "Français", flag: "🇫🇷", count: 123, percentage: 4.5 },
        { language: "Libras", flag: "🤟", count: 42, percentage: 1.5 },
      ]

      setLanguageStats(mockLanguageStats)
    } catch (error) {
      console.error("[v0] Error loading language stats:", error)
    }
  }

  const loadLatencyData = async () => {
    try {
      // Simulate latency monitoring data
      const mockLatencyData: LatencyData[] = [
        { channel: "PT-BR → EN-US", latency: 45, status: "good" },
        { channel: "PT-BR → ES-ES", latency: 52, status: "good" },
        { channel: "EN-US → PT-BR", latency: 78, status: "warning" },
        { channel: "PT-BR → Libras", latency: 125, status: "error" },
        { channel: "ES-ES → EN-US", latency: 38, status: "good" },
      ]

      setLatencyData(mockLatencyData)
    } catch (error) {
      console.error("[v0] Error loading latency data:", error)
    }
  }

  const loadRealTimeStats = async () => {
    try {
      // Get real session data from Supabase
      const { data: sessions, error } = await supabase.from("user_sessions").select("*").is("left_at", null) // Active sessions

      if (error) throw error

      // Calculate stats
      const activeUsers = sessions?.length || 0
      const totalSessions = sessions?.length || 0

      // Simulate other metrics
      const avgSessionDuration = Math.floor(Math.random() * 120) + 30 // 30-150 minutes
      const peakConcurrency = Math.floor(activeUsers * 1.3) // 30% higher than current

      setRealTimeStats({
        activeUsers,
        totalSessions,
        avgSessionDuration,
        peakConcurrency,
      })
    } catch (error) {
      console.error("[v0] Error loading real-time stats:", error)
    }
  }

  const getLatencyColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-400"
      case "warning":
        return "text-yellow-400"
      case "error":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getLatencyBadge = (status: string) => {
    switch (status) {
      case "good":
        return "default"
      case "warning":
        return "secondary"
      case "error":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Carregando analytics...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Analytics e Monitoramento</h2>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Users className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-300">Usuários Ativos</p>
                <p className="text-2xl font-bold text-white">{realTimeStats.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-300">Total Sessões</p>
                <p className="text-2xl font-bold text-white">{realTimeStats.totalSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-300">Duração Média</p>
                <p className="text-2xl font-bold text-white">{realTimeStats.avgSessionDuration}min</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-300">Pico Concorrência</p>
                <p className="text-2xl font-bold text-white">{realTimeStats.peakConcurrency}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language Heatmap */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Heatmap de Idiomas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {languageStats.map((lang, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-white font-medium">{lang.language}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-bold">{lang.count}</span>
                      <span className="text-gray-400 text-sm ml-2">({lang.percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${lang.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Latency Monitoring */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Monitoramento de Latência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {latencyData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{item.channel}</p>
                    <p className="text-gray-400 text-sm">Canal de Tradução</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getLatencyColor(item.status)}`}>{item.latency}ms</p>
                    <Badge variant={getLatencyBadge(item.status) as any} className="text-xs">
                      {item.status === "good" ? "Ótimo" : item.status === "warning" ? "Atenção" : "Crítico"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Métricas de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">99.8%</div>
              <p className="text-gray-300">Uptime do Sistema</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">47ms</div>
              <p className="text-gray-300">Latência Média</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">2.1s</div>
              <p className="text-gray-300">Tempo de Conexão</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
