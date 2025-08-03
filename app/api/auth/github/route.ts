// إجبار المسار يكون ديناميكي عشان يحل مشكلة Dynamic Server Usage
export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const clientId = process.env.GITHUB_ID
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/github/callback`
    const scope = "repo,user:email,read:org"

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${session.user.email}`

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("GitHub OAuth error:", error)
    return NextResponse.json({ error: "خطأ في المصادقة" }, { status: 500 })
  }
}
