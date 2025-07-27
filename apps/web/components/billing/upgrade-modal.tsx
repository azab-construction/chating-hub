"use client"

import type React from "react"

import { useState } from "react"
import { useTranslation } from "next-i18next"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, Sparkles, Zap, Crown, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUserStore } from "@/store/user"

interface Plan {
  id: string
  name: string
  nameAr: string
  price: number
  currency: string
  interval: string
  features: string[]
  featuresAr: string[]
  popular?: boolean
  icon: React.ElementType
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    nameAr: "مجاني",
    price: 0,
    currency: "USD",
    interval: "month",
    icon: Sparkles,
    features: ["Claude Sonnet access", "5 messages per day", "Basic file upload", "Community support"],
    featuresAr: ["الوصول إلى Claude Sonnet", "5 رسائل يومياً", "رفع ملفات أساسي", "دعم المجتمع"],
  },
  {
    id: "pro",
    name: "Pro",
    nameAr: "احترافي",
    price: 20,
    currency: "USD",
    interval: "month",
    icon: Zap,
    popular: true,
    features: [
      "All AI models (GPT-4, Claude Opus, DeepSeek)",
      "Unlimited messages",
      "Advanced file processing",
      "All integrations",
      "Priority support",
      "Custom workflows",
    ],
    featuresAr: [
      "جميع نماذج الذكاء الاصطناعي",
      "رسائل غير محدودة",
      "معالجة ملفات متقدمة",
      "جميع التكاملات",
      "دعم أولوية",
      "سير عمل مخصص",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    nameAr: "مؤسسي",
    price: 100,
    currency: "USD",
    interval: "month",
    icon: Crown,
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Custom AI training",
      "Advanced analytics",
      "Dedicated support",
      "SLA guarantee",
    ],
    featuresAr: [
      "كل ما في الاحترافي",
      "تعاون الفريق",
      "تدريب ذكاء اصطناعي مخصص",
      "تحليلات متقدمة",
      "دعم مخصص",
      "ضمان مستوى الخدمة",
    ],
  },
]

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { t } = useTranslation("billing")
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const { user } = useUserStore()

  const handleUpgrade = async (planId: string) => {
    if (planId === "free") return

    setIsProcessing(true)
    setSelectedPlan(planId)

    try {
      const response = await fetch("/api/billing/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          successUrl: `${window.location.origin}/billing/success`,
          cancelUrl: `${window.location.origin}/billing/cancel`,
        }),
      })

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error("Upgrade error:", error)
    } finally {
      setIsProcessing(false)
      setSelectedPlan(null)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">ارتقِ بتجربتك</h2>
                  <p className="text-orange-100">اختر الخطة المناسبة لاحتياجاتك</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Plans */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => {
                  const Icon = plan.icon
                  const isCurrentPlan = user?.plan?.toLowerCase() === plan.id
                  const isSelected = selectedPlan === plan.id

                  return (
                    <motion.div
                      key={plan.id}
                      whileHover={{ scale: 1.02 }}
                      className={cn(
                        "relative bg-white border-2 rounded-xl p-6 cursor-pointer transition-all",
                        plan.popular ? "border-orange-500 shadow-lg" : "border-gray-200 hover:border-gray-300",
                        isCurrentPlan && "ring-2 ring-green-500",
                      )}
                      onClick={() => !isCurrentPlan && handleUpgrade(plan.id)}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                            الأكثر شعبية
                          </span>
                        </div>
                      )}

                      <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4">
                          <Icon className="text-orange-600" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.nameAr}</h3>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                          <span className="text-gray-500">/{plan.interval === "month" ? "شهر" : "سنة"}</span>
                        </div>
                      </div>

                      <ul className="space-y-3 mb-6">
                        {plan.featuresAr.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        disabled={isCurrentPlan || isProcessing}
                        className={cn(
                          "w-full py-3 px-4 rounded-lg font-medium transition-all",
                          isCurrentPlan
                            ? "bg-green-100 text-green-700 cursor-not-allowed"
                            : plan.popular
                              ? "bg-orange-500 hover:bg-orange-600 text-white"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-900",
                          isSelected && "opacity-50",
                        )}
                      >
                        {isSelected ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            جاري المعالجة...
                          </div>
                        ) : isCurrentPlan ? (
                          "الخطة الحالية"
                        ) : plan.id === "free" ? (
                          "مجاني"
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <CreditCard size={16} />
                            اشترك الآن
                          </div>
                        )}
                      </button>
                    </motion.div>
                  )
                })}
              </div>

              {/* FAQ */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">أسئلة شائعة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">هل يمكنني إلغاء الاشتراك في أي وقت؟</h4>
                    <p className="text-gray-600">نعم، يمكنك إلغاء اشتراكك في أي وقت من إعدادات الحساب.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">هل تتوفر فترة تجريبية مجانية؟</h4>
                    <p className="text-gray-600">نعم، جميع الخطط المدفوعة تأتي مع فترة تجريبية مجانية لمدة 7 أيام.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
