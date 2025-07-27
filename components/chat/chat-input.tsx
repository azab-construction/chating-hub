"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useChatStore } from "@/store/chat-store"
import { FileUpload } from "./file-upload"
import { cn } from "@/lib/utils"

// Icons
const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22,2 15,22 11,13 2,9 22,2" />
  </svg>
)

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14" />
  </svg>
)

const UploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7,10 12,15 17,10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const GithubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
)

const MicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
)

const Volume2Icon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
)

export function ChatInput() {
  const [input, setInput] = useState("")
  const [showAttachments, setShowAttachments] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { sendMessage, isLoading, currentChatId, createNewChat } = useChatStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // إنشاء محادثة جديدة إذا لم تكن موجودة
    if (!currentChatId) {
      createNewChat()
    }

    await sendMessage(input.trim(), selectedFiles)
    setInput("")
    setSelectedFiles([])
    setShowAttachments(false)
    setShowFileUpload(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles((prev) => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`
    }
  }

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      {/* File Upload Modal */}
      {showFileUpload && (
        <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">رفع الملفات</h3>
            <button onClick={() => setShowFileUpload(false)} className="text-gray-400 hover:text-gray-600">
              ×
            </button>
          </div>
          <FileUpload onFilesSelected={handleFilesSelected} />
        </div>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              <span>📎 {file.name}</span>
              <button onClick={() => removeFile(index)} className="text-blue-600 hover:text-blue-800">
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-end gap-2">
          {/* Attachment Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAttachments(!showAttachments)}
              className={cn(
                "p-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors",
                showAttachments && "bg-gray-100",
              )}
            >
              <PlusIcon />
            </button>

            {showAttachments && (
              <div className="absolute bottom-full mb-2 left-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-48 z-10">
                <button
                  type="button"
                  onClick={() => {
                    setShowFileUpload(true)
                    setShowAttachments(false)
                  }}
                  className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-sm"
                >
                  <UploadIcon />
                  رفع ملف
                </button>
                <button
                  type="button"
                  className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-sm"
                >
                  <GithubIcon />
                  إضافة من GitHub
                </button>
              </div>
            )}
          </div>

          {/* Input Field */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                adjustTextareaHeight()
              }}
              onKeyDown={handleKeyDown}
              placeholder="اكتب رسالتك هنا..."
              className={cn(
                "w-full p-3 pr-12 border border-gray-300 rounded-lg",
                "focus:ring-2 focus:ring-blue-600 focus:border-transparent",
                "resize-none min-h-[52px] max-h-32",
                "placeholder:text-gray-500",
              )}
              style={{ direction: "rtl", textAlign: "right" }}
              disabled={isLoading}
              rows={1}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={cn(
                "absolute left-2 bottom-2 p-2 rounded-lg",
                "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300",
                "text-white transition-colors",
              )}
            >
              <SendIcon />
            </button>
          </div>

          {/* Voice Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <MicIcon />
            </button>
            <button
              type="button"
              className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <Volume2Icon />
            </button>
          </div>
        </div>

        {/* AI Processing Indicator */}
        {isLoading && (
          <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200" />
            </div>
            جاري المعالجة...
          </div>
        )}
      </form>
    </div>
  )
}
