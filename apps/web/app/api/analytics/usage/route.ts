import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "30d"

    // حساب التاريخ المطلوب
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // جلب الرسائل في الفترة المحددة
    const messages = await prisma.message.findMany({
      where: {
        chat: {
          userId: session.user.id,
        },
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        chat: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    // حساب الإحصائيات
    const totalMessages = messages.length
    const totalTokens = messages.reduce((sum, msg) => {
      const usage = msg.metadata?.usage
      return sum + (usage?.totalTokens || 0)
    }, 0)

    const responseTimes = messages
      .filter((msg) => msg.role === "ASSISTANT" && msg.metadata?.responseTime)
      .map((msg) => msg.metadata.responseTime)

    const averageResponseTime =
      responseTimes.length > 0 ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length : 0

    // إحصائيات استخدام النماذج
    const modelUsage = messages
      .filter((msg) => msg.role === "ASSISTANT" && msg.metadata?.model)
      .reduce(
        (acc, msg) => {
          const model = msg.metadata.model
          acc[model] = (acc[model] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

    const modelUsageArray = Object.entries(modelUsage).map(([model, count]) => ({
      model,
      count,
      percentage: Math.round((count / totalMessages) * 100),
    }))

    // الاستخدام اليومي
    const dailyUsage = messages.reduce(
      (acc, msg) => {
        const date = msg.createdAt.toISOString().split("T")[0]
        if (!acc[date]) {
          acc[date] = { date, messages: 0, tokens: 0 }
        }
        acc[date].messages += 1
        acc[date].tokens += msg.metadata?.usage?.totalTokens || 0
        return acc
      },
      {} as Record<string, any>,
    )

    const dailyUsageArray = Object.values(dailyUsage)

    // الميزات الأكثر استخداماً
    const topFeatures = [
      { feature: "محادثة نصية", usage: totalMessages },
      { feature: "رفع ملفات", usage: messages.filter((m) => m.metadata?.files).length },
      { feature: "تكاملات", usage: messages.filter((m) => m.metadata?.integrations).length },
    ]

    const stats = {
      totalMessages,
      totalTokens,
      averageResponseTime,
      modelUsage: modelUsageArray,
      dailyUsage: dailyUsageArray,
      topFeatures,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching usage stats:", error)
    return NextResponse.json({ error: "خطأ في جلب الإحصائيات" }, { status: 500 })
  }
}
