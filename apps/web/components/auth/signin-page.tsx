"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useTranslation } from "next-i18next"
import { motion } from "framer-motion"
import { Mail, Github, Sparkles, ArrowRight, Shield, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export function SignInPage() {
  const { t } = useTranslation("auth")
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleSignIn = async (provider: string) => {
    setIsLoading(provider)
    try {
      await signIn(provider, { callbackUrl: "/" })
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setIsLoading(null)
    }
  }

  const features = [
    {
      icon: Sparkles,
      title: "ذكاء اصطناعي متقدم",
      description: "تفاعل مع GPT-4، Claude، وDeepSeek في مكان واحد",
    },
    {
      icon: Zap,
      title: "تكاملات قوية",
      description: "اتصل مع Gmail، Google Drive، Stripe والمزيد",
    },
    {
      icon: Shield,
      title: "آمن ومحمي",
      description: "بياناتك محمية بأعلى معايير الأمان",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Features */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Sparkles className="text-white" size={24} />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">مركز الذكاء الاصطناعي</h1>
            </div>
            <p className="text-xl text-gray-600">منصة متكاملة للذكاء الاصطناعي مع دعم كامل للعربية وتكاملات متقدمة</p>
          </div>

          <div className="space-y-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Icon className="text-orange-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Right Side - Sign In Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">مرحباً بك</h2>
            <p className="text-gray-600">سجل دخولك للبدء في استخدام المنصة</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleSignIn("google")}
              disabled={isLoading === "google"}
              className={cn(
                "w-full flex items-center justify-center gap-3 p-4 border border-gray-300 rounded-lg",
                "hover:bg-gray-50 transition-colors font-medium",
                isLoading === "google" && "opacity-50 cursor-not-allowed",
              )}
            >
              {isLoading === "google" ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                <Mail size={20} className="text-red-500" />
              )}
              <span>المتابعة مع Google</span>
              <ArrowRight size={16} className="mr-auto" />
            </button>

            <button
              onClick={() => handleSignIn("github")}
              disabled={isLoading === "github"}
              className={cn(
                "w-full flex items-center justify-center gap-3 p-4 border border-gray-300 rounded-lg",
                "hover:bg-gray-50 transition-colors font-medium",
                isLoading === "github" && "opacity-50 cursor-not-allowed",
              )}
            >
              {isLoading === "github" ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                <Github size={20} className="text-gray-700" />
              )}
              <span>المتابعة مع GitHub</span>
              <ArrowRight size={16} className="mr-auto" />
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              بالمتابعة، أنت توافق على{" "}
              <a href="/terms" className="text-orange-600 hover:underline">
                شروط الخدمة
              </a>{" "}
              و{" "}
              <a href="/privacy" className="text-orange-600 hover:underline">
                سياسة الخصوصية
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
