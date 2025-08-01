"use client"

import type React from "react"

import { useRef } from "react"

interface FileUploadProps {
  onFileUpload: (files: File[]) => void
  children: React.ReactNode
  accept?: string
  multiple?: boolean
}

export function FileUpload({ onFileUpload, children, accept = "*/*", multiple = true }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      onFileUpload(files)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
      />
      <div onClick={handleClick} className="cursor-pointer">
        {children}
      </div>
    </>
  )
}
