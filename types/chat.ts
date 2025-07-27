export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: string
  isTyping?: boolean
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: string
}
