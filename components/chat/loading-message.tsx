"use client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader2Icon } from "lucide-react"
import { useTranslation } from "react-i18next"

export function LoadingMessage() {
  const { t } = useTranslation()
  return (
    <div className="flex items-start gap-4 justify-start">
      <Avatar className="h-8 w-8">
        <AvatarFallback>AI</AvatarFallback>
      </Avatar>
      <div className="flex flex-col p-3 rounded-lg bg-muted text-muted-foreground max-w-[70%]">
        <div className="flex items-center gap-2">
          <Loader2Icon className="h-4 w-4 animate-spin" />
          <span className="text-sm">{t("loadingMessage.typing")}</span>
        </div>
      </div>
    </div>
  )
}
