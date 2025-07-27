import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Chat, Message } from "@prisma/client"

interface ChatState {
  chats: Chat[]
  currentChat: Chat | null
  isLoading: boolean
  error: string | null
}

interface ChatActions {
  setChats: (chats: Chat[]) => void
  setCurrentChat: (chat: Chat | null) => void
  createNewChat: () => Promise<void>
  selectChat: (chatId: string) => void
  sendMessage: (content: string, files?: File[]) => Promise<void>
  deleteChat: (chatId: string) => Promise<void>
  updateChatTitle: (chatId: string, title: string) => Promise<void>
  clearError: () => void
}

type ChatStore = ChatState & ChatActions

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // State
      chats: [],
      currentChat: null,
      isLoading: false,
      error: null,

      // Actions
      setChats: (chats) => set({ chats }),

      setCurrentChat: (chat) => set({ currentChat: chat }),

      createNewChat: async () => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch("/api/chats", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: "محادثة جديدة",
            }),
          })

          if (!response.ok) {
            throw new Error("فشل في إنشاء محادثة جديدة")
          }

          const newChat = await response.json()
          const { chats } = get()

          set({
            chats: [newChat, ...chats],
            currentChat: newChat,
            isLoading: false,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "خطأ غير معروف",
            isLoading: false,
          })
        }
      },

      selectChat: (chatId) => {
        const { chats } = get()
        const chat = chats.find((c) => c.id === chatId)
        if (chat) {
          set({ currentChat: chat })
        }
      },

      sendMessage: async (content, files) => {
        const { currentChat } = get()
        if (!currentChat) return

        set({ isLoading: true, error: null })

        try {
          // Add user message immediately
          const userMessage: Message = {
            id: `temp-${Date.now()}`,
            chatId: currentChat.id,
            role: "USER",
            content,
            metadata: files ? { files: files.map((f) => f.name) } : null,
            createdAt: new Date(),
          }

          const updatedChat = {
            ...currentChat,
            messages: [...(currentChat.messages || []), userMessage],
          }

          set({ currentChat: updatedChat })

          // Send to API
          const formData = new FormData()
          formData.append("content", content)
          formData.append("chatId", currentChat.id)

          if (files) {
            files.forEach((file) => {
              formData.append("files", file)
            })
          }

          const response = await fetch("/api/messages", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            throw new Error("فشل في إرسال الرسالة")
          }

          const result = await response.json()

          // Update chat with AI response
          const aiMessage: Message = {
            id: result.id,
            chatId: currentChat.id,
            role: "ASSISTANT",
            content: result.content,
            metadata: result.metadata,
            createdAt: new Date(result.createdAt),
          }

          const finalChat = {
            ...updatedChat,
            messages: [...updatedChat.messages.filter((m) => !m.id.startsWith("temp-")), userMessage, aiMessage],
          }

          set({ currentChat: finalChat, isLoading: false })

          // Update chats list
          const { chats } = get()
          const updatedChats = chats.map((c) => (c.id === currentChat.id ? finalChat : c))
          set({ chats: updatedChats })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "خطأ في إرسال الرسالة",
            isLoading: false,
          })
        }
      },

      deleteChat: async (chatId) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch(`/api/chats/${chatId}`, {
            method: "DELETE",
          })

          if (!response.ok) {
            throw new Error("فشل في حذف المحادثة")
          }

          const { chats, currentChat } = get()
          const updatedChats = chats.filter((c) => c.id !== chatId)

          set({
            chats: updatedChats,
            currentChat: currentChat?.id === chatId ? null : currentChat,
            isLoading: false,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "خطأ في حذف المحادثة",
            isLoading: false,
          })
        }
      },

      updateChatTitle: async (chatId, title) => {
        try {
          const response = await fetch(`/api/chats/${chatId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ title }),
          })

          if (!response.ok) {
            throw new Error("فشل في تحديث عنوان المحادثة")
          }

          const { chats, currentChat } = get()
          const updatedChats = chats.map((c) => (c.id === chatId ? { ...c, title } : c))

          set({
            chats: updatedChats,
            currentChat: currentChat?.id === chatId ? { ...currentChat, title } : currentChat,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "خطأ في تحديث العنوان",
          })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "chat-store",
      partialize: (state) => ({
        chats: state.chats,
        currentChat: state.currentChat,
      }),
    },
  ),
)
