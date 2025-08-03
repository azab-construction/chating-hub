"use client"
import { motion } from "framer-motion"
import { Loader2Icon } from "lucide-react"
import { useTranslation } from "react-i18next"

export function LoadingScreen() {
  const { t } = useTranslation()
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground"
    >
      <Loader2Icon className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-lg font-medium">{t("loadingScreen.loading")}</p>
      <p className="text-sm text-muted-foreground">{t("loadingScreen.pleaseWait")}</p>
    </motion.div>
  )
}
