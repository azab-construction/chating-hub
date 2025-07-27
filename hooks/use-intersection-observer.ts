"use client"

import { useEffect, useRef, useState } from "react"

interface UseIntersectionObserverProps {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export function useIntersectionObserver({
  threshold = 0.1,
  rootMargin = "0px",
  triggerOnce = true,
}: UseIntersectionObserverProps = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const targetRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    if (triggerOnce && hasTriggered) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting
        setIsIntersecting(isIntersecting)

        if (isIntersecting && triggerOnce) {
          setHasTriggered(true)
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, triggerOnce, hasTriggered])

  return { targetRef, isIntersecting }
}
