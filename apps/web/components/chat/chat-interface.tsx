"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useTranslation } from "next-i18next"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Plus, Sparkles, Upload, Github } from "lucide-react"
import { cn } from "@/lib/utils"
import { useChatStore } from "@/store/chat"
import { useAIStore } from "@/store/ai"
import { MessageList } from "./message-list"
import { ModelSelector } from "./model-selector"
import { FileUpload } from "./file-upload"

export function ChatInterface() {
  const { t } = useTranslation("common")
  const [input, setInput] = useState("")
  const [showAttachments, setShowAttachments] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { currentChat, sendMessage } = useChatStore()
  const { currentModel, isProcessing } = useAIStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    setIsLoading(true)
    try {
      await sendMessage(input)
      setInput("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="text-orange-500" size={24} />
              <h1 className="text-2xl font-semibold text-gray-900">{t("greeting", { name: "محمد" })}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{t("freePlan")}</span>
            <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">{t("upgrade")}</button>
            <ModelSelector />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        {currentChat ? (
          <MessageList messages={currentChat.messages} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Sparkles className="mx-auto text-orange-500 mb-4" size={48} />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{t("welcomeMessage")}</h2>
              <p className="text-gray-600">{t("howCanIHelp")}</p>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end gap-2">
            {/* Attachment Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAttachments(!showAttachments)}
                className={cn(
                  "p-3 rounded-lg border border-gray-300",
                  "hover:bg-gray-50 transition-colors",
                  showAttachments && "bg-gray-100",
                )}
              >
                <Plus size={20} />
              </button>

              <AnimatePresence>
                {showAttachments && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full mb-2 left-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-48"
                  >
                    <FileUpload />
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-sm"
                    >
                      <Upload size={16} />
                      {t("uploadFile")}
                    </button>
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-sm"
                    >
                      <Github size={16} />
                      {t("addFromGithub")}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input Field */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("messageInputPlaceholder")}
                className={cn(
                  "w-full p-3 pr-12 border border-gray-300 rounded-lg",
                  "focus:ring-2 focus:ring-orange-500 focus:border-transparent",
                  "resize-none min-h-[52px] max-h-32",
                  "placeholder:text-gray-500",
                )}
                rows={1}
                style={{
                  direction: "rtl",
                  textAlign: "right",
                }}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={cn(
                  "absolute left-2 bottom-2 p-2 rounded-lg",
                  "bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300",
                  "text-white transition-colors",
                )}
              >
                <Send size={16} />
              </button>
            </div>
          </div>

          {/* AI Processing Indicator */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-2 text-sm text-gray-500 flex items-center gap-2"
              >
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-200" />
                </div>
                {t("aiProcessing")}
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  )
}
