"use client"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageItem } from "@/components/chat/message-item"
import { LoadingMessage } from "@/components/chat/loading-message"
import type { Message } from "@/types/chat"

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <ScrollArea className="h-full pr-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        {messages.some((msg) => msg.isTyping) && <LoadingMessage />}
      </div>
    </ScrollArea>
  )
}
