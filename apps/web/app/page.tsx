"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { ChatInterface } from "@/components/chat/chat-interface"
import { LoadingScreen } from "@/components/ui/loading-screen"

export default function HomePage() {
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
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <ChatInterface />
      </main>
    </div>
  )
}
