import express from "express"
import Stripe from "stripe"
import { PrismaClient } from "@prisma/client"
import { authenticateToken } from "../middleware/auth"

const router = express.Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})
const prisma = new PrismaClient()

const plans = {
  pro: {
    priceId: "price_pro_monthly", // Replace with actual Stripe price ID
    name: "Pro",
    price: 2000, // $20.00 in cents
  },
  enterprise: {
    priceId: "price_enterprise_monthly", // Replace with actual Stripe price ID
    name: "Enterprise",
    price: 10000, // $100.00 in cents
  },
}

// Create checkout session
router.post("/create-checkout", authenticateToken, async (req, res) => {
  try {
    const { planId, successUrl, cancelUrl } = req.body
    const userId = req.user.id

    if (!plans[planId]) {
      return res.status(400).json({ error: "خطة غير صالحة" })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({ error: "المستخدم غير موجود" })
    }

    // Create or retrieve Stripe customer
    let customerId = user.stripeId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
        },
      })

      customerId = customer.id

      await prisma.user.update({
        where: { id: userId },
        data: { stripeId: customerId },
      })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: plans[planId].priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: user.id,
        planId,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planId,
        },
      },
    })

    res.json({ url: session.url })
  } catch (error) {
    console.error("Checkout error:", error)
    res.status(500).json({ error: "خطأ في إنشاء جلسة الدفع" })
  }
})

// Stripe webhook
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"]
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig!, webhookSecret!)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return res.status(400).send("Webhook signature verification failed")
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object)
        break

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object)
        break

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object)
        break

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object)
        break

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.json({ received: true })
  } catch (error) {
    console.error("Webhook handler error:", error)
    res.status(500).json({ error: "Webhook handler error" })
  }
})

async function handleCheckoutCompleted(session: any) {
  const userId = session.metadata.userId
  const planId = session.metadata.planId

  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: planId.toUpperCase(),
    },
  })

  console.log(`User ${userId} upgraded to ${planId}`)
}

async function handleSubscriptionUpdated(subscription: any) {
  const userId = subscription.metadata.userId

  if (subscription.status === "active") {
    const planId = subscription.metadata.planId

    await prisma.user.update({
      where: { id: userId },
      data: {
        plan: planId.toUpperCase(),
      },
    })
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  const userId = subscription.metadata.userId

  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: "FREE",
    },
  })

  console.log(`User ${userId} subscription cancelled`)
}

async function handlePaymentSucceeded(invoice: any) {
  console.log(`Payment succeeded for customer: ${invoice.customer}`)
}

async function handlePaymentFailed(invoice: any) {
  console.log(`Payment failed for customer: ${invoice.customer}`)
}

// Get current subscription
router.get("/subscription", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || !user.stripeId) {
      return res.json({
        plan: "FREE",
        status: "active",
        currentPeriodEnd: null,
      })
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeId,
      status: "active",
      limit: 1,
    })

    if (subscriptions.data.length === 0) {
      return res.json({
        plan: "FREE",
        status: "active",
        currentPeriodEnd: null,
      })
    }

    const subscription = subscriptions.data[0]

    res.json({
      plan: user.plan,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    })
  } catch (error) {
    console.error("Get subscription error:", error)
    res.status(500).json({ error: "خطأ في جلب معلومات الاشتراك" })
  }
})

// Cancel subscription
router.post("/cancel", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || !user.stripeId) {
      return res.status(404).json({ error: "لا يوجد اشتراك نشط" })
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeId,
      status: "active",
      limit: 1,
    })

    if (subscriptions.data.length === 0) {
      return res.status(404).json({ error: "لا يوجد اشتراك نشط" })
    }

    const subscription = subscriptions.data[0]

    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    })

    res.json({ message: "تم إلغاء الاشتراك بنجاح" })
  } catch (error) {
    console.error("Cancel subscription error:", error)
    res.status(500).json({ error: "خطأ في إلغاء الاشتراك" })
  }
})

export default router
