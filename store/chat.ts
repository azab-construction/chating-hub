import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Chat, Message } from "@/types/chat"

interface ChatState {
  chats: Chat[]
  selectedChatId: string | null
  addChat: (initialMessage?: Message) => void
  selectChat: (id: string) => void
  addMessage: (chatId: string, message: Message) => void
  updateMessage: (chatId: string, messageId: string, updates: Partial<Message>) => void
  removeChat: (id: string) => void
  startNewChat: (initialMessage: Message) => void
  selectedChat: Chat | null
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      selectedChatId: null,
      selectedChat: null,

      addChat: (initialMessage) => {
        const newChat: Chat = {
          id: Date.now().toString(),
          title: initialMessage ? initialMessage.content.substring(0, 30) + "..." : "New Chat",
          messages: initialMessage ? [initialMessage] : [],
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          chats: [newChat, ...state.chats],
          selectedChatId: newChat.id,
          selectedChat: newChat,
        }))
      },

      selectChat: (id) => {
        set((state) => {
          const chat = state.chats.find((c) => c.id === id)
          return { selectedChatId: id, selectedChat: chat || null }
        })
      },

      addMessage: (chatId, message) => {
        set((state) => {
          const updatedChats = state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [...chat.messages, message],
                  title: chat.messages.length === 0 ? message.content.substring(0, 30) + "..." : chat.title,
                }
              : chat,
          )
          const updatedSelectedChat = updatedChats.find((c) => c.id === chatId)
          return { chats: updatedChats, selectedChat: updatedSelectedChat || null }
        })
      },

      updateMessage: (chatId, messageId, updates) => {
        set((state) => {
          const updatedChats = state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: chat.messages.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg)),
                }
              : chat,
          )
          const updatedSelectedChat = updatedChats.find((c) => c.id === chatId)
          return { chats: updatedChats, selectedChat: updatedSelectedChat || null }
        })
      },

      removeChat: (id) => {
        set((state) => {
          const filteredChats = state.chats.filter((chat) => chat.id !== id)
          const newSelectedChatId = state.selectedChatId === id ? filteredChats[0]?.id || null : state.selectedChatId
          const newSelectedChat = filteredChats.find((c) => c.id === newSelectedChatId) || null
          return {
            chats: filteredChats,
            selectedChatId: newSelectedChatId,
            selectedChat: newSelectedChat,
          }
        })
      },

      startNewChat: (initialMessage) => {
        const newChat: Chat = {
          id: Date.now().toString(),
          title: initialMessage.content.substring(0, 30) + "...",
          messages: [initialMessage],
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          chats: [newChat, ...state.chats],
          selectedChatId: newChat.id,
          selectedChat: newChat,
        }))
      },
    }),
    {
      name: "ai-chat-hub-storage", // unique name
      getStorage: () => localStorage, // Use localStorage for persistence
    },
  ),
)
