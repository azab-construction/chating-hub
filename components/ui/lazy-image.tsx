"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholder?: string
  width?: number
  height?: number
  priority?: boolean
}

export function LazyImage({
  src,
  alt,
  className,
  placeholder = "/placeholder.svg?height=400&width=400",
  width,
  height,
  priority = false,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const [error, setError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (priority) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: "50px" },
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority])

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    setError(true)
    setIsLoaded(true)
  }

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden", className)} style={{ width, height }}>
      {/* Placeholder */}
      <div
        className={cn(
          "absolute inset-0 bg-gray-200 animate-pulse transition-opacity duration-300",
          isLoaded ? "opacity-0" : "opacity-100",
        )}
      />

      {/* Actual Image */}
      {isInView && (
        <img
          src={error ? placeholder : src}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      )}
    </div>
  )
}
