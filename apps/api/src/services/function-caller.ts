import { google } from "googleapis"
import Stripe from "stripe"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface FunctionCall {
  name: string
  arguments: Record<string, any>
}

interface FunctionResult {
  success: boolean
  data?: any
  error?: string
}

export class FunctionCaller {
  private stripe: Stripe

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2023-10-16",
    })
  }

  async executeFunction(userId: string, functionCall: FunctionCall): Promise<FunctionResult> {
    try {
      switch (functionCall.name) {
        case "get_gmail_messages":
          return await this.getGmailMessages(userId, functionCall.arguments)
        case "send_gmail_message":
          return await this.sendGmailMessage(userId, functionCall.arguments)
        case "search_google_drive":
          return await this.searchGoogleDrive(userId, functionCall.arguments)
        case "get_calendar_events":
          return await this.getCalendarEvents(userId, functionCall.arguments)
        case "create_stripe_payment":
          return await this.createStripePayment(userId, functionCall.arguments)
        case "get_stripe_customers":
          return await this.getStripeCustomers(userId, functionCall.arguments)
        default:
          return {
            success: false,
            error: `وظيفة غير معروفة: ${functionCall.name}`,
          }
      }
    } catch (error) {
      console.error("Function execution error:", error)
      return {
        success: false,
        error: "خطأ في تنفيذ الوظيفة",
      }
    }
  }

  private async getGmailMessages(
    userId: string,
    args: { query?: string; maxResults?: number },
  ): Promise<FunctionResult> {
    const integration = await this.getIntegration(userId, "GMAIL")
    if (!integration) {
      return { success: false, error: "Gmail غير متصل" }
    }

    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: integration.credentials.accessToken,
      refresh_token: integration.credentials.refreshToken,
    })

    const gmail = google.gmail({ version: "v1", auth: oauth2Client })

    try {
      const response = await gmail.users.messages.list({
        userId: "me",
        q: args.query || "",
        maxResults: args.maxResults || 10,
      })

      const messages = []
      if (response.data.messages) {
        for (const message of response.data.messages.slice(0, 5)) {
          const messageDetail = await gmail.users.messages.get({
            userId: "me",
            id: message.id!,
          })

          const headers = messageDetail.data.payload?.headers || []
          const subject = headers.find((h) => h.name === "Subject")?.value || "بدون موضوع"
          const from = headers.find((h) => h.name === "From")?.value || "مرسل غير معروف"
          const date = headers.find((h) => h.name === "Date")?.value || ""

          messages.push({
            id: message.id,
            subject,
            from,
            date,
            snippet: messageDetail.data.snippet,
          })
        }
      }

      return {
        success: true,
        data: {
          messages,
          totalCount: response.data.resultSizeEstimate || 0,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: "خطأ في جلب رسائل Gmail",
      }
    }
  }

  private async sendGmailMessage(
    userId: string,
    args: { to: string; subject: string; body: string },
  ): Promise<FunctionResult> {
    const integration = await this.getIntegration(userId, "GMAIL")
    if (!integration) {
      return { success: false, error: "Gmail غير متصل" }
    }

    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: integration.credentials.accessToken,
      refresh_token: integration.credentials.refreshToken,
    })

    const gmail = google.gmail({ version: "v1", auth: oauth2Client })

    try {
      const email = [`To: ${args.to}`, `Subject: ${args.subject}`, "", args.body].join("\n")

      const encodedEmail = Buffer.from(email)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "")

      const response = await gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: encodedEmail,
        },
      })

      return {
        success: true,
        data: {
          messageId: response.data.id,
          message: "تم إرسال الرسالة بنجاح",
        },
      }
    } catch (error) {
      return {
        success: false,
        error: "خطأ في إرسال الرسالة",
      }
    }
  }

  private async searchGoogleDrive(
    userId: string,
    args: { query: string; maxResults?: number },
  ): Promise<FunctionResult> {
    const integration = await this.getIntegration(userId, "GOOGLE_DRIVE")
    if (!integration) {
      return { success: false, error: "Google Drive غير متصل" }
    }

    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: integration.credentials.accessToken,
      refresh_token: integration.credentials.refreshToken,
    })

    const drive = google.drive({ version: "v3", auth: oauth2Client })

    try {
      const response = await drive.files.list({
        q: `name contains '${args.query}' and trashed=false`,
        pageSize: args.maxResults || 10,
        fields: "files(id,name,mimeType,modifiedTime,size,webViewLink)",
      })

      return {
        success: true,
        data: {
          files: response.data.files || [],
          query: args.query,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: "خطأ في البحث في Google Drive",
      }
    }
  }

  private async getCalendarEvents(
    userId: string,
    args: { timeMin?: string; timeMax?: string; maxResults?: number },
  ): Promise<FunctionResult> {
    const integration = await this.getIntegration(userId, "GOOGLE_CALENDAR")
    if (!integration) {
      return { success: false, error: "Google Calendar غير متصل" }
    }

    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: integration.credentials.accessToken,
      refresh_token: integration.credentials.refreshToken,
    })

    const calendar = google.calendar({ version: "v3", auth: oauth2Client })

    try {
      const response = await calendar.events.list({
        calendarId: "primary",
        timeMin: args.timeMin || new Date().toISOString(),
        timeMax: args.timeMax,
        maxResults: args.maxResults || 10,
        singleEvents: true,
        orderBy: "startTime",
      })

      return {
        success: true,
        data: {
          events: response.data.items || [],
        },
      }
    } catch (error) {
      return {
        success: false,
        error: "خطأ في جلب أحداث التقويم",
      }
    }
  }

  private async createStripePayment(
    userId: string,
    args: { amount: number; currency: string; description?: string },
  ): Promise<FunctionResult> {
    const integration = await this.getIntegration(userId, "STRIPE")
    if (!integration) {
      return { success: false, error: "Stripe غير متصل" }
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: args.amount,
        currency: args.currency,
        description: args.description,
        stripeAccount: integration.credentials.stripeUserId,
      })

      return {
        success: true,
        data: {
          paymentIntentId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: "خطأ في إنشاء الدفعة",
      }
    }
  }

  private async getStripeCustomers(userId: string, args: { limit?: number; email?: string }): Promise<FunctionResult> {
    const integration = await this.getIntegration(userId, "STRIPE")
    if (!integration) {
      return { success: false, error: "Stripe غير متصل" }
    }

    try {
      const customers = await this.stripe.customers.list({
        limit: args.limit || 10,
        email: args.email,
        stripeAccount: integration.credentials.stripeUserId,
      })

      return {
        success: true,
        data: {
          customers: customers.data,
          hasMore: customers.has_more,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: "خطأ في جلب العملاء",
      }
    }
  }

  private async getIntegration(userId: string, type: string) {
    return await prisma.integration.findFirst({
      where: {
        userId,
        type,
        isEnabled: true,
      },
    })
  }

  // Function definitions for AI models
  static getFunctionDefinitions() {
    return [
      {
        name: "get_gmail_messages",
        description: "جلب رسائل Gmail للمستخدم",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "استعلام البحث في Gmail (اختياري)",
            },
            maxResults: {
              type: "number",
              description: "عدد الرسائل المطلوب جلبها (افتراضي: 10)",
            },
          },
        },
      },
      {
        name: "send_gmail_message",
        description: "إرسال رسالة عبر Gmail",
        parameters: {
          type: "object",
          properties: {
            to: {
              type: "string",
              description: "عنوان البريد الإلكتروني للمستقبل",
            },
            subject: {
              type: "string",
              description: "موضوع الرسالة",
            },
            body: {
              type: "string",
              description: "محتوى الرسالة",
            },
          },
          required: ["to", "subject", "body"],
        },
      },
      {
        name: "search_google_drive",
        description: "البحث في ملفات Google Drive",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "نص البحث",
            },
            maxResults: {
              type: "number",
              description: "عدد النتائج المطلوبة (افتراضي: 10)",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "get_calendar_events",
        description: "جلب أحداث Google Calendar",
        parameters: {
          type: "object",
          properties: {
            timeMin: {
              type: "string",
              description: "وقت البداية (ISO 8601)",
            },
            timeMax: {
              type: "string",
              description: "وقت النهاية (ISO 8601)",
            },
            maxResults: {
              type: "number",
              description: "عدد الأحداث المطلوبة (افتراضي: 10)",
            },
          },
        },
      },
      {
        name: "create_stripe_payment",
        description: "إنشاء دفعة في Stripe",
        parameters: {
          type: "object",
          properties: {
            amount: {
              type: "number",
              description: "المبلغ بالسنت",
            },
            currency: {
              type: "string",
              description: "العملة (مثل: usd, eur)",
            },
            description: {
              type: "string",
              description: "وصف الدفعة",
            },
          },
          required: ["amount", "currency"],
        },
      },
      {
        name: "get_stripe_customers",
        description: "جلب عملاء Stripe",
        parameters: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "عدد العملاء المطلوب جلبهم (افتراضي: 10)",
            },
            email: {
              type: "string",
              description: "البحث بالبريد الإلكتروني",
            },
          },
        },
      },
    ]
  }
}
