import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface StatCardProps {
  title: string
  value: number
  Icon: LucideIcon
  iconBgColor: string
  iconColor: string
  loading: boolean
}

export function StatCard({ title, value, Icon, iconBgColor, iconColor, loading }: StatCardProps) {
  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 ${iconBgColor} rounded-lg`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div>
            <p className="text-sm text-gray-300">{title}</p>
            {loading ? (
              <Skeleton className="h-7 w-12 mt-1 bg-white/20" />
            ) : (
              <p className="text-2xl font-bold text-white">{value}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}