import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AIModel } from "@prisma/client"

interface AIState {
  currentModel: AIModel
  availableModels: AIModel[]
  isProcessing: boolean
  processingStage: string | null
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

interface AIActions {
  setCurrentModel: (model: AIModel) => void
  setAvailableModels: (models: AIModel[]) => void
  setProcessing: (isProcessing: boolean, stage?: string) => void
  updateUsage: (usage: Partial<AIState["usage"]>) => void
  resetUsage: () => void
}

type AIStore = AIState & AIActions

export const useAIStore = create<AIStore>()(
  persist(
    (set) => ({
      // State
      currentModel: "CLAUDE_SONNET" as AIModel,
      availableModels: ["GPT4", "CLAUDE_OPUS", "CLAUDE_SONNET", "DEEPSEEK_CODER"] as AIModel[],
      isProcessing: false,
      processingStage: null,
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },

      // Actions
      setCurrentModel: (model) => set({ currentModel: model }),

      setAvailableModels: (models) => set({ availableModels: models }),

      setProcessing: (isProcessing, stage) =>
        set({
          isProcessing,
          processingStage: stage || null,
        }),

      updateUsage: (newUsage) =>
        set((state) => ({
          usage: {
            ...state.usage,
            ...newUsage,
            totalTokens:
              (newUsage.promptTokens || state.usage.promptTokens) +
              (newUsage.completionTokens || state.usage.completionTokens),
          },
        })),

      resetUsage: () =>
        set({
          usage: {
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
          },
        }),
    }),
    {
      name: "ai-store",
      partialize: (state) => ({
        currentModel: state.currentModel,
        usage: state.usage,
      }),
    },
  ),
)
