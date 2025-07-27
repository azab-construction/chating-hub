"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, UserPlus, Crown, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSocket } from "@/hooks/use-socket"

interface Participant {
  id: string
  name: string
  avatar?: string
  role: "owner" | "editor" | "viewer"
  isOnline: boolean
  cursor?: {
    x: number
    y: number
  }
}

interface CollaborativeChatProps {
  chatId: string
  isCollaborative?: boolean
  onToggleCollaboration: (enabled: boolean) => void
}

export function CollaborativeChat({ chatId, isCollaborative = false, onToggleCollaboration }: CollaborativeChatProps) {
  const { data: session } = useSession()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [isInviting, setIsInviting] = useState(false)

  const socket = useSocket()

  useEffect(() => {
    if (!socket || !isCollaborative) return

    // الانضمام إلى غرفة المحادثة
    socket.emit("join-chat", { chatId, userId: session?.user?.id })

    // الاستماع لتحديثات المشاركين
    socket.on("participants-updated", (updatedParticipants: Participant[]) => {
      setParticipants(updatedParticipants)
    })

    // الاستماع لحركة المؤشر
    socket.on("cursor-moved", ({ userId, cursor }: { userId: string; cursor: { x: number; y: number } }) => {
      setParticipants((prev) => prev.map((p) => (p.id === userId ? { ...p, cursor } : p)))
    })

    // تنظيف الاتصالات
    return () => {
      socket.off("participants-updated")
      socket.off("cursor-moved")
      socket.emit("leave-chat", { chatId, userId: session?.user?.id })
    }
  }, [socket, chatId, isCollaborative, session?.user?.id])

  // تتبع حركة المؤشر
  useEffect(() => {
    if (!socket || !isCollaborative) return

    const handleMouseMove = (e: MouseEvent) => {
      socket.emit("cursor-move", {
        chatId,
        userId: session?.user?.id,
        cursor: { x: e.clientX, y: e.clientY },
      })
    }

    document.addEventListener("mousemove", handleMouseMove)
    return () => document.removeEventListener("mousemove", handleMouseMove)
  }, [socket, chatId, isCollaborative, session?.user?.id])

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) return

    setIsInviting(true)
    try {
      const response = await fetch(`/api/chats/${chatId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: "editor",
        }),
      })

      if (response.ok) {
        setInviteEmail("")
        setShowInviteModal(false)
        // إشعار نجح الدعوة
      }
    } catch (error) {
      console.error("Error inviting user:", error)
    } finally {
      setIsInviting(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown size={12} className="text-yellow-500" />
      case "editor":
        return <UserPlus size={12} className="text-blue-500" />
      case "viewer":
        return <Eye size={12} className="text-gray-500" />
      default:
        return null
    }
  }

  return (
    <div className="flex items-center gap-4">
      {/* Toggle Collaboration */}
      <button
        onClick={() => onToggleCollaboration(!isCollaborative)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          isCollaborative
            ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200",
        )}
      >
        <Users size={16} />
        {isCollaborative ? "تعاوني" : "فردي"}
      </button>

      {/* Participants */}
      <AnimatePresence>
        {isCollaborative && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-2"
          >
            {/* Participants Avatars */}
            <div className="flex -space-x-2">
              {participants.slice(0, 3).map((participant) => (
                <motion.div
                  key={participant.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    "relative w-8 h-8 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center",
                    participant.isOnline ? "ring-2 ring-green-400" : "opacity-60",
                  )}
                  title={`${participant.name} (${participant.role})`}
                >
                  {participant.avatar ? (
                    <img
                      src={participant.avatar || "/placeholder.svg"}
                      alt={participant.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-medium text-gray-600">
                      {participant.name.charAt(0).toUpperCase()}
                    </span>
                  )}

                  {/* Role Badge */}
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                    {getRoleIcon(participant.role)}
                  </div>
                </motion.div>
              ))}

              {participants.length > 3 && (
                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">+{participants.length - 3}</span>
                </div>
              )}
            </div>

            {/* Invite Button */}
            <button
              onClick={() => setShowInviteModal(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="دعوة مشارك"
            >
              <UserPlus size={16} className="text-gray-600" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cursors */}
      <AnimatePresence>
        {participants.map((participant) =>
          participant.cursor && participant.id !== session?.user?.id ? (
            <motion.div
              key={`cursor-${participant.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed pointer-events-none z-50"
              style={{
                left: participant.cursor.x,
                top: participant.cursor.y,
              }}
            >
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
                <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium shadow-lg">
                  {participant.name}
                </div>
              </div>
            </motion.div>
          ) : null,
        )}
      </AnimatePresence>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">دعوة مشارك جديد</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="example@domain.com"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleInviteUser}
                    disabled={isInviting || !inviteEmail.trim()}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                  >
                    {isInviting ? "جاري الإرسال..." : "إرسال دعوة"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
