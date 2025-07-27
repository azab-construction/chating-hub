import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import { createServer } from "http"
import { Server } from "socket.io"
import authRoutes from "./routes/auth"
import billingRoutes from "./routes/billing"
import uploadRoutes from "./routes/upload"
import chatRoutes from "./routes/chat"
import analyticsRoutes from "./routes/analytics"

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

// Middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP",
})
app.use("/api/", limiter)

// Body parsing
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/billing", billingRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/chats", chatRoutes)
app.use("/api/analytics", analyticsRoutes)

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// Socket.IO for real-time features
io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  socket.on("join-chat", ({ chatId, userId }) => {
    socket.join(chatId)
    socket.to(chatId).emit("user-joined", { userId })
  })

  socket.on("leave-chat", ({ chatId, userId }) => {
    socket.leave(chatId)
    socket.to(chatId).emit("user-left", { userId })
  })

  socket.on("cursor-move", ({ chatId, userId, cursor }) => {
    socket.to(chatId).emit("cursor-moved", { userId, cursor })
  })

  socket.on("typing", ({ chatId, userId, isTyping }) => {
    socket.to(chatId).emit("user-typing", { userId, isTyping })
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
  })
})

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: "Something went wrong!" })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" })
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
})

export default app
