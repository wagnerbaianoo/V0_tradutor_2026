import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Activity, BarChart3, Globe, Radio, Users } from "lucide-react"

export default function AdminLoading() {
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
              <Skeleton className="h-6 w-28 rounded-full bg-white/20" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[BarChart3, Activity, Radio, Globe, Users].map((Icon, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-500/20 rounded-lg">
                    <Icon className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-24 mb-2 bg-white/20" />
                    <Skeleton className="h-7 w-12 bg-white/20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="w-full">
          <div className="grid w-full grid-cols-4 bg-black/40 border-white/20 rounded-md p-1">
            <Skeleton className="h-10 w-full bg-white/20" />
            <Skeleton className="h-10 w-full bg-white/20" />
            <Skeleton className="h-10 w-full bg-white/20" />
            <Skeleton className="h-10 w-full bg-white/20" />
          </div>

          <div className="mt-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <Skeleton className="h-8 w-1/4 mb-4 bg-white/20" />
                <Skeleton className="h-40 w-full bg-white/20" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
