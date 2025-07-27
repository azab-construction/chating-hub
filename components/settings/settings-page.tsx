"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { User, Palette, CreditCard, Plug, Save, Check, Bell, Lock, Moon, Sun, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface SettingsSection {
  id: string
  title: string
  icon: React.ElementType
}

const settingsSections: SettingsSection[] = [
  { id: "profile", title: "الملف الشخصي", icon: User },
  { id: "appearance", title: "المظهر", icon: Palette },
  { id: "notifications", title: "الإشعارات", icon: Bell },
  { id: "privacy", title: "الخصوصية", icon: Lock },
  { id: "integrations", title: "التكاملات", icon: Plug },
  { id: "billing", title: "الفواتير", icon: CreditCard },
]

interface UserSettings {
  name: string
  nickname: string
  email: string
  workType: string
  language: string
  theme: "light" | "dark" | "system"
  notifications: {
    email: boolean
    push: boolean
    marketing: boolean
  }
  privacy: {
    analytics: boolean
    dataCollection: boolean
    publicProfile: boolean
  }
  preferences: {
    responseStyle: "detailed" | "concise"
    codeComments: boolean
    arabicLabels: boolean
  }
}

const integrations = [
  {
    id: "github",
    name: "GitHub",
    description: "ربط مستودعات GitHub لتحليل الكود",
    icon: "🐙",
    connected: false,
    status: "available",
  },
  {
    id: "google-drive",
    name: "Google Drive",
    description: "الوصول إلى ملفاتك في Google Drive",
    icon: "📁",
    connected: true,
    status: "connected",
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "استخدام مفتاح OpenAI الشخصي",
    icon: "🤖",
    connected: false,
    status: "available",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    description: "نماذج متخصصة في البرمجة",
    icon: "🧠",
    connected: false,
    status: "available",
  },
]

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile")
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const { toast } = useToast()

  const [settings, setSettings] = useState<UserSettings>({
    name: "محمد أحمد",
    nickname: "محمد",
    email: "mohamed@example.com",
    workType: "engineering",
    language: "ar",
    theme: "light",
    notifications: {
      email: true,
      push: true,
      marketing: false,
    },
    privacy: {
      analytics: true,
      dataCollection: false,
      publicProfile: false,
    },
    preferences: {
      responseStyle: "detailed",
      codeComments: true,
      arabicLabels: true,
    },
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error("فشل في حفظ الإعدادات")
      }

      setSaved(true)
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ إعداداتك بنجاح",
      })

      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ الإعدادات",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const updateSettings = (section: keyof UserSettings, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: typeof prev[section] === "object" ? { ...prev[section], [key]: value } : value,
    }))
  }

  const handleIntegrationToggle = async (integrationId: string, connect: boolean) => {
    try {
      if (connect) {
        // Start OAuth flow or show API key input
        if (integrationId === "github" || integrationId === "google-drive") {
          window.open(`/api/auth/${integrationId}`, "_blank", "width=500,height=600")
        } else {
          // Show API key input modal
          toast({
            title: "مطلوب مفتاح API",
            description: "يرجى إدخال مفتاح API الخاص بك",
          })
        }
      } else {
        const response = await fetch(`/api/integrations/${integrationId}/disconnect`, {
          method: "POST",
          credentials: "include",
        })

        if (response.ok) {
          toast({
            title: "تم قطع الاتصال",
            description: "تم قطع الاتصال بنجاح",
          })
        }
      }
    } catch (error) {
      toast({
        title: "خطأ في التكامل",
        description: "حدث خطأ أثناء إدارة التكامل",
        variant: "destructive",
      })
    }
  }

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">الملف الشخصي</h2>
        <p className="text-gray-600">إدارة معلوماتك الشخصية وتفضيلاتك</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>المعلومات الأساسية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم الكامل</Label>
              <Input
                id="name"
                value={settings.name}
                onChange={(e) => setSettings((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="محمد أحمد"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nickname">الاسم المختصر</Label>
              <Input
                id="nickname"
                value={settings.nickname}
                onChange={(e) => setSettings((prev) => ({ ...prev, nickname: e.target.value }))}
                placeholder="محمد"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={settings.email}
              onChange={(e) => setSettings((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="mohamed@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workType">نوع العمل</Label>
            <Select
              value={settings.workType}
              onValueChange={(value) => setSettings((prev) => ({ ...prev, workType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="engineering">الهندسة</SelectItem>
                <SelectItem value="design">التصميم</SelectItem>
                <SelectItem value="marketing">التسويق</SelectItem>
                <SelectItem value="business">الأعمال</SelectItem>
                <SelectItem value="education">التعليم</SelectItem>
                <SelectItem value="research">البحث</SelectItem>
                <SelectItem value="other">أخرى</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>تفضيلات الاستجابة</CardTitle>
          <CardDescription>كيف تريد أن يتفاعل الذكاء الاصطناعي معك</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>الردود المفصلة</Label>
              <p className="text-sm text-gray-500">تفضيل الوضوح على الإيجاز</p>
            </div>
            <Switch
              checked={settings.preferences.responseStyle === "detailed"}
              onCheckedChange={(checked) =>
                updateSettings("preferences", "responseStyle", checked ? "detailed" : "concise")
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>تعليقات الكود بالعربية</Label>
              <p className="text-sm text-gray-500">إضافة تعليقات عربية للكود</p>
            </div>
            <Switch
              checked={settings.preferences.codeComments}
              onCheckedChange={(checked) => updateSettings("preferences", "codeComments", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>المصطلحات العربية</Label>
              <p className="text-sm text-gray-500">استخدام المصطلحات العربية عند الإمكان</p>
            </div>
            <Switch
              checked={settings.preferences.arabicLabels}
              onCheckedChange={(checked) => updateSettings("preferences", "arabicLabels", checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAppearanceSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">المظهر</h2>
        <p className="text-gray-600">تخصيص مظهر التطبيق حسب تفضيلاتك</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>السمة</CardTitle>
          <CardDescription>اختر السمة المفضلة لديك</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "light", label: "فاتح", icon: Sun },
              { value: "dark", label: "مظلم", icon: Moon },
              { value: "system", label: "النظام", icon: Monitor },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setSettings((prev) => ({ ...prev, theme: value as any }))}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors",
                  settings.theme === value ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300",
                )}
              >
                <Icon size={24} />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>اللغة</CardTitle>
          <CardDescription>اختر لغة واجهة التطبيق</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={settings.language}
            onValueChange={(value) => setSettings((prev) => ({ ...prev, language: value }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ar">العربية</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  )

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">الإشعارات</h2>
        <p className="text-gray-600">إدارة إشعارات التطبيق والبريد الإلكتروني</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إعدادات الإشعارات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>إشعارات البريد الإلكتروني</Label>
              <p className="text-sm text-gray-500">تلقي إشعارات عبر البريد الإلكتروني</p>
            </div>
            <Switch
              checked={settings.notifications.email}
              onCheckedChange={(checked) => updateSettings("notifications", "email", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>الإشعارات الفورية</Label>
              <p className="text-sm text-gray-500">إشعارات المتصفح الفورية</p>
            </div>
            <Switch
              checked={settings.notifications.push}
              onCheckedChange={(checked) => updateSettings("notifications", "push", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>الإشعارات التسويقية</Label>
              <p className="text-sm text-gray-500">تلقي أخبار المنتج والعروض</p>
            </div>
            <Switch
              checked={settings.notifications.marketing}
              onCheckedChange={(checked) => updateSettings("notifications", "marketing", checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderPrivacySection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">الخصوصية والأمان</h2>
        <p className="text-gray-600">إدارة إعدادات الخصوصية وحماية البيانات</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إعدادات البيانات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>التحليلات</Label>
              <p className="text-sm text-gray-500">السماح بجمع بيانات الاستخدام لتحسين الخدمة</p>
            </div>
            <Switch
              checked={settings.privacy.analytics}
              onCheckedChange={(checked) => updateSettings("privacy", "analytics", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>جمع البيانات</Label>
              <p className="text-sm text-gray-500">جمع بيانات إضافية لتحسين النماذج</p>
            </div>
            <Switch
              checked={settings.privacy.dataCollection}
              onCheckedChange={(checked) => updateSettings("privacy", "dataCollection", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>الملف العام</Label>
              <p className="text-sm text-gray-500">جعل ملفك الشخصي مرئياً للآخرين</p>
            </div>
            <Switch
              checked={settings.privacy.publicProfile}
              onCheckedChange={(checked) => updateSettings("privacy", "publicProfile", checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderIntegrationsSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">التكاملات</h2>
        <p className="text-gray-600">ربط حساباتك وخدماتك المفضلة</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((integration) => (
          <Card key={integration.id} className="relative">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{integration.icon}</span>
                <div className="flex-1">
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                  <CardDescription>{integration.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {integration.connected ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600 font-medium">متصل</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-sm text-gray-500">غير متصل</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">{integration.connected ? "تم الربط بنجاح" : "غير مربوط"}</div>
                <Button
                  variant={integration.connected ? "outline" : "default"}
                  size="sm"
                  onClick={() => handleIntegrationToggle(integration.id, !integration.connected)}
                >
                  {integration.connected ? "قطع الاتصال" : "ربط"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderBillingSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">الفواتير والاشتراك</h2>
        <p className="text-gray-600">إدارة اشتراكك ومعلومات الدفع</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الخطة الحالية</CardTitle>
          <CardDescription>خطة مجانية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>الاستخدام الشهري</span>
              <span className="font-medium">150 / 1000 رسالة</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: "15%" }}></div>
            </div>
            <Button className="w-full">ترقية إلى الخطة المدفوعة</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return renderProfileSection()
      case "appearance":
        return renderAppearanceSection()
      case "notifications":
        return renderNotificationsSection()
      case "privacy":
        return renderPrivacySection()
      case "integrations":
        return renderIntegrationsSection()
      case "billing":
        return renderBillingSection()
      default:
        return renderProfileSection()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 bg-white rounded-lg shadow-sm p-6 h-fit">
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
                        ? "bg-blue-50 text-blue-600 border border-blue-200"
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
              {renderSection()}
            </motion.div>

            {/* Save Button */}
            <Separator className="my-8" />
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">آخر حفظ: منذ 5 دقائق</div>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className={cn("flex items-center gap-2", saved && "bg-green-600 hover:bg-green-700")}
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
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
