"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useChatStore } from "@/store/chat"
import { MessageSquare, Plus, Settings, Menu, Trash2, Edit3 } from "lucide-react"
import { useState } from "react"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { chats, activeChat, createChat, setActiveChat, deleteChat, updateChatTitle } = useChatStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")

  const handleCreateChat = () => {
    createChat()
  }

  const handleEditTitle = (chatId: string, currentTitle: string) => {
    setEditingId(chatId)
    setEditTitle(currentTitle)
  }

  const handleSaveTitle = (chatId: string) => {
    if (editTitle.trim()) {
      updateChatTitle(chatId, editTitle.trim())
    }
    setEditingId(null)
    setEditTitle("")
  }

  return (
    <>
      <div
        className={`fixed inset-y-0 right-0 z-50 w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">المحادثات</h2>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <Button onClick={handleCreateChat} className="w-full justify-start bg-transparent" variant="outline">
              <Plus className="h-4 w-4 ml-2" />
              محادثة جديدة
            </Button>
          </div>

          <Separator />

          {/* Chat List */}
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-2 py-4">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group relative rounded-lg p-3 cursor-pointer transition-colors ${
                    activeChat === chat.id
                      ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setActiveChat(chat.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 space-x-reverse flex-1 min-w-0">
                      <MessageSquare className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      {editingId === chat.id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => handleSaveTitle(chat.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSaveTitle(chat.id)
                            } else if (e.key === "Escape") {
                              setEditingId(null)
                              setEditTitle("")
                            }
                          }}
                          className="flex-1 bg-transparent border-none outline-none text-sm"
                          autoFocus
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{chat.title}</span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditTitle(chat.id, chat.title)
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteChat(chat.id)
                        }}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{chat.messages.length} رسالة</div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <Separator />

          {/* Settings */}
          <div className="p-4">
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="h-4 w-4 ml-2" />
              الإعدادات
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={onToggle} />}
    </>
  )
}
