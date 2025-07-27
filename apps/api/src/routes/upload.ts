import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs/promises"
import pdfParse from "pdf-parse"
import mammoth from "mammoth"
import { PrismaClient } from "@prisma/client"
import { authenticateToken } from "../middleware/auth"

const router = express.Router()
const prisma = new PrismaClient()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads")
    await fs.mkdir(uploadDir, { recursive: true })
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "text/markdown",
    ]

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("نوع الملف غير مدعوم"))
    }
  },
})

// File upload endpoint
router.post("/", authenticateToken, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "لم يتم رفع أي ملف" })
    }

    const userId = req.user.id
    const file = req.file

    // Extract text content based on file type
    let content = ""

    try {
      switch (file.mimetype) {
        case "application/pdf":
          content = await extractPDFContent(file.path)
          break
        case "application/msword":
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          content = await extractWordContent(file.path)
          break
        case "text/plain":
        case "text/markdown":
          content = await fs.readFile(file.path, "utf-8")
          break
        default:
          // For images, we'll use OCR later
          content = ""
      }
    } catch (extractError) {
      console.error("Error extracting content:", extractError)
      // Continue without content extraction
    }

    // Save file info to database
    const savedFile = await prisma.file.create({
      data: {
        userId,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename}`,
        content: content || null,
      },
    })

    res.json({
      id: savedFile.id,
      filename: savedFile.filename,
      size: savedFile.size,
      url: savedFile.url,
      hasContent: !!content,
    })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({ error: "خطأ في رفع الملف" })
  }
})

// Extract content from PDF
async function extractPDFContent(filePath: string): Promise<string> {
  const dataBuffer = await fs.readFile(filePath)
  const data = await pdfParse(dataBuffer)
  return data.text
}

// Extract content from Word documents
async function extractWordContent(filePath: string): Promise<string> {
  const result = await mammoth.extractRawText({ path: filePath })
  return result.value
}

// Get file content endpoint
router.get("/:fileId/content", authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.params
    const userId = req.user.id

    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        userId,
      },
    })

    if (!file) {
      return res.status(404).json({ error: "الملف غير موجود" })
    }

    res.json({
      id: file.id,
      filename: file.filename,
      content: file.content,
      mimetype: file.mimetype,
    })
  } catch (error) {
    console.error("Get file content error:", error)
    res.status(500).json({ error: "خطأ في جلب محتوى الملف" })
  }
})

// Delete file endpoint
router.delete("/:fileId", authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.params
    const userId = req.user.id

    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        userId,
      },
    })

    if (!file) {
      return res.status(404).json({ error: "الملف غير موجود" })
    }

    // Delete file from filesystem
    try {
      const filePath = path.join(process.cwd(), "uploads", path.basename(file.url))
      await fs.unlink(filePath)
    } catch (fsError) {
      console.error("Error deleting file from filesystem:", fsError)
    }

    // Delete from database
    await prisma.file.delete({
      where: { id: fileId },
    })

    res.json({ message: "تم حذف الملف بنجاح" })
  } catch (error) {
    console.error("Delete file error:", error)
    res.status(500).json({ error: "خطأ في حذف الملف" })
  }
})

export default router
