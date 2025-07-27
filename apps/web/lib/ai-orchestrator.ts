import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"
import { deepseek } from "@ai-sdk/deepseek"
import type { AIModel, Message } from "@prisma/client"

interface AIResponse {
  content: string
  model: AIModel
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  responseTime: number
}

interface WorkflowContext {
  userMessage: string
  conversationHistory: Message[]
  userPreferences: any
  requestType: "code_generation" | "analysis" | "general" | "creative"
}

export class AIOrchestrator {
  private readonly models = {
    gpt4: openai("gpt-4"),
    gpt4_turbo: openai("gpt-4-turbo"),
    claude_opus: anthropic("claude-3-opus-20240229"),
    claude_sonnet: anthropic("claude-3-sonnet-20240229"),
    deepseek_coder: deepseek("deepseek-coder"),
  }

  async processUserRequest(
    userMessage: string,
    conversationHistory: Message[],
    userPreferences: any,
  ): Promise<AIResponse> {
    const startTime = Date.now()

    try {
      // تحليل نوع الطلب
      const requestType = await this.analyzeRequestType(userMessage)

      const context: WorkflowContext = {
        userMessage,
        conversationHistory,
        userPreferences,
        requestType,
      }

      // تنفيذ سير العمل المناسب
      let response: AIResponse

      switch (requestType) {
        case "code_generation":
          response = await this.executeCodeWorkflow(context)
          break
        case "analysis":
          response = await this.executeAnalysisWorkflow(context)
          break
        case "creative":
          response = await this.executeCreativeWorkflow(context)
          break
        default:
          response = await this.executeGeneralWorkflow(context)
      }

      response.responseTime = Date.now() - startTime
      return response
    } catch (error) {
      console.error("AI Orchestrator error:", error)

      // استجابة احتياطية
      return {
        content: "أعتذر، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.",
        model: "CLAUDE_SONNET" as AIModel,
        responseTime: Date.now() - startTime,
      }
    }
  }

  private async executeCodeWorkflow(context: WorkflowContext): Promise<AIResponse> {
    // المرحلة 1: GPT-4 للتخطيط
    const planningPrompt = this.buildPlanningPrompt(context)
    const planningResult = await this.callModel("gpt4", planningPrompt, context)

    // المرحلة 2: Claude للتحليل المنطقي
    const analysisPrompt = this.buildAnalysisPrompt(planningResult.content, context)
    const analysisResult = await this.callModel("claude_sonnet", analysisPrompt, context)

    // المرحلة 3: DeepSeek للتنفيذ
    const executionPrompt = this.buildExecutionPrompt(analysisResult.content, context)
    const executionResult = await this.callModel("deepseek_coder", executionPrompt, context)

    // دمج النتائج
    const finalContent = this.combineWorkflowResults([
      { stage: "التخطيط", content: planningResult.content },
      { stage: "التحليل", content: analysisResult.content },
      { stage: "التنفيذ", content: executionResult.content },
    ])

    return {
      content: finalContent,
      model: "DEEPSEEK_CODER" as AIModel,
      usage: {
        promptTokens:
          planningResult.usage?.promptTokens + analysisResult.usage?.promptTokens + executionResult.usage?.promptTokens,
        completionTokens:
          planningResult.usage?.completionTokens +
          analysisResult.usage?.completionTokens +
          executionResult.usage?.completionTokens,
        totalTokens: 0, // سيتم حسابه
      },
    }
  }

  private async executeAnalysisWorkflow(context: WorkflowContext): Promise<AIResponse> {
    // استخدام Claude Opus للتحليل المعمق
    const analysisPrompt = this.buildAnalysisPrompt("", context)
    return await this.callModel("claude_opus", analysisPrompt, context)
  }

  private async executeCreativeWorkflow(context: WorkflowContext): Promise<AIResponse> {
    // استخدام GPT-4 للمهام الإبداعية
    const creativePrompt = this.buildCreativePrompt(context)
    return await this.callModel("gpt4", creativePrompt, context)
  }

  private async executeGeneralWorkflow(context: WorkflowContext): Promise<AIResponse> {
    // استخدام Claude Sonnet للمحادثة العامة
    const generalPrompt = this.buildGeneralPrompt(context)
    return await this.callModel("claude_sonnet", generalPrompt, context)
  }

  private async callModel(
    modelKey: keyof typeof this.models,
    prompt: string,
    context: WorkflowContext,
  ): Promise<AIResponse> {
    const model = this.models[modelKey]

    const messages = [
      {
        role: "system" as const,
        content: this.getSystemPrompt(context.userPreferences),
      },
      ...context.conversationHistory.slice(-5).map((msg) => ({
        role: msg.role.toLowerCase() as "user" | "assistant",
        content: msg.content,
      })),
      {
        role: "user" as const,
        content: prompt,
      },
    ]

    const result = await generateText({
      model,
      messages,
      temperature: this.getTemperature(modelKey),
      maxTokens: this.getMaxTokens(modelKey),
    })

    return {
      content: result.text,
      model: this.mapModelKeyToEnum(modelKey),
      usage: {
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
      },
    }
  }

