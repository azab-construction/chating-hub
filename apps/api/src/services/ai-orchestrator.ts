import { OpenAI } from "openai"
import Anthropic from "@anthropic-ai/sdk"
import { AIModel, type Message } from "@prisma/client"

interface AIResponse {
  content: string
  model: AIModel
  usage?: {
    promptTokens: number
    completionTokens: number
  }
}

interface WorkflowStep {
  model: AIModel
  role: "planner" | "analyzer" | "executor"
  prompt: string
}

export class AIOrchestrator {
  private openai: OpenAI
  private anthropic: Anthropic

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }

  async processUserRequest(userMessage: string, context: Message[], userPreferences: any): Promise<AIResponse> {
    // تحديد نوع الطلب وتوجيهه للنموذج المناسب
    const requestType = await this.analyzeRequestType(userMessage)

    switch (requestType) {
      case "code_generation":
        return this.executeCodeWorkflow(userMessage, context, userPreferences)
      case "analysis":
        return this.executeAnalysisWorkflow(userMessage, context, userPreferences)
      case "general":
        return this.executeGeneralWorkflow(userMessage, context, userPreferences)
      default:
        return this.executeGeneralWorkflow(userMessage, context, userPreferences)
    }
  }

  private async executeCodeWorkflow(
    userMessage: string,
    context: Message[],
    userPreferences: any,
  ): Promise<AIResponse> {
    // الخطوة 1: GPT-4 يراجع الفكرة وينشئ خطة
    const planningStep = await this.callGPT4({
      role: "planner",
      prompt: this.buildPlanningPrompt(userMessage, userPreferences),
      context,
    })

    // الخطوة 2: Claude يحلل المنطق ويجهز البنية
    const analysisStep = await this.callClaude({
      role: "analyzer",
      prompt: this.buildAnalysisPrompt(planningStep.content, userMessage),
      context: [...context, { role: "assistant", content: planningStep.content }],
    })

    // الخطوة 3: DeepSeek ينفذ الكود الفعلي
    const executionStep = await this.callDeepSeek({
      role: "executor",
      prompt: this.buildExecutionPrompt(analysisStep.content, userMessage),
      context: [
        ...context,
        { role: "assistant", content: planningStep.content },
        { role: "assistant", content: analysisStep.content },
      ],
    })

    return {
      content: this.combineWorkflowResults([planningStep, analysisStep, executionStep]),
      model: AIModel.DEEPSEEK_CODER,
      usage: {
        promptTokens:
          planningStep.usage?.promptTokens + analysisStep.usage?.promptTokens + executionStep.usage?.promptTokens,
        completionTokens:
          planningStep.usage?.completionTokens +
          analysisStep.usage?.completionTokens +
          executionStep.usage?.completionTokens,
      },
    }
  }

  private async callGPT4({ role, prompt, context }: WorkflowStep & { context: any[] }): Promise<AIResponse> {
    const messages = [
      {
        role: "system",
        content: `أنت مخطط ذكي متخصص في تحليل الأفكار وإنشاء خطط تنفيذية مفصلة. 
        دورك هو فهم طلب المستخدم وتحويله إلى خطة عمل واضحة ومنظمة.
        يجب أن تكون إجاباتك باللغة العربية ومفصلة ومنطقية.`,
      },
      ...context.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user",
        content: prompt,
      },
    ]

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 2000,
    })

    return {
      content: response.choices[0].message.content || "",
      model: AIModel.GPT4,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
      },
    }
  }

  private async callClaude({ role, prompt, context }: WorkflowStep & { context: any[] }): Promise<AIResponse> {
    const systemPrompt = `أنت محلل منطقي متخصص في تحليل الخطط وتجهيز البنية التقنية.
    دورك هو أخذ الخطة من GPT-4 وتحليلها منطقياً وتجهيز البنية التقنية المطلوبة.
    يجب أن تركز على التفاصيل التقنية والبنية المعمارية.`

    const messages = context.map((msg) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    }))

    messages.push({
      role: "user",
      content: prompt,
    })

    const response = await this.anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      system: systemPrompt,
      messages: messages as any,
      max_tokens: 2000,
      temperature: 0.5,
    })

    return {
      content: response.content[0].type === "text" ? response.content[0].text : "",
      model: AIModel.CLAUDE_SONNET,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
      },
    }
  }

  private async callDeepSeek({ role, prompt, context }: WorkflowStep & { context: any[] }): Promise<AIResponse> {
    // DeepSeek API call (assuming similar to OpenAI)
    const messages = [
      {
        role: "system",
        content: `أنت مطور خبير متخصص في تنفيذ الكود الفعلي.
        دورك هو أخذ التحليل والبنية من Claude وتحويلها إلى كود قابل للتنفيذ.
        يجب أن يكون الكود عالي الجودة ومُحسَّن ومُوثَّق باللغة العربية.`,
      },
      ...context.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user",
        content: prompt,
      },
    ]

    // Simulated DeepSeek API call
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-coder",
        messages,
        temperature: 0.3,
        max_tokens: 3000,
      }),
    })

    const data = await response.json()

    return {
      content: data.choices[0].message.content,
      model: AIModel.DEEPSEEK_CODER,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
      },
    }
  }

  private buildPlanningPrompt(userMessage: string, userPreferences: any): string {
    return `
المستخدم: ${userMessage}

تفضيلات المستخدم:
- اللغة: ${userPreferences.language || "العربية"}
- نوع العمل: ${userPreferences.workType || "هندسة البرمجيات"}
- أسلوب العمل: ${userPreferences.workStyle || "منهجي ومفصل"}

المطلوب منك:
1. فهم طلب المستخدم بدقة
2. تحليل المتطلبات الأساسية والفرعية
3. إنشاء خطة تنفيذية مرحلية
4. تحديد التقنيات والأدوات المطلوبة
5. تقدير الوقت والجهد المطلوب

يرجى تقديم خطة مفصلة ومنظمة باللغة العربية.
    `
  }

  private buildAnalysisPrompt(planContent: string, userMessage: string): string {
    return `
الخطة المقترحة من GPT-4:
${planContent}

الطلب الأصلي للمستخدم:
${userMessage}

المطلوب منك كمحلل منطقي:
1. تحليل الخطة المقترحة ومراجعتها
2. تحديد البنية التقنية المطلوبة
3. تحديد نقاط القوة والضعف في الخطة
4. اقتراح تحسينات أو تعديلات
5. تجهيز المواصفات التقنية التفصيلية

يرجى تقديم تحليل شامل ومواصفات تقنية دقيقة.
    `
  }

  private buildExecutionPrompt(analysisContent: string, userMessage: string): string {
    return `
التحليل والمواصفات التقنية من Claude:
${analysisContent}

الطلب الأصلي للمستخدم:
${userMessage}

المطلوب منك كمطور خبير:
1. تنفيذ الكود الفعلي بناءً على التحليل
2. كتابة كود عالي الجودة ومُحسَّن
3. إضافة التوثيق والتعليقات باللغة العربية
4. التأكد من اتباع أفضل الممارسات
5. تقديم أمثلة عملية للاستخدام

يرجى تقديم الكود الكامل والقابل للتنفيذ مع الشرح.
    `
  }

  private combineWorkflowResults(steps: AIResponse[]): string {
    return `
# نتيجة المعالجة المتقدمة

## 📋 الخطة التنفيذية (GPT-4)
${steps[0].content}

---

## 🔍 التحليل التقني (Claude)
${steps[1].content}

---

## 💻 التنفيذ العملي (DeepSeek)
${steps[2].content}

---

*تم إنتاج هذه النتيجة من خلال تعاون ثلاثة نماذج ذكية متخصصة لضمان أفضل جودة ودقة.*
    `
  }

  private async analyzeRequestType(message: string): Promise<string> {
    const codeKeywords = ["كود", "برمجة", "تطبيق", "موقع", "API", "database", "function"]
    const analysisKeywords = ["تحليل", "دراسة", "مقارنة", "تقييم", "بحث"]

    const lowerMessage = message.toLowerCase()

    if (codeKeywords.some((keyword) => lowerMessage.includes(keyword))) {
      return "code_generation"
    }

    if (analysisKeywords.some((keyword) => lowerMessage.includes(keyword))) {
      return "analysis"
    }

    return "general"
  }
}
