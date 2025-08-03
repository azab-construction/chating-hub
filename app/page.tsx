"use client"

import { useSession } from "next-auth/react"
import { Sidebar } from "@/components/layout/sidebar"
import { ChatInterface } from "@/components/chat/chat-interface"
import { LoadingScreen } from "@/components/ui/loading-screen"

export default function HomePage() {
  const { status } = useSession()

  if (status === "loading") {
    return <LoadingScreen />
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <ChatInterface />
      </main>
    </div>
  )
}
