"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useChatStore } from "@/store/chat"

const models = [
  { id: "gpt-4", name: "GPT-4", provider: "OpenAI" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "OpenAI" },
  { id: "claude-3", name: "Claude 3", provider: "Anthropic" },
  { id: "gemini-pro", name: "Gemini Pro", provider: "Google" },
]

export function ModelSelector() {
  const { selectedModel, setSelectedModel } = useChatStore()

  return (
    <Select value={selectedModel} onValueChange={setSelectedModel}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="اختر النموذج" />
      </SelectTrigger>
      <SelectContent>
        {models.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            <div className="flex flex-col items-start">
              <span className="font-medium">{model.name}</span>
              <span className="text-xs text-gray-500">{model.provider}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
