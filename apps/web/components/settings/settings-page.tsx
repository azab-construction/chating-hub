"use client"

import type React from "react"

import { useState } from "react"
import { useTranslation } from "next-i18next"
import { motion } from "framer-motion"
import { User, Palette, Shield, CreditCard, Plug, Save, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUserStore } from "@/store/user"

interface SettingsSection {
  id: string
  title: string
  icon: React.ElementType
}

const settingsSections: SettingsSection[] = [
  { id: "profile", title: "الملف الشخصي", icon: User },
  { id: "appearance", title: "المظهر", icon: Palette },
  { id: "account", title: "الحساب", icon: Shield },
  { id: "privacy", title: "الخصوصية", icon: Shield },
  { id: "billing", title: "الفواتير", icon: CreditCard },
  { id: "connectors", title: "الاتصالات", icon: Plug },
]

export function SettingsPage() {
  const { t } = useTranslation("settings")
  const [activeSection, setActiveSection] = useState("profile")
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const { user, updateUser } = useUserStore()

  const [formData, setFormData] = useState({
    name: user?.name || "",
    nickname: user?.nickname || "",
    workType: user?.workType || "engineering",
    language: user?.language || "ar",
    preferences: user?.preferences || {
      responseStyle: "detailed",
      codeComments: true,
      arabicLabels: true,
      darkMode: false,
      notifications: true,
    },
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateUser(formData)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error("Error saving settings:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">الملف الشخصي</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="محمد عزب"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ماذا يجب أن نناديك؟</label>
          <input
            type="text"
            value={formData.nickname}
            onChange={(e) => setFormData((prev) => ({ ...prev, nickname: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="علاء"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">ما الذي يصف عملك بشكل أفضل؟</label>
        <select
          value={formData.workType}
          onChange={(e) => setFormData((prev) => ({ ...prev, workType: e.target.value }))}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="engineering">الهندسة</option>
          <option value="design">التصميم</option>
          <option value="marketing">التسويق</option>
          <option value="business">الأعمال</option>
          <option value="education">التعليم</option>
          <option value="research">البحث</option>
          <option value="other">أخرى</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          ما التفضيلات الشخصية التي يجب على Claude مراعاتها في الردود؟
          <span className="text-xs text-gray-500 block mt-1">BETA</span>
        </label>

        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="detailed-responses"
              checked={formData.preferences.responseStyle === "detailed"}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  preferences: {
                    ...prev.preferences,
                    responseStyle: e.target.checked ? "detailed" : "concise",
                  },
                }))
              }
              className="mt-1"
            />
            <div>
              <label htmlFor="detailed-responses" className="text-sm font-medium">
                ✅ يُفضل الوضوح أكثر من التبسيط
              </label>
              <p className="text-xs text-gray-600 mt-1">
                "أفضل أن يشتمل الرد على تفاصيل أكثر، حتى لو كان أطول، بدلاً من الإيجاز"
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="arabic-comments"
              checked={formData.preferences.arabicLabels}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  preferences: {
                    ...prev.preferences,
                    arabicLabels: e.target.checked,
                  },
                }))
              }
              className="mt-1"
            />
            <div>
              <label htmlFor="arabic-comments" className="text-sm font-medium">
                ✅ أوامر واضحة ومباشرة
              </label>
              <p className="text-xs text-gray-600 mt-1">"أفضل "اكتب كود مثال" أو "اشرح لي"</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="code-comments"
              checked={formData.preferences.codeComments}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  preferences: {
                    ...prev.preferences,
                    codeComments: e.target.checked,
                  },
                }))
              }
              className="mt-1"
            />
            <div>
              <label htmlFor="code-comments" className="text-sm font-medium">
                ✅ تنفيذ الخطوات بالتفصيل (من الألف للياء)
              </label>
              <p className="text-xs text-gray-600 mt-1">إذا تحتاج أكمل كل خطوة للنهاية قبل ما ننتقل للي بعدها</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">يقول Claude على:</p>
            <p className="text-sm text-gray-700">يركز في المهمة الحالية ويخلصها تماماً، وبعدين يسألك لو تحب تكمل</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAppearanceSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">المظهر</h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">الوضع المظلم</h3>
            <p className="text-sm text-gray-500">تفعيل المظهر المظلم للتطبيق</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.preferences.darkMode}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  preferences: {
                    ...prev.preferences,
                    darkMode: e.target.checked,
                  },
                }))
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">اللغة</label>
          <select
            value={formData.language}
            onChange={(e) => setFormData((prev) => ({ ...prev, language: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="ar">العربية</option>
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-xl font-semibold text-gray-900 mb-6">الإعدادات</h1>
            <nav className="space-y-2">
              {settingsSections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg text-right transition-colors",
                      activeSection === section.id
                        ? "bg-orange-50 text-orange-600 border border-orange-200"
                        : "hover:bg-gray-50 text-gray-700",
                    )}
                  >
                    <Icon size={20} />
                    <span className="text-sm font-medium">{section.title}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white rounded-lg shadow-sm p-8">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeSection === "profile" && renderProfileSection()}
              {activeSection === "appearance" && renderAppearanceSection()}
              {/* Add other sections as needed */}
            </motion.div>

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all",
                  saved
                    ? "bg-green-500 text-white"
                    : "bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50",
                )}
              >
                {saved ? (
                  <>
                    <Check size={20} />
                    تم الحفظ
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
