"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { Message } from "@/types/chat"
import { CopyIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "react-i18next"

interface MessageItemProps {
  message: Message
}

export function MessageItem({ message }: MessageItemProps) {
  const { toast } = useToast()
  const { t } = useTranslation()

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    toast({
      title: t("messageItem.copySuccess"),
    })
  }

  const isUser = message.role === "user"
  const avatarFallback = isUser ? "You" : "AI"
  const avatarSrc = isUser ? "/placeholder-avatar.jpg" : "/ai-avatar.jpg" // Placeholder for AI avatar

  return (
    <div className={`flex items-start gap-4 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatarSrc || "/placeholder.svg"} alt={avatarFallback} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={`flex flex-col p-3 rounded-lg max-w-[70%] ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        <p className="text-sm">{message.content}</p>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
          <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
          {!isUser && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleCopy}
              aria-label={t("messageItem.copy")}
            >
              <CopyIcon className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatarSrc || "/placeholder.svg"} alt={avatarFallback} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
