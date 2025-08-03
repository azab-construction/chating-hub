// إجبار المسار يكون ديناميكي عشان يحل مشكلة Dynamic Server Usage
export const dynamic = "force-dynamic";

import express from "express"
import { google } from "googleapis"
import { PrismaClient } from "@prisma/client"
import { authenticateToken } from "../middleware/auth"

const router = express.Router()
const prisma = new PrismaClient()

// OAuth configurations
const googleOAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.API_URL}/api/auth/google/callback`,
)

// Gmail OAuth
router.get("/gmail", authenticateToken, (req, res) => {
  const scopes = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.modify",
  ]

  const authUrl = googleOAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    state: JSON.stringify({
      userId: req.user.id,
      integration: "gmail",
    }),
  })

  res.redirect(authUrl)
})

// Google Drive OAuth
router.get("/google-drive", authenticateToken, (req, res) => {
  const scopes = ["https://www.googleapis.com/auth/drive.readonly", "https://www.googleapis.com/auth/drive.file"]

  const authUrl = googleOAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    state: JSON.stringify({
      userId: req.user.id,
      integration: "google-drive",
    }),
  })

  res.redirect(authUrl)
})

// Google Calendar OAuth
router.get("/google-calendar", authenticateToken, (req, res) => {
  const scopes = [
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/calendar.events",
  ]

  const authUrl = googleOAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    state: JSON.stringify({
      userId: req.user.id,
      integration: "google-calendar",
    }),
  })

  res.redirect(authUrl)
})

// Google OAuth Callback
router.get("/google/callback", async (req, res) => {
  try {
    const { code, state } = req.query
    const { userId, integration } = JSON.parse(state as string)

    const { tokens } = await googleOAuth2Client.getToken(code as string)

    // Save integration credentials
    await prisma.integration.upsert({
      where: {
        userId_type: {
          userId,
          type: integration.toUpperCase().replace("-", "_"),
        },
      },
      update: {
        isEnabled: true,
        credentials: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiryDate: tokens.expiry_date,
        },
      },
      create: {
        userId,
        type: integration.toUpperCase().replace("-", "_"),
        isEnabled: true,
        credentials: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiryDate: tokens.expiry_date,
        },
      },
    })

    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ success: true, integration: '${integration}' }, '*');
            window.close();
          </script>
        </body>
      </html>
    `)
  } catch (error) {
    console.error("OAuth callback error:", error)
    res.status(500).send("خطأ في الاتصال")
  }
})

// Stripe OAuth
router.get("/stripe", authenticateToken, (req, res) => {
  const clientId = process.env.STRIPE_CLIENT_ID
  const redirectUri = `${process.env.API_URL}/api/auth/stripe/callback`

  const authUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${clientId}&scope=read_write&redirect_uri=${redirectUri}&state=${JSON.stringify({ userId: req.user.id })}`

  res.redirect(authUrl)
})

// Stripe OAuth Callback
router.get("/stripe/callback", async (req, res) => {
  try {
    const { code, state } = req.query
    const { userId } = JSON.parse(state as string)

    const response = await fetch("https://connect.stripe.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_secret: process.env.STRIPE_SECRET_KEY!,
        code: code as string,
        grant_type: "authorization_code",
      }),
    })

    const tokens = await response.json()

    await prisma.integration.upsert({
      where: {
        userId_type: {
          userId,
          type: "STRIPE",
        },
      },
      update: {
        isEnabled: true,
        credentials: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          stripeUserId: tokens.stripe_user_id,
        },
      },
      create: {
        userId,
        type: "STRIPE",
        isEnabled: true,
        credentials: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          stripeUserId: tokens.stripe_user_id,
        },
      },
    })

    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ success: true, integration: 'stripe' }, '*');
            window.close();
          </script>
        </body>
      </html>
    `)
  } catch (error) {
    console.error("Stripe OAuth error:", error)
    res.status(500).send("خطأ في الاتصال")
  }
})

export default router
