import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import EventAccessForm from "@/components/event-access-form"

export default async function Home() {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If authenticated, redirect to events
  if (user) {
    redirect("/events")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-white mb-4 text-5xl font-extralight">{"Plurall Simutâneo"}</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Sistema de tradução simultânea para eventos em tempo real
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <EventAccessForm />
        </div>
      </div>
    </div>
  )
}
