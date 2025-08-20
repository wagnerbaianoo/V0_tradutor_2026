import type React from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>{children}</ProtectedRoute>
}
