"use client"

import { useEffect, useRef } from "react"
import { io, type Socket } from "socket.io-client"
import { useSession } from "next-auth/react"

export function useSocket() {
  const { data: session } = useSession()
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!session?.user?.id) return

    // إنشاء اتصال Socket.IO
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001", {
      auth: {
        userId: session.user.id,
      },
    })

    const socket = socketRef.current

    socket.on("connect", () => {
      console.log("Connected to server")
    })

    socket.on("disconnect", () => {
      console.log("Disconnected from server")
    })

    socket.on("error", (error) => {
      console.error("Socket error:", error)
    })

    return () => {
      socket.disconnect()
    }
  }, [session?.user?.id])

  return socketRef.current
}
