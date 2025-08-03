import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { dir } from "i18next"
import { languages } from "@/i18n/settings"
import Providers from "@/components/providers"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "AI Chat Hub",
  description: "Your personal AI assistant",
    generator: 'v0.dev'
}

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }))
}

export default function RootLayout({
  children,
  params: { lng },
}: {
  children: React.ReactNode
  params: { lng: string }
}) {
  return (
    <html lang={lng} dir={dir(lng)}>
      <body className={inter.className}>
        <Providers lng={lng}>{children}</Providers>
        <Toaster />
      </body>
    </html>
  )
}
