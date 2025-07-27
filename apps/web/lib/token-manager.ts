interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

interface ConversationContext {
  messages: Array<{
    role: string
    content: string
    timestamp: Date
  }>
  summary?: string
  keyPoints?: string[]
}

export class TokenManager {
  private readonly MAX_CONTEXT_TOKENS = 8000
  private readonly SUMMARY_THRESHOLD = 6000
  private readonly EMERGENCY_TRIM_TOKENS = 4000

  /**
   * إدارة ذكية للرموز مع الحفاظ على السياق المهم
   */
  async optimizeContext(context: ConversationContext, newMessage: string): Promise<ConversationContext> {
    const currentTokens = this.estimateTokens(context)
    const newMessageTokens = this.estimateTokens({
      messages: [{ role: "user", content: newMessage, timestamp: new Date() }],
    })

    if (currentTokens + newMessageTokens > this.MAX_CONTEXT_TOKENS) {
      return await this.trimContext(context, newMessage)
    }

    return context
  }

  /**
   * تقدير عدد الرموز بناءً على المحتوى
   */
  private estimateTokens(context: ConversationContext): number {
    let totalTokens = 0

    // حساب رموز الرسائل
    context.messages.forEach((message) => {
      // تقدير تقريبي: 4 أحرف = 1 رمز للعربية، 3 أحرف = 1 رمز للإنجليزية
      const isArabic = /[\u0600-\u06FF]/.test(message.content)
      const ratio = isArabic ? 4 : 3
      totalTokens += Math.ceil(message.content.length / ratio)
    })

    // حساب رموز الملخص
    if (context.summary) {
      const isArabic = /[\u0600-\u06FF]/.test(context.summary)
      const ratio = isArabic ? 4 : 3
      totalTokens += Math.ceil(context.summary.length / ratio)
    }

    return totalTokens
  }

  /**
   * تقليم السياق مع الحفاظ على المعلومات المهمة
   */
  private async trimContext(context: ConversationContext, newMessage: string): Promise<ConversationContext> {
    const messages = [...context.messages]

    // الاحتفاظ بالرسائل الحديثة (آخر 5 رسائل)
    const recentMessages = messages.slice(-5)
    const olderMessages = messages.slice(0, -5)

    // إنشاء ملخص للرسائل القديمة إذا لم يكن موجوداً
    let summary = context.summary
    if (olderMessages.length > 0 && !summary) {
      summary = await this.createSummary(olderMessages)
    }

    // إذا كان السياق لا يزال كبيراً، قم بتقليم أكثر
    const trimmedContext: ConversationContext = {
      messages: recentMessages,
      summary,
      keyPoints: context.keyPoints,
    }

    const estimatedTokens = this.estimateTokens(trimmedContext)
    if (estimatedTokens > this.EMERGENCY_TRIM_TOKENS) {
      // تقليم طارئ: الاحتفاظ بآخر 3 رسائل فقط
      trimmedContext.messages = recentMessages.slice(-3)
    }

    return trimmedContext
  }

  /**
   * إنشاء ملخص للرسائل القديمة
   */
  private async createSummary(messages: Array<{ role: string; content: string; timestamp: Date }>): Promise<string> {
    const conversationText = messages.map((msg) => `${msg.role}: ${msg.content}`).join("\n")

    // استخدام نموذج سريع لإنشاء الملخص
    try {
      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: conversationText,
          language: "ar",
        }),
      })

      const { summary } = await response.json()
      return summary
    } catch (error) {
      console.error("Error creating summary:", error)
      // إنشاء ملخص بسيط في حالة الفشل
      return `ملخص المحادثة: تم مناقشة ${messages.length} رسائل بين ${new Date(messages[0].timestamp).toLocaleDateString("ar-SA")} و ${new Date(messages[messages.length - 1].timestamp).toLocaleDateString("ar-SA")}`
    }
  }

  /**
   * استخراج النقاط المهمة من المحادثة
   */
  async extractKeyPoints(messages: Array<{ role: string; content: string }>): Promise<string[]> {
    const conversationText = messages
      .filter((msg) => msg.role === "assistant")
      .map((msg) => msg.content)
      .join("\n")

    try {
      const response = await fetch("/api/ai/extract-points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: conversationText,
          language: "ar",
        }),
      })

      const { keyPoints } = await response.json()
      return keyPoints
    } catch (error) {
      console.error("Error extracting key points:", error)
      return []
    }
  }

  /**
   * تحسين الاستعلام للحصول على أفضل النتائج
   */
  optimizePrompt(userMessage: string, context: ConversationContext): string {
    let optimizedPrompt = ""

    // إضافة الملخص إذا كان متوفراً
    if (context.summary) {
      optimizedPrompt += `السياق السابق: ${context.summary}\n\n`
    }

    // إضافة النقاط المهمة
    if (context.keyPoints && context.keyPoints.length > 0) {
      optimizedPrompt += `النقاط المهمة: ${context.keyPoints.join(", ")}\n\n`
    }

    // إضافة الرسائل الحديثة
    const recentMessages = context.messages.slice(-3)
    if (recentMessages.length > 0) {
      optimizedPrompt += "المحادثة الحديثة:\n"
      recentMessages.forEach((msg) => {
        optimizedPrompt += `${msg.role === "user" ? "المستخدم" : "المساعد"}: ${msg.content}\n`
      })
      optimizedPrompt += "\n"
    }

    // إضافة الرسالة الجديدة
    optimizedPrompt += `المستخدم: ${userMessage}`

    return optimizedPrompt
  }
}
