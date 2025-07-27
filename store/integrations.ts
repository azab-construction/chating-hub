import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Integration {
  id: string
  type: string
  isEnabled: boolean
  credentials?: any
  settings?: any
}

interface IntegrationsState {
  integrations: Integration[]
  isLoading: boolean
  error: string | null
}

interface IntegrationsActions {
  connectIntegration: (type: string, credentials?: any) => Promise<void>
  disconnectIntegration: (type: string) => Promise<void>
  updateIntegrationSettings: (type: string, settings: any) => Promise<void>
  fetchIntegrations: () => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

type IntegrationsStore = IntegrationsState & IntegrationsActions

export const useIntegrationsStore = create<IntegrationsStore>()(
  persist(
    (set, get) => ({
      // State
      integrations: [],
      isLoading: false,
      error: null,

      // Actions
      connectIntegration: async (type: string, credentials?: any) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch("/api/integrations/connect", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ type, credentials }),
          })

          if (!response.ok) {
            throw new Error("فشل في الاتصال بالتكامل")
          }

          const integration = await response.json()

          set((state) => ({
            integrations: [...state.integrations.filter((i) => i.type !== type), integration],
            isLoading: false,
          }))
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "خطأ غير معروف",
            isLoading: false,
          })
        }
      },

      disconnectIntegration: async (type: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch(`/api/integrations/${type}/disconnect`, {
            method: "DELETE",
          })

          if (!response.ok) {
            throw new Error("فشل في قطع الاتصال")
          }

          set((state) => ({
            integrations: state.integrations.filter((i) => i.type !== type),
            isLoading: false,
          }))
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "خطأ غير معروف",
            isLoading: false,
          })
        }
      },

      updateIntegrationSettings: async (type: string, settings: any) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch(`/api/integrations/${type}/settings`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ settings }),
          })

          if (!response.ok) {
            throw new Error("فشل في تحديث الإعدادات")
          }

          const updatedIntegration = await response.json()

          set((state) => ({
            integrations: state.integrations.map((i) => (i.type === type ? updatedIntegration : i)),
            isLoading: false,
          }))
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "خطأ غير معروف",
            isLoading: false,
          })
        }
      },

      fetchIntegrations: async () => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch("/api/integrations")

          if (!response.ok) {
            throw new Error("فشل في جلب التكاملات")
          }

          const integrations = await response.json()
          set({ integrations, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "خطأ غير معروف",
            isLoading: false,
          })
        }
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
    }),
    {
      name: "integrations-store",
      partialize: (state) => ({
        integrations: state.integrations,
      }),
    },
  ),
)
