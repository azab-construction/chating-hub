import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function DELETE(request: NextRequest, { params }: { params: { type: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 })
    }

    await prisma.integration.delete({
      where: {
        userId_type: {
          userId: user.id,
          type: params.type.toUpperCase(),
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error disconnecting integration:", error)
    return NextResponse.json({ error: "خطأ في قطع الاتصال" }, { status: 500 })
  }
}
