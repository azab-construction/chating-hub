"use client"

import type React from "react"

import { ThemeProvider } from "next-themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SessionProvider } from "next-auth/react"
import { I18nextProvider } from "react-i18next"
import i18n from "@/i18n/config"

const queryClient = new QueryClient()

export default function Providers({ children, lng }: { children: React.ReactNode; lng: string }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
        </SessionProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
