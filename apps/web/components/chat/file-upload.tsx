"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { useTranslation } from "next-i18next"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, File, ImageIcon, FileText, X, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
  status: "uploading" | "success" | "error"
  progress?: number
}

export function FileUpload() {
  const { t } = useTranslation("common")
  const [files, setFiles] = useState<UploadedFile[]>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: "uploading",
      progress: 0,
    }))

    setFiles((prev) => [...prev, ...newFiles])

    // Upload each file
    for (const file of acceptedFiles) {
      const fileId = newFiles.find((f) => f.name === file.name)?.id
      if (!fileId) continue

      try {
        await uploadFile(file, fileId, (progress) => {
          setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress } : f)))
        })

        setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "success", progress: 100 } : f)))
      } catch (error) {
        setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "error" } : f)))
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
  })

  const uploadFile = async (file: File, fileId: string, onProgress: (progress: number) => void) => {
    const formData = new FormData()
    formData.append("file", file)

    const xhr = new XMLHttpRequest()

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100
          onProgress(progress)
        }
      })

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText))
        } else {
          reject(new Error("Upload failed"))
        }
      })

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed"))
      })

      xhr.open("POST", "/api/upload")
      xhr.send(formData)
    })
  }

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return ImageIcon
    if (type === "application/pdf") return FileText
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive ? "border-orange-500 bg-orange-50" : "border-gray-300 hover:border-gray-400",
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-lg font-medium text-gray-900 mb-2">
          {isDragActive ? t("dropFilesHere") : t("dragDropFiles")}
        </p>
        <p className="text-sm text-gray-500">{t("supportedFormats")}: PDF, Word, Images, Text</p>
        <p className="text-xs text-gray-400 mt-1">{t("maxFileSize")}: 10MB</p>
      </div>

      {/* Uploaded Files */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((file) => {
              const Icon = getFileIcon(file.type)

              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <Icon size={20} className="text-gray-500" />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>

                    {file.status === "uploading" && (
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-orange-500 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${file.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {file.status === "success" && <CheckCircle size={16} className="text-green-500" />}
                    {file.status === "error" && <AlertCircle size={16} className="text-red-500" />}

                    <button onClick={() => removeFile(file.id)} className="p-1 hover:bg-gray-200 rounded">
                      <X size={14} />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
