import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Providers } from "@/components/providers"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "مركز الذكاء الاصطناعي - AI Chat Hub",
  description: "منصة متكاملة للذكاء الاصطناعي مع دعم كامل للعربية وتكاملات متقدمة",
  keywords: ["AI", "Chat", "Arabic", "GPT-4", "Claude", "DeepSeek"],
  authors: [{ name: "AI Chat Hub Team" }],
  openGraph: {
    title: "مركز الذكاء الاصطناعي",
    description: "منصة متكاملة للذكاء الاصطناعي مع دعم كامل للعربية",
    type: "website",
    locale: "ar_SA",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
