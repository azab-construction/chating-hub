"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { SettingsPage } from "@/components/settings/settings-page"
import { LoadingScreen } from "@/components/ui/loading-screen"

export default function Settings() {
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

  return <SettingsPage />
}
