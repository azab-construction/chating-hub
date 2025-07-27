import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AIOrchestrator } from "@/lib/ai-orchestrator"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const formData = await request.formData()
    const content = formData.get("content") as string
    const chatId = formData.get("chatId") as string
    const files = formData.getAll("files") as File[]

    if (!content || !chatId) {
      return NextResponse.json({ error: "المحتوى ومعرف المحادثة مطلوبان" }, { status: 400 })
    }

    // التحقق من ملكية المحادثة
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: session.user.id,
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    })

    if (!chat) {
      return NextResponse.json({ error: "المحادثة غير موجودة" }, { status: 404 })
    }

    // حفظ رسالة المستخدم
    const userMessage = await prisma.message.create({
      data: {
        chatId,
        role: "USER",
        content,
        metadata: files.length > 0 ? { files: files.map((f) => f.name) } : null,
      },
    })

    // معالجة الملفات إذا وجدت
    let fileContents = ""
    if (files.length > 0) {
      // معالجة الملفات وإستخراج المحتوى
      for (const file of files) {
        // حفظ الملف ومعالجته
        const fileContent = await processFile(file, session.user.id)
        fileContents += `\n\nمحتوى الملف ${file.name}:\n${fileContent}`
      }
    }

    // الحصول على تفضيلات المستخدم
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    // إنشاء مُنسق الذكاء الاصطناعي
    const orchestrator = new AIOrchestrator()

    // معالجة الطلب
    const aiResponse = await orchestrator.processUserRequest(
      content + fileContents,
      chat.messages.reverse(),
      user?.preferences || {},
    )

    // حفظ رد الذكاء الاصطناعي
    const assistantMessage = await prisma.message.create({
      data: {
        chatId,
        role: "ASSISTANT",
        content: aiResponse.content,
        metadata: {
          model: aiResponse.model,
          usage: aiResponse.usage,
        },
      },
    })

    // تحديث عنوان المحادثة إذا كانت الرسالة الأولى
    if (chat.messages.length === 0) {
      const title = await generateChatTitle(content)
      await prisma.chat.update({
        where: { id: chatId },
        data: { title },
      })
    }

    return NextResponse.json(assistantMessage)
  } catch (error) {
    console.error("Error processing message:", error)
    return NextResponse.json({ error: "خطأ في معالجة الرسالة" }, { status: 500 })
  }
}

async function processFile(file: File, userId: string): Promise<string> {
  // معالجة الملف حسب نوعه
  const buffer = await file.arrayBuffer()
  const content = new TextDecoder().decode(buffer)

  // حفظ الملف في قاعدة البيانات
  await prisma.file.create({
    data: {
      userId,
      filename: file.name,
      mimetype: file.type,
      size: file.size,
      url: `/uploads/${file.name}`,
      content,
    },
  })

  return content
}

async function generateChatTitle(content: string): Promise<string> {
  // إنشاء عنوان مناسب للمحادثة
  const words = content.split(" ").slice(0, 5).join(" ")
  return words.length > 50 ? words.substring(0, 50) + "..." : words
}
