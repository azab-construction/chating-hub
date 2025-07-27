import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { integrations: true },
    })

    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 })
    }

    return NextResponse.json(user.integrations)
  } catch (error) {
    console.error("Error fetching integrations:", error)
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const { type, credentials } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 })
    }

    const integration = await prisma.integration.upsert({
      where: {
        userId_type: {
          userId: user.id,
          type: type.toUpperCase(),
        },
      },
      update: {
        isEnabled: true,
        credentials,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        type: type.toUpperCase(),
        isEnabled: true,
        credentials,
      },
    })

    return NextResponse.json(integration)
  } catch (error) {
    console.error("Error connecting integration:", error)
    return NextResponse.json({ error: "خطأ في الاتصال" }, { status: 500 })
  }
}
