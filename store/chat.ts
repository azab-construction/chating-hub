import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Chat, Message } from "@/types/chat"

interface ChatStore {
  chats: Chat[]
  activeChat: string | null
  selectedModel: string
  createChat: () => void
  deleteChat: (chatId: string) => void
  setActiveChat: (chatId: string) => void
  addMessage: (chatId: string, message: Message) => void
  updateChatTitle: (chatId: string, title: string) => void
  setSelectedModel: (model: string) => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      activeChat: null,
      selectedModel: "gpt-4",

      createChat: () => {
        const newChat: Chat = {
          id: Date.now().toString(),
          title: "محادثة جديدة",
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        set((state) => ({
          chats: [newChat, ...state.chats],
          activeChat: newChat.id,
        }))
      },

      deleteChat: (chatId: string) => {
        set((state) => {
          const newChats = state.chats.filter((chat) => chat.id !== chatId)
          const newActiveChat =
            state.activeChat === chatId ? (newChats.length > 0 ? newChats[0].id : null) : state.activeChat

          return {
            chats: newChats,
            activeChat: newActiveChat,
          }
        })
      },

      setActiveChat: (chatId: string) => {
        set({ activeChat: chatId })
      },

      addMessage: (chatId: string, message: Message) => {
        set((state) => ({
          chats: state.chats.map((chat) => {
            if (chat.id === chatId) {
              const updatedChat = {
                ...chat,
                messages: [...chat.messages, message],
                updatedAt: new Date(),
              }

              // Update title based on first user message
              if (chat.messages.length === 0 && message.role === "user") {
                updatedChat.title = message.content.slice(0, 50) + (message.content.length > 50 ? "..." : "")
              }

              return updatedChat
            }
            return chat
          }),
        }))
      },

      updateChatTitle: (chatId: string, title: string) => {
        set((state) => ({
          chats: state.chats.map((chat) => (chat.id === chatId ? { ...chat, title, updatedAt: new Date() } : chat)),
        }))
      },

      setSelectedModel: (model: string) => {
        set({ selectedModel: model })
      },
    }),
    {
      name: "chat-store",
      partialize: (state) => ({
        chats: state.chats,
        activeChat: state.activeChat,
        selectedModel: state.selectedModel,
      }),
    },
  ),
)
