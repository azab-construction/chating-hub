"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { UsageDashboard } from "@/components/analytics/usage-dashboard"
import { LoadingScreen } from "@/components/ui/loading-screen"

export default function Analytics() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return <LoadingScreen />
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <UsageDashboard />
      </div>
    </div>
  )
}
