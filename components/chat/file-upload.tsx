"use client"

import * as React from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { PlusIcon, FileTextIcon, ImageIcon, FileIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "react-i18next"

export function FileUpload() {
  const { toast } = useToast()
  const { t } = useTranslation()

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        toast({
          title: t("fileUpload.successTitle"),
          description: t("fileUpload.successDescription", {
            fileName: file.name,
            fileSize: (file.size / 1024).toFixed(2),
          }),
        })
        // Here you would typically handle the file upload to a server
        console.log("File accepted:", file)
      }
    },
    [toast, t],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase()
    switch (ext) {
      case "txt":
      case "doc":
      case "docx":
      case "pdf":
        return <FileTextIcon className="h-4 w-4" />
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <ImageIcon className="h-4 w-4" />
      default:
        return <FileIcon className="h-4 w-4" />
    }
  }

  return (
    <div {...getRootProps()} className="relative">
      <input {...getInputProps()} />
      <Button variant="outline" size="icon" aria-label={t("fileUpload.uploadFile")}>
        <PlusIcon className="h-5 w-5" />
        <span className="sr-only">{t("fileUpload.uploadFile")}</span>
      </Button>
      {isDragActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/20 rounded-md pointer-events-none">
          <p className="text-primary-foreground">{t("fileUpload.dropHere")}</p>
        </div>
      )}
    </div>
  )
}
