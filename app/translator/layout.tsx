import type React from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function TranslatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute allowedRoles={["TRANSLATOR"]}>{children}</ProtectedRoute>
}
