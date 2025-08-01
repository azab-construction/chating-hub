"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageList } from "@/components/chat/message-list"
import { ModelSelector } from "@/components/chat/model-selector"
import { FileUpload } from "@/components/chat/file-upload"
import { useChatStore } from "@/store/chat"
import { Send, Paperclip } from "lucide-react"
import type { Message } from "@/types/chat"

export function ChatInterface() {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { activeChat, chats, addMessage, selectedModel, createChat } = useChatStore()

  const currentChat = chats.find((chat) => chat.id === activeChat)

  useEffect(() => {
    if (!activeChat && chats.length === 0) {
      createChat()
    }
  }, [activeChat, chats.length, createChat])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !activeChat) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date(),
    }

    addMessage(activeChat, userMessage)
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `هذه استجابة تجريبية من ${selectedModel}. تم استلام رسالتك: "${userMessage.content}"`,
        role: "assistant",
        timestamp: new Date(),
      }
      addMessage(activeChat, aiMessage)
      setIsLoading(false)
    }, 1000)
  }

  const handleFileUpload = (files: File[]) => {
    if (!activeChat) return

    files.forEach((file) => {
      const fileMessage: Message = {
        id: Date.now().toString() + Math.random(),
        content: `تم رفع الملف: ${file.name}`,
        role: "user",
        timestamp: new Date(),
        attachments: [{ name: file.name, size: file.size, type: file.type }],
      }
      addMessage(activeChat, fileMessage)
    })
  }

  if (!currentChat) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">مرحباً بك في AI Chat Hub</h2>
          <p className="text-gray-600 dark:text-gray-400">ابدأ محادثة جديدة للتحدث مع نماذج الذكاء الاصطناعي</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{currentChat.title}</h1>
          <ModelSelector />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList messages={currentChat.messages} isLoading={isLoading} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-2 space-x-reverse">
          <div className="flex-1">
            <div className="relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                disabled={isLoading}
                className="pr-12"
              />
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                <FileUpload onFileUpload={handleFileUpload}>
                  <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </FileUpload>
              </div>
            </div>
          </div>
          <Button type="submit" disabled={!input.trim() || isLoading} size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
