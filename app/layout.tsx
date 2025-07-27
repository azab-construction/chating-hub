import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Chat Hub",
  description: "مركز المحادثة الذكي - تحدث مع نماذج الذكاء الاصطناعي المختلفة",
    generator: 'v0.dev'
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
