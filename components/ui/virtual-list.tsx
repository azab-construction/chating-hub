"use client"

import type React from "react"

import { useState, useRef, useMemo } from "react"
import { cn } from "@/lib/utils"

interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
  overscan?: number
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const scrollElementRef = useRef<HTMLDivElement>(null)

  const { visibleItems, totalHeight, offsetY } = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(startIndex + Math.ceil(containerHeight / itemHeight) + overscan, items.length - 1)

    const visibleStartIndex = Math.max(0, startIndex - overscan)
    const visibleEndIndex = endIndex

    return {
      visibleItems: items.slice(visibleStartIndex, visibleEndIndex + 1).map((item, index) => ({
        item,
        index: visibleStartIndex + index,
      })),
      totalHeight: items.length * itemHeight,
      offsetY: visibleStartIndex * itemHeight,
    }
  }, [items, itemHeight, scrollTop, containerHeight, overscan])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  return (
    <div
      ref={scrollElementRef}
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(({ item, index }) => (
            <div key={index} style={{ height: itemHeight }}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
