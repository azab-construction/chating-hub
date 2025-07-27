"use client"

import type React from "react"

import { useState } from "react"
import { useTranslation } from "next-i18next"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Mail,
  Calendar,
  HardDrive,
  CreditCard,
  Github,
  FileText,
  MessageSquare,
  Zap,
  Check,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useIntegrationsStore } from "@/store/integrations"

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ElementType
  category: "web" | "desktop"
  isConnected: boolean
  isPro?: boolean
}

const webIntegrations: Integration[] = [
  {
    id: "gmail",
    name: "Gmail",
    description: "صياغة الردود، تلخيص المحادثات، والبحث في صندوق الوارد",
    icon: Mail,
    category: "web",
    isConnected: false,
  },
  {
    id: "google-drive",
    name: "Google Drive",
    description: "البحث وتحليل الملفات فوراً",
    icon: HardDrive,
    category: "web",
    isConnected: false,
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "فهم جدولك الزمني وتحسين وقتك",
    icon: Calendar,
    category: "web",
    isConnected: false,
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "إدارة الموارد في حساب Stripe الخاص بك والبحث في...",
    icon: CreditCard,
    category: "web",
    isConnected: false,
  },
  {
    id: "notion",
    name: "Notion",
    description: "ربط مساحة عمل Notion للبحث والتحديث وتشغيل سير العمل...",
    icon: FileText,
    category: "web",
    isConnected: false,
  },
  {
    id: "github",
    name: "GitHub",
    description: "تصفح المستودعات وتحليل الكود والمساعدة في التطوير",
    icon: Github,
    category: "web",
    isConnected: false,
  },
]

const desktopIntegrations: Integration[] = [
  {
    id: "apple-notes",
    name: "Read and Write Apple Notes",
    description: "قراءة وكتابة وإدارة الملاحظات في Apple Notes",
    icon: FileText,
    category: "desktop",
    isConnected: false,
  },
  {
    id: "imessages",
    name: "Read and Send iMessages",
    description: "إرسال وقراءة وإدارة الرسائل من خلال تطبيق Messages من Apple",
    icon: MessageSquare,
    category: "desktop",
    isConnected: false,
  },
  {
    id: "filesystem",
    name: "Filesystem",
    description: "السماح لـ Claude بالوصول إلى نظام الملفات لقراءة وكتابة الملفات",
    icon: HardDrive,
    category: "desktop",
    isConnected: false,
  },
]

interface IntegrationsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function IntegrationsModal({ isOpen, onClose }: IntegrationsModalProps) {
  const { t } = useTranslation("integrations")
  const [activeTab, setActiveTab] = useState<"web" | "desktop">("web")
  const { integrations, connectIntegration, disconnectIntegration } = useIntegrationsStore()

  const handleConnect = async (integrationId: string) => {
    try {
      // Start OAuth flow
      const authUrl = `/api/auth/${integrationId}`
      const popup = window.open(authUrl, "oauth", "width=500,height=600,scrollbars=yes,resizable=yes")

      // Listen for OAuth completion
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed)
          // Refresh integrations status
          window.location.reload()
        }
      }, 1000)
    } catch (error) {
      console.error("Error connecting integration:", error)
    }
  }

  const handleDisconnect = async (integrationId: string) => {
    try {
      await disconnectIntegration(integrationId)
    } catch (error) {
      console.error("Error disconnecting integration:", error)
    }
  }

  const renderIntegrationCard = (integration: Integration) => {
    const Icon = integration.icon
    const isConnected = integrations.some((i) => i.type === integration.id && i.isEnabled)

    return (
      <motion.div
        key={integration.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start gap-4">
          <div className="p-2 bg-gray-50 rounded-lg">
            <Icon size={24} className="text-gray-600" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-gray-900">{integration.name}</h3>
              {integration.isPro && (
                <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs font-medium rounded">PRO</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4">{integration.description}</p>

            <div className="flex items-center justify-between">
              {isConnected ? (
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-green-500" />
                  <span className="text-sm text-green-600 font-medium">متصل</span>
                </div>
              ) : (
                <button
                  onClick={() => handleConnect(integration.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Zap size={16} />
                  اتصال
                </button>
              )}

              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ExternalLink size={16} className="text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    )
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
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">الاتصالات</h2>
                <p className="text-gray-600 mt-1">
                  افتح المزيد مع Claude عندما تربط هذه الأدوات المراجعة والموصى بها من شركاء Anthropic الموثوقين.
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("web")}
                className={cn(
                  "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                  activeTab === "web"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700",
                )}
              >
                الويب
              </button>
              <button
                onClick={() => setActiveTab("desktop")}
                className={cn(
                  "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                  activeTab === "desktop"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700",
                )}
              >
                امتدادات سطح المكتب
              </button>
              <div className="flex-1" />
              <button className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-800">
                إدارة الاتصالات
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeTab === "web"
                  ? webIntegrations.map(renderIntegrationCard)
                  : desktopIntegrations.map(renderIntegrationCard)}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
