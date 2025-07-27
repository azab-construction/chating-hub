import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function PUT(request: NextRequest, { params }: { params: { type: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const { settings } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 })
    }

    const integration = await prisma.integration.update({
      where: {
        userId_type: {
          userId: user.id,
          type: params.type.toUpperCase(),
        },
      },
      data: {
        settings,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(integration)
  } catch (error) {
    console.error("Error updating integration settings:", error)
    return NextResponse.json({ error: "خطأ في تحديث الإعدادات" }, { status: 500 })
  }
}
