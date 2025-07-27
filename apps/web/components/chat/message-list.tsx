"use client"

import { useEffect, useRef } from "react"
import { useTranslation } from "next-i18next"
import { motion, AnimatePresence } from "framer-motion"
import { User, Bot, Copy, ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { MessageContent } from "./message-content"
import type { Message } from "@prisma/client"

interface MessageListProps {
  messages: Message[]
  isLoading?: boolean
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const { t } = useTranslation("chat")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      // Show toast notification
    } catch (error) {
      console.error("Failed to copy message:", error)
    }
  }

  const handleRegenerateResponse = async (messageId: string) => {
    // Implement regenerate functionality
    console.log("Regenerating response for message:", messageId)
  }

  const handleFeedback = async (messageId: string, type: "positive" | "negative") => {
    try {
      await fetch(`/api/messages/${messageId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      })
    } catch (error) {
      console.error("Failed to submit feedback:", error)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      <AnimatePresence>
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={cn("flex gap-4", message.role === "USER" ? "justify-end" : "justify-start")}
          >
            {message.role === "ASSISTANT" && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
              </div>
            )}

            <div
              className={cn(
                "max-w-3xl rounded-2xl p-4 relative group",
                message.role === "USER" ? "bg-orange-500 text-white ml-12" : "bg-white border border-gray-200 mr-12",
              )}
            >
              <MessageContent content={message.content} role={message.role} />

              {/* Message metadata */}
              {message.metadata && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    {message.metadata.files && (
                      <div className="flex flex-wrap gap-1">
                        {message.metadata.files.map((file: string, idx: number) => (
                          <span key={idx} className="bg-gray-100 px-2 py-1 rounded">
                            {file}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Message actions */}
              <div
                className={cn(
                  "absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity",
                  "flex items-center gap-1",
                  message.role === "USER" ? "left-2" : "right-2",
                )}
              >
                <button
                  onClick={() => handleCopyMessage(message.content)}
                  className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                  title={t("copyMessage")}
                >
                  <Copy size={14} />
                </button>

                {message.role === "ASSISTANT" && (
                  <>
                    <button
                      onClick={() => handleRegenerateResponse(message.id)}
                      className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                      title={t("regenerateResponse")}
                    >
                      <RotateCcw size={14} />
                    </button>

                    <button
                      onClick={() => handleFeedback(message.id, "positive")}
                      className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-green-600"
                      title={t("goodResponse")}
                    >
                      <ThumbsUp size={14} />
                    </button>

                    <button
                      onClick={() => handleFeedback(message.id, "negative")}
                      className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-red-600"
                      title={t("badResponse")}
                    >
                      <ThumbsDown size={14} />
                    </button>
                  </>
                )}
              </div>

              {/* Timestamp */}
              <div
                className={cn("text-xs mt-2 opacity-70", message.role === "USER" ? "text-orange-100" : "text-gray-500")}
              >
                {new Date(message.createdAt).toLocaleString("ar-SA", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "2-digit",
                })}
              </div>
            </div>

            {message.role === "USER" && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User size={16} className="text-gray-600" />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Loading indicator */}
      {isLoading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4 justify-start">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 mr-12">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-200" />
              </div>
              <span className="text-sm text-gray-500">{t("aiThinking")}</span>
            </div>
          </div>
        </motion.div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}
