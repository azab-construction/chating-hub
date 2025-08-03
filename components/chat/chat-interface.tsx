"use client"

import type * as React from "react"
import { useState, useRef, useEffect } from "react"
import { useChatStore } from "@/store/chat"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SendIcon, Loader2Icon } from "lucide-react"
import { MessageList } from "@/components/chat/message-list"
import { ModelSelector } from "@/components/chat/model-selector"
import { FileUpload } from "@/components/chat/file-upload"
import { useTranslation } from "react-i18next"

export function ChatInterface() {
  const { selectedChat, addMessage, updateMessage, startNewChat } = useChatStore()
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [selectedChat?.messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isSending) return

    const userMessage = {
      id: Date.now().toString(),
      content: input,
      role: "user" as const,
      timestamp: new Date().toISOString(),
    }

    if (!selectedChat) {
      startNewChat(userMessage)
    } else {
      addMessage(selectedChat.id, userMessage)
    }

    setInput("")
    setIsSending(true)

    // Simulate AI response
    const aiResponseId = (Date.now() + 1).toString()
    addMessage(selectedChat?.id || "new", {
      id: aiResponseId,
      content: "",
      role: "assistant" as const,
      timestamp: new Date().toISOString(),
      isTyping: true,
    })

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const aiContent = t("chat.simulatedResponse", { query: userMessage.content })
      updateMessage(selectedChat?.id || "new", aiResponseId, {
        content: aiContent,
        isTyping: false,
      })
    } catch (error) {
      console.error("Error sending message:", error)
      updateMessage(selectedChat?.id || "new", aiResponseId, {
        content: t("chat.errorMessage"),
        isTyping: false,
      })
    } finally {
      setIsSending(false)
      scrollToBottom()
    }
  }

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-1 overflow-y-auto pr-2">
        {selectedChat ? (
          <MessageList messages={selectedChat.messages} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p className="text-lg">{t("chat.noChatSelected")}</p>
            <p className="text-sm">{t("chat.startTyping")}</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-4 border-t pt-4">
        <div className="flex items-center gap-2 mb-4">
          <ModelSelector />
          <FileUpload />
        </div>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("chat.inputPlaceholder")}
            className="flex-1 resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage(e)
              }
            }}
            disabled={isSending}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isSending}>
            {isSending ? <Loader2Icon className="h-5 w-5 animate-spin" /> : <SendIcon className="h-5 w-5" />}
            <span className="sr-only">{t("chat.send")}</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
