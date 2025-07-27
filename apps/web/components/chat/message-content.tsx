"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/cjs/styles/prism"
import { Copy, Check } from "lucide-react"

interface MessageContentProps {
  content: string
  role: "USER" | "ASSISTANT" | "SYSTEM"
}

export function MessageContent({ content, role }: MessageContentProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      console.error("Failed to copy code:", error)
    }
  }

  if (role === "USER") {
    return <div className="whitespace-pre-wrap break-words">{content}</div>
  }

  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "")
            const codeString = String(children).replace(/\n$/, "")

            if (!inline && match) {
              return (
                <div className="relative">
                  <div className="flex items-center justify-between bg-gray-800 text-white px-4 py-2 rounded-t-lg">
                    <span className="text-sm font-medium">{match[1]}</span>
                    <button
                      onClick={() => handleCopyCode(codeString)}
                      className="flex items-center gap-2 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
                    >
                      {copiedCode === codeString ? (
                        <>
                          <Check size={12} />
                          تم النسخ
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          نسخ
                        </>
                      )}
                    </button>
                  </div>
                  <SyntaxHighlighter
                    style={tomorrow}
                    language={match[1]}
                    PreTag="div"
                    className="!mt-0 !rounded-t-none"
                    {...props}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              )
            }

            return (
              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            )
          },
          h1: ({ children }) => <h1 className="text-2xl font-bold text-gray-900 mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-semibold text-gray-900 mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-medium text-gray-900 mb-2">{children}</h3>,
          p: ({ children }) => <p className="text-gray-700 mb-3 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-gray-700">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-r-4 border-orange-500 pr-4 py-2 bg-orange-50 rounded-r-lg mb-3">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-3">
              <table className="min-w-full border border-gray-200 rounded-lg">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-gray-50 border-b border-gray-200 px-4 py-2 text-right font-medium text-gray-900">
              {children}
            </th>
          ),
          td: ({ children }) => <td className="border-b border-gray-200 px-4 py-2 text-gray-700">{children}</td>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 hover:text-orange-700 underline"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
