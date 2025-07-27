"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Sparkles, MessageSquare, Zap, Shield, Globe, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { ChatInterface } from "@/components/chat/chat-interface"
import { Sidebar } from "@/components/layout/sidebar"
import { useChatStore } from "@/store/chat"

const features = [
  {
    icon: MessageSquare,
    title: "محادثة ذكية",
    description: "تفاعل مع أحدث نماذج الذكاء الاصطناعي بالعربية",
  },
  {
    icon: Code,
    title: "برمجة متقدمة",
    description: "مساعدة في كتابة وتحليل الكود بجميع اللغات",
  },
  {
    icon: Globe,
    title: "تكاملات قوية",
    description: "اتصال مع GitHub وGoogle Drive والمزيد",
  },
  {
    icon: Shield,
    title: "أمان عالي",
    description: "حماية بياناتك مع أفضل معايير الأمان",
  },
  {
    icon: Zap,
    title: "سرعة فائقة",
    description: "استجابات سريعة ومعالجة فورية",
  },
  {
    icon: Sparkles,
    title: "ذكاء متطور",
    description: "تعاون بين عدة نماذج ذكية للحصول على أفضل النتائج",
  },
]

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { chats, loadChats } = useChatStore()

  useEffect(() => {
    const initializeApp = async () => {
      if (status === "loading") return

      if (session) {
        await loadChats()
      }

      setIsLoading(false)
    }

    initializeApp()
  }, [session, status, loadChats])

  if (isLoading || status === "loading") {
    return <LoadingScreen />
  }

  if (session) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "mr-64" : "mr-0"}`}>
          <ChatInterface />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Sparkles className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">مركز الذكاء الاصطناعي</h1>
                <p className="text-sm text-gray-600">AI Chat Hub</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push("/auth/signin")}>
                تسجيل الدخول
              </Button>
              <Button onClick={() => router.push("/auth/signin")}>ابدأ الآن</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              مستقبل الذكاء الاصطناعي
              <span className="text-blue-600"> بالعربية</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              منصة متكاملة تجمع أقوى نماذج الذكاء الاصطناعي في مكان واحد مع دعم كامل للغة العربية وتكاملات متقدمة لتحسين
              إنتاجيتك
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" onClick={() => router.push("/auth/signin")}>
                <Sparkles className="ml-2" size={20} />
                ابدأ مجاناً
              </Button>
              <Button variant="outline" size="lg">
                شاهد العرض التوضيحي
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">لماذا تختار مركز الذكاء الاصطناعي؟</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              نقدم تجربة فريدة تجمع بين قوة الذكاء الاصطناعي وسهولة الاستخدام
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="text-blue-600" size={24} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="container mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h3 className="text-3xl font-bold text-white mb-6">جاهز لتجربة مستقبل الذكاء الاصطناعي؟</h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              انضم إلى آلاف المستخدمين الذين يستفيدون من قوة الذكاء الاصطناعي يومياً
            </p>
            <Button size="lg" variant="secondary" onClick={() => router.push("/auth/signin")}>
              <Sparkles className="ml-2" size={20} />
              ابدأ الآن مجاناً
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="text-white" size={20} />
                </div>
                <span className="font-bold">مركز الذكاء الاصطناعي</span>
              </div>
              <p className="text-gray-400">منصة متكاملة للذكاء الاصطناعي مع دعم كامل للعربية</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">المنتج</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    الميزات
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    الأسعار
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    التكاملات
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">الدعم</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    المساعدة
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    الوثائق
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    اتصل بنا
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">الشركة</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    من نحن
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    المدونة
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    الوظائف
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 مركز الذكاء الاصطناعي. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
