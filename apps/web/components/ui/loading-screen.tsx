"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="inline-block p-4 bg-orange-500 rounded-full mb-6"
        >
          <Sparkles className="text-white" size={32} />
        </motion.div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">مركز الذكاء الاصطناعي</h2>
        <p className="text-gray-600">جاري التحميل...</p>

        <div className="mt-6 flex justify-center">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.2,
                }}
                className="w-2 h-2 bg-orange-500 rounded-full"
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
