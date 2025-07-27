"use client"

import type React from "react"

import { useState } from "react"
import { useTranslation } from "next-i18next"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, Plus, Star, Settings, User, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useChatStore } from "@/store/chat"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const { t } = useTranslation("common")
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { chats, currentChat, createNewChat, selectChat } = useChatStore()

  return (
    <motion.div
      initial={{ width: 280 }}
      animate={{ width: isCollapsed ? 60 : 280 }}
      className={cn("bg-white border-l border-gray-200 flex flex-col h-full", "rtl:border-l-0 rtl:border-r", className)}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xl font-semibold text-gray-900"
            >
              {t("appName")}
            </motion.h1>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={createNewChat}
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-lg",
            "bg-orange-500 hover:bg-orange-600 text-white",
            "transition-colors duration-200",
            isCollapsed && "justify-center",
          )}
        >
          <Plus size={20} />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {t("newChat")}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <div className="space-y-2">
          <NavItem icon={MessageSquare} label={t("chats")} isCollapsed={isCollapsed} isActive={true} />
          <NavItem icon={Star} label={t("starred")} isCollapsed={isCollapsed} />
        </div>

        {/* Chat History */}
        <div className="mt-6">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h3 className="text-sm font-medium text-gray-500 mb-3">{t("recent")}</h3>
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {chats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => selectChat(chat.id)}
                      className={cn(
                        "w-full text-right p-2 rounded-lg text-sm",
                        "hover:bg-gray-100 transition-colors",
                        "truncate",
                        currentChat?.id === chat.id && "bg-gray-100",
                      )}
                    >
                      {chat.title}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1">
                <p className="text-sm font-medium">محمد عزب</p>
                <p className="text-xs text-gray-500">{t("freePlan")}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <button className="p-1 hover:bg-gray-100 rounded">
            <Settings size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

interface NavItemProps {
  icon: React.ElementType
  label: string
  isCollapsed: boolean
  isActive?: boolean
}

function NavItem({ icon: Icon, label, isCollapsed, isActive }: NavItemProps) {
  return (
    <button
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg",
        "hover:bg-gray-100 transition-colors",
        isActive && "bg-gray-100",
        isCollapsed && "justify-center",
      )}
    >
      <Icon size={20} />
      <AnimatePresence>
        {!isCollapsed && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
