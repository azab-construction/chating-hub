import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Chat, Message } from "@/types/chat"

interface ChatStore {
  chats: Chat[]
  currentChatId: string | null
  selectedModel: string
  currentChat: Chat | null

  // Actions
  createChat: () => void
  selectChat: (chatId: string) => void
  deleteChat: (chatId: string) => void
  addMessage: (message: Message) => void
  updateChatTitle: (chatId: string, title: string) => void
  setSelectedModel: (model: string) => void
  clearChats: () => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChatId: null,
      selectedModel: "gpt-4",
      currentChat: null,

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
          currentChatId: newChat.id,
          currentChat: newChat,
        }))
      },

      selectChat: (chatId: string) => {
        const chat = get().chats.find((c) => c.id === chatId)
        set({
          currentChatId: chatId,
          currentChat: chat || null,
        })
      },

      deleteChat: (chatId: string) => {
        set((state) => {
          const newChats = state.chats.filter((c) => c.id !== chatId)
          const newCurrentChatId = state.currentChatId === chatId ? newChats[0]?.id || null : state.currentChatId

          return {
            chats: newChats,
            currentChatId: newCurrentChatId,
            currentChat: newChats.find((c) => c.id === newCurrentChatId) || null,
          }
        })
      },

      addMessage: (message: Message) => {
        set((state) => {
          if (!state.currentChatId) return state

          const updatedChats = state.chats.map((chat) => {
            if (chat.id === state.currentChatId) {
              const updatedChat = {
                ...chat,
                messages: [...chat.messages, message],
                updatedAt: new Date(),
                title:
                  chat.messages.length === 0 && message.role === "user"
                    ? message.content.slice(0, 50) + (message.content.length > 50 ? "..." : "")
                    : chat.title,
              }
              return updatedChat
            }
            return chat
          })

          return {
            chats: updatedChats,
            currentChat: updatedChats.find((c) => c.id === state.currentChatId) || null,
          }
        })
      },

      updateChatTitle: (chatId: string, title: string) => {
        set((state) => ({
          chats: state.chats.map((chat) => (chat.id === chatId ? { ...chat, title, updatedAt: new Date() } : chat)),
        }))
      },

      setSelectedModel: (model: string) => {
        set({ selectedModel: model })
      },

      clearChats: () => {
        set({
          chats: [],
          currentChatId: null,
          currentChat: null,
        })
      },
    }),
    {
      name: "chat-store",
      partialize: (state) => ({
        chats: state.chats,
        currentChatId: state.currentChatId,
        selectedModel: state.selectedModel,
      }),
    },
  ),
)
