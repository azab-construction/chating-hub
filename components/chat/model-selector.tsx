"use client"

import * as React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslation } from "react-i18next"

export function ModelSelector() {
  const { t } = useTranslation()
  const [selectedModel, setSelectedModel] = React.useState("gpt-4o") // Default model

  const models = [
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "claude-3-opus", label: "Claude 3 Opus" },
    { value: "deepseek-chat", label: "DeepSeek Chat" },
  ]

  return (
    <Select value={selectedModel} onValueChange={setSelectedModel}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={t("modelSelector.placeholder")} />
      </SelectTrigger>
      <SelectContent>
        {models.map((model) => (
          <SelectItem key={model.value} value={model.value}>
            {model.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
