import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state") // user email

    if (!code || !state) {
      return NextResponse.json({ error: "معاملات مفقودة" }, { status: 400 })
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_ID,
        client_secret: process.env.GITHUB_SECRET,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      throw new Error(tokenData.error_description)
    }

    // Find user and save integration
    const user = await prisma.user.findUnique({
      where: { email: state },
    })

    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 })
    }

    await prisma.integration.upsert({
      where: {
        userId_type: {
          userId: user.id,
          type: "GITHUB",
        },
      },
      update: {
        isEnabled: true,
        credentials: {
          accessToken: tokenData.access_token,
          tokenType: tokenData.token_type,
          scope: tokenData.scope,
        },
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        type: "GITHUB",
        isEnabled: true,
        credentials: {
          accessToken: tokenData.access_token,
          tokenType: tokenData.token_type,
          scope: tokenData.scope,
        },
      },
    })

    return new NextResponse(
      `
      <html>
        <body>
          <script>
            window.opener.postMessage({ success: true, integration: 'github' }, '*');
            window.close();
          </script>
        </body>
      </html>
    `,
      {
        headers: { "Content-Type": "text/html" },
      },
    )
  } catch (error) {
    console.error("GitHub OAuth callback error:", error)
    return NextResponse.json({ error: "خطأ في المصادقة" }, { status: 500 })
  }
}
