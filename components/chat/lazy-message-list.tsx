"use client"

import { useEffect, useRef, useMemo } from "react"
import { useChatStore } from "@/store/chat"
import { VirtualList } from "@/components/ui/virtual-list"
import { MessageItem } from "@/components/chat/message-item"
import { Sparkles } from "lucide-react"

export function LazyMessageList() {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { chats, currentChatId, isLoading } = useChatStore()

  const currentChat = chats.find((chat) => chat.id === currentChatId)
  const messages = currentChat?.messages || []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const renderMessage = useMemo(
    () => (message: any, index: number) => <MessageItem key={message.id} message={message} index={index} />,
    [],
  )

  if (!currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="text-blue-600" size={32} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">مرحباً بك في مساعدك الذكي</h2>
          <p className="text-gray-600">كيف يمكنني مساعدتك اليوم؟</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {messages.length > 50 ? (
        <VirtualList
          items={messages}
          itemHeight={120}
          containerHeight={600}
          renderItem={renderMessage}
          className="flex-1 p-4"
        />
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((message, index) => (
            <MessageItem key={message.id} message={message} index={index} />
          ))}
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex gap-4 justify-start p-4">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 mr-12">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200" />
              </div>
              <span className="text-sm text-gray-500">الذكاء الاصطناعي يفكر...</span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}
