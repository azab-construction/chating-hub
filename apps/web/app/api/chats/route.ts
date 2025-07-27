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

    const chats = await prisma.chat.findMany({
      where: { userId: session.user.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 50, // آخر 50 رسالة لكل محادثة
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json(chats)
  } catch (error) {
    console.error("Error fetching chats:", error)
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const { title, model } = await request.json()

    const chat = await prisma.chat.create({
      data: {
        title: title || "محادثة جديدة",
        userId: session.user.id,
        model: model || "CLAUDE_SONNET",
      },
      include: {
        messages: true,
      },
    })

    return NextResponse.json(chat)
  } catch (error) {
    console.error("Error creating chat:", error)
    return NextResponse.json({ error: "خطأ في إنشاء المحادثة" }, { status: 500 })
  }
}
