"use client"

import { useState, useCallback } from "react"

export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  createdAt: Date
  metadata?: any
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export function useChat() {
  const [chats, setChats] = useState<Chat[]>([
    {
      id: "1",
      title: "مساعدة في البرمجة",
      messages: [
        {
          id: "1",
          role: "user",
          content: "مرحباً، أريد مساعدة في إنشاء تطبيق React",
          createdAt: new Date(),
        },
        {
          id: "2",
          role: "assistant",
          content: `مرحباً بك! سأساعدك في إنشاء تطبيق React. 

## خطة العمل:

1. **إعداد المشروع**
   - إنشاء مشروع جديد باستخدام Create React App
   - تثبيت التبعيات المطلوبة

2. **بناء المكونات**
   - إنشاء المكونات الأساسية
   - تصميم الواجهة

3. **إضافة الوظائف**
   - إدارة الحالة
   - التفاعل مع APIs

هل تريد البدء بخطوة معينة؟`,
          createdAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      title: "تحليل البيانات",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "3",
      title: "كتابة المحتوى",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ])

  const [currentChatId, setCurrentChatId] = useState<string>("1")
  const [isLoading, setIsLoading] = useState(false)

  const currentChat = chats.find((chat) => chat.id === currentChatId)

  const createNewChat = useCallback(() => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "محادثة جديدة",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setChats((prev) => [newChat, ...prev])
    setCurrentChatId(newChat.id)
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!currentChatId || !content.trim()) return

      setIsLoading(true)

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
        createdAt: new Date(),
      }

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? { ...chat, messages: [...chat.messages, userMessage], updatedAt: new Date() }
            : chat,
        ),
      )

      // Simulate AI response
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `شكراً لك على رسالتك: "${content}"\n\nهذه استجابة تجريبية من الذكاء الاصطناعي. في التطبيق الحقيقي، سيتم إرسال الرسالة إلى API الذكاء الاصطناعي للحصول على استجابة حقيقية.`,
          createdAt: new Date(),
        }

        setChats((prev) =>
          prev.map((chat) =>
            chat.id === currentChatId
              ? { ...chat, messages: [...chat.messages, aiMessage], updatedAt: new Date() }
              : chat,
          ),
        )
        setIsLoading(false)
      }, 1000)
    },
    [currentChatId],
  )

  const selectChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId)
  }, [])

  const deleteChat = useCallback(
    (chatId: string) => {
      setChats((prev) => prev.filter((chat) => chat.id !== chatId))
      if (currentChatId === chatId) {
        const remainingChats = chats.filter((chat) => chat.id !== chatId)
        setCurrentChatId(remainingChats.length > 0 ? remainingChats[0].id : "")
      }
    },
    [chats, currentChatId],
  )

  return {
    chats,
    currentChat,
    isLoading,
    createNewChat,
    sendMessage,
    selectChat,
    deleteChat,
  }
}
