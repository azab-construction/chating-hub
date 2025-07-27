"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTranslation } from "next-i18next"
import { motion } from "framer-motion"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { MessageSquare, Clock, Zap, TrendingUp, Brain, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

interface UsageStats {
  totalMessages: number
  totalTokens: number
  averageResponseTime: number
  modelUsage: Array<{
    model: string
    count: number
    percentage: number
  }>
  dailyUsage: Array<{
    date: string
    messages: number
    tokens: number
  }>
  topFeatures: Array<{
    feature: string
    usage: number
  }>
}

const COLORS = ["#f97316", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"]

export function UsageDashboard() {
  const { t } = useTranslation("analytics")
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUsageStats()
  }, [timeRange])

  const fetchUsageStats = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/analytics/usage?range=${timeRange}`)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching usage stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const StatCard = ({
    title,
    value,
    icon: Icon,
    change,
    color = "orange",
  }: {
    title: string
    value: string | number
    icon: React.ElementType
    change?: number
    color?: string
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change !== undefined && (
            <div
              className={cn("flex items-center gap-1 mt-2 text-sm", change >= 0 ? "text-green-600" : "text-red-600")}
            >
              <TrendingUp size={14} />
              <span>
                {change >= 0 ? "+" : ""}
                {change}%
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "p-3 rounded-lg",
            color === "orange" && "bg-orange-100",
            color === "blue" && "bg-blue-100",
            color === "green" && "bg-green-100",
            color === "yellow" && "bg-yellow-100",
          )}
        >
          <Icon
            size={24}
            className={cn(
              color === "orange" && "text-orange-600",
              color === "blue" && "text-blue-600",
              color === "green" && "text-green-600",
              color === "yellow" && "text-yellow-600",
            )}
          />
        </div>
      </div>
    </motion.div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل الإحصائيات...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <Activity size={48} className="text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">لا توجد بيانات متاحة</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">لوحة الإحصائيات</h2>
          <p className="text-gray-600 mt-1">تتبع استخدامك للذكاء الاصطناعي</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { key: "7d", label: "7 أيام" },
            { key: "30d", label: "30 يوم" },
            { key: "90d", label: "90 يوم" },
          ].map((range) => (
            <button
              key={range.key}
              onClick={() => setTimeRange(range.key as any)}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                timeRange === range.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900",
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="إجمالي الرسائل"
          value={stats.totalMessages.toLocaleString("ar-SA")}
          icon={MessageSquare}
          change={12}
          color="orange"
        />
        <StatCard
          title="إجمالي الرموز"
          value={stats.totalTokens.toLocaleString("ar-SA")}
          icon={Brain}
          change={8}
          color="blue"
        />
        <StatCard
          title="متوسط وقت الاستجابة"
          value={`${stats.averageResponseTime.toFixed(1)}ث`}
          icon={Clock}
          change={-5}
          color="green"
        />
        <StatCard title="النماذج المستخدمة" value={stats.modelUsage.length} icon={Zap} color="yellow" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Usage Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">الاستخدام اليومي</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.dailyUsage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("ar-SA", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString("ar-SA")}
                formatter={(value, name) => [value, name === "messages" ? "الرسائل" : "الرموز"]}
              />
              <Line
                type="monotone"
                dataKey="messages"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ fill: "#f97316", strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="tokens"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Model Usage Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">استخدام النماذج</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.modelUsage}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ model, percentage }) => `${model} (${percentage}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {stats.modelUsage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">الميزات الأكثر استخداماً</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.topFeatures} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="feature" tick={{ fontSize: 12 }} width={100} />
            <Tooltip />
            <Bar dataKey="usage" fill="#f97316" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}
