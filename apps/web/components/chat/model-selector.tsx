"use client"

import type React from "react"

import { useState } from "react"
import { useTranslation } from "next-i18next"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Sparkles, Brain, Code, Zap, Crown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAIStore } from "@/store/ai"
import { useUserStore } from "@/store/user"
import type { AIModel } from "@prisma/client"

interface ModelInfo {
  id: AIModel
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  icon: React.ElementType
  color: string
  isPro?: boolean
  isEnterprise?: boolean
  strengths: string[]
  strengthsAr: string[]
}

const models: ModelInfo[] = [
  {
    id: "GPT4",
    name: "GPT-4",
    nameAr: "جي بي تي-4",
    description: "Most capable model for complex reasoning",
    descriptionAr: "النموذج الأكثر قدرة للتفكير المعقد",
    icon: Sparkles,
    color: "green",
    isPro: true,
    strengths: ["Complex reasoning", "Creative writing", "Code generation"],
    strengthsAr: ["التفكير المعقد", "الكتابة الإبداعية", "توليد الكود"],
  },
  {
    id: "CLAUDE_OPUS",
    name: "Claude Opus",
    nameAr: "كلود أوبوس",
    description: "Most powerful model for analysis and research",
    descriptionAr: "النموذج الأقوى للتحليل والبحث",
    icon: Crown,
    color: "purple",
    isPro: true,
    strengths: ["Deep analysis", "Research", "Long-form content"],
    strengthsAr: ["التحليل العميق", "البحث", "المحتوى الطويل"],
  },
  {
    id: "CLAUDE_SONNET",
    name: "Claude Sonnet",
    nameAr: "كلود سونيت",
    description: "Balanced model for everyday tasks",
    descriptionAr: "نموذج متوازن للمهام اليومية",
    icon: Brain,
    color: "blue",
    strengths: ["General conversation", "Writing", "Analysis"],
    strengthsAr: ["المحادثة العامة", "الكتابة", "التحليل"],
  },
  {
    id: "DEEPSEEK_CODER",
    name: "DeepSeek Coder",
    nameAr: "ديب سيك كودر",
    description: "Specialized in programming and code",
    descriptionAr: "متخصص في البرمجة والكود",
    icon: Code,
    color: "orange",
    isPro: true,
    strengths: ["Code generation", "Debugging", "Technical documentation"],
    strengthsAr: ["توليد الكود", "إصلاح الأخطاء", "التوثيق التقني"],
  },
]

export function ModelSelector() {
  const { t } = useTranslation("common")
  const [isOpen, setIsOpen] = useState(false)
  const { currentModel, setCurrentModel } = useAIStore()
  const { user } = useUserStore()

  const currentModelInfo = models.find((m) => m.id === currentModel) || models[2]

  const handleModelSelect = (model: AIModel) => {
    // التحقق من الصلاحيات
    const modelInfo = models.find((m) => m.id === model)
    if (modelInfo?.isPro && user?.plan === "FREE") {
      // عرض modal للترقية
      return
    }

    if (modelInfo?.isEnterprise && user?.plan !== "ENTERPRISE") {
      // عرض modal للترقية
      return
    }

    setCurrentModel(model)
    setIsOpen(false)
  }

  const getModelIcon = (model: ModelInfo) => {
    const Icon = model.icon
    return (
      <div
        className={cn(
          "p-2 rounded-lg",
          model.color === "green" && "bg-green-100",
          model.color === "blue" && "bg-blue-100",
          model.color === "purple" && "bg-purple-100",
          model.color === "orange" && "bg-orange-100",
        )}
      >
        <Icon
          size={20}
          className={cn(
            model.color === "green" && "text-green-600",
            model.color === "blue" && "text-blue-600",
            model.color === "purple" && "text-purple-600",
            model.color === "orange" && "text-orange-600",
          )}
        />
      </div>
    )
  }

  const canUseModel = (model: ModelInfo) => {
    if (model.isPro && user?.plan === "FREE") return false
    if (model.isEnterprise && user?.plan !== "ENTERPRISE") return false
    return true
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        {getModelIcon(currentModelInfo)}
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">{currentModelInfo.nameAr}</div>
          <div className="text-xs text-gray-500">{currentModelInfo.descriptionAr}</div>
        </div>
        <ChevronDown size={16} className={cn("text-gray-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full mt-2 right-0 w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-1">اختر النموذج</h3>
                <p className="text-sm text-gray-600">كل نموذج له نقاط قوة مختلفة</p>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {models.map((model) => {
                  const isSelected = model.id === currentModel
                  const canUse = canUseModel(model)

                  return (
                    <motion.button
                      key={model.id}
                      whileHover={{ backgroundColor: canUse ? "#f9fafb" : undefined }}
                      onClick={() => canUse && handleModelSelect(model.id)}
                      disabled={!canUse}
                      className={cn(
                        "w-full p-4 text-right transition-colors relative",
                        isSelected && "bg-blue-50 border-r-2 border-blue-500",
                        !canUse && "opacity-50 cursor-not-allowed",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {getModelIcon(model)}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{model.nameAr}</h4>
                            {model.isPro && (
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded">
                                PRO
                              </span>
                            )}
                            {model.isEnterprise && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs font-medium rounded">
                                Enterprise
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 mb-2">{model.descriptionAr}</p>

                          <div className="flex flex-wrap gap-1">
                            {model.strengthsAr.map((strength, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                {strength}
                              </span>
                            ))}
                          </div>
                        </div>

                        {isSelected && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          </div>
                        )}
                      </div>

                      {!canUse && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
                          <div className="text-center">
                            <Zap size={20} className="text-orange-500 mx-auto mb-1" />
                            <p className="text-sm font-medium text-gray-900">
                              {model.isPro ? "يتطلب خطة Pro" : "يتطلب خطة Enterprise"}
                            </p>
                            <button className="text-xs text-orange-600 hover:underline mt-1">ترقية الآن</button>
                          </div>
                        </div>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Sparkles size={16} />
                  <span>يمكنك تغيير النموذج في أي وقت أثناء المحادثة</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