  private async analyzeRequestType(message: string): Promise<WorkflowContext["requestType"]> {
    const codeKeywords = ["كود", "برمجة", "تطبيق", "موقع", "API", "function", "class", "script"]
    const analysisKeywords = ["تحليل", "دراسة", "مقارنة", "تقييم", "بحث", "إحصائيات"]
    const creativeKeywords = ["اكتب", "أنشئ", "صمم", "قصة", "مقال", "شعر", "إبداعي"]

    const lowerMessage = message.toLowerCase()

    if (codeKeywords.some((keyword) => lowerMessage.includes(keyword))) {
      return "code_generation"
    }

    if (analysisKeywords.some((keyword) => lowerMessage.includes(keyword))) {
      return "analysis"
    }

    if (creativeKeywords.some((keyword) => lowerMessage.includes(keyword))) {
      return "creative"
    }

    return "general"
  }

  private getSystemPrompt(userPreferences: any): string {
    const basePrompt = `أنت مساعد ذكي متقدم يتحدث العربية بطلاقة. تتميز بالدقة والوضوح والمساعدة الفعالة.`

    let customizations = ""

    if (userPreferences?.responseStyle === "detailed") {
      customizations += " يُفضل المستخدم الردود المفصلة والشاملة."
    }

    if (userPreferences?.codeComments) {
      customizations += " عند كتابة الكود، أضف تعليقات باللغة العربية."
    }

    if (userPreferences?.arabicLabels) {
      customizations += " استخدم المصطلحات العربية عند الإمكان."
    }

    return basePrompt + customizations
  }

  private buildPlanningPrompt(context: WorkflowContext): string {
    return `
المستخدم يطلب: ${context.userMessage}

كمخطط ذكي، المطلوب منك:
1. فهم المتطلبات بدقة
2. تحليل التحديات المحتملة
3. وضع خطة تنفيذية مرحلية
4. تحديد الأدوات والتقنيات المطلوبة
5. تقدير الوقت والجهد

قدم خطة مفصلة ومنظمة باللغة العربية.
    `
  }

  private buildAnalysisPrompt(planContent: string, context: WorkflowContext): string {
    return `
الخطة المقترحة:
${planContent}

الطلب الأصلي: ${context.userMessage}

كمحلل منطقي، المطلوب منك:
1. مراجعة الخطة وتحليلها
2. تحديد نقاط القوة والضعف
3. اقتراح تحسينات
4. وضع المواصفات التقنية التفصيلية
5. تحديد المخاطر والحلول

قدم تحليلاً شاملاً ومواصفات دقيقة.
    `
  }

  private buildExecutionPrompt(analysisContent: string, context: WorkflowContext): string {
    return `
التحليل والمواصفات:
${analysisContent}

الطلب الأصلي: ${context.userMessage}

كمطور خبير، المطلوب منك:
1. تنفيذ الحل الفعلي
2. كتابة كود عالي الجودة
3. إضافة التوثيق والتعليقات
4. اتباع أفضل الممارسات
5. تقديم أمثلة للاستخدام

قدم الحل الكامل والقابل للتنفيذ.
    `
  }

  private buildCreativePrompt(context: WorkflowContext): string {
    return `
الطلب الإبداعي: ${context.userMessage}

كمساعد إبداعي، المطلوب منك:
1. فهم الرؤية الإبداعية
2. استخدام الخيال والإبداع
3. تقديم محتوى أصيل ومميز
4. مراعاة الثقافة العربية
5. الحفاظ على الجودة العالية

أبدع وقدم محتوى استثنائي.
    `
  }

  private buildGeneralPrompt(context: WorkflowContext): string {
    return `
سؤال المستخدم: ${context.userMessage}

كمساعد ذكي، المطلوب منك:
1. فهم السؤال بدقة
2. تقديم إجابة شاملة ومفيدة
3. استخدام أمثلة عملية
4. مراعاة السياق الثقافي
5. التأكد من الدقة والوضوح

قدم إجابة مفيدة وواضحة.
    `
  }

  private combineWorkflowResults(results: Array<{ stage: string; content: string }>): string {
    return `
# نتيجة المعالجة المتقدمة

${results
  .map(
    (result) => `
## ${result.stage}

${result.content}

---
`,
  )
  .join("")}

*تم إنتاج هذه النتيجة من خلال تعاون متقدم بين نماذج الذكاء الاصطناعي المتخصصة.*
    `
  }

  private getTemperature(modelKey: keyof typeof this.models): number {
    const temperatures = {
      gpt4: 0.7,
      gpt4_turbo: 0.7,
      claude_opus: 0.5,
      claude_sonnet: 0.6,
      deepseek_coder: 0.3,
    }
    return temperatures[modelKey]
  }

  private getMaxTokens(modelKey: keyof typeof this.models): number {
    const maxTokens = {
      gpt4: 2000,
      gpt4_turbo: 3000,
      claude_opus: 2500,
      claude_sonnet: 2000,
      deepseek_coder: 3000,
    }
    return maxTokens[modelKey]
  }

  private mapModelKeyToEnum(modelKey: keyof typeof this.models): AIModel {
    const mapping = {
      gpt4: "GPT4" as AIModel,
      gpt4_turbo: "GPT4_TURBO" as AIModel,
      claude_opus: "CLAUDE_OPUS" as AIModel,
      claude_sonnet: "CLAUDE_SONNET" as AIModel,
      deepseek_coder: "DEEPSEEK_CODER" as AIModel,
    }
    return mapping[modelKey]
  }
}
