export interface Message {
  id: string
  content: string
  role: "user" | "assistant" | "system"
  timestamp: Date
  attachments?: Attachment[]
}

export interface Attachment {
  name: string
  size: number
  type: string
  url?: string
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export interface AIModel {
  id: string
  name: string
  provider: string
  description?: string
}
