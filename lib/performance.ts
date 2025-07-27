// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startTiming(label: string): void {
    this.metrics.set(label, performance.now())
  }

  endTiming(label: string): number {
    const startTime = this.metrics.get(label)
    if (!startTime) return 0

    const duration = performance.now() - startTime
    this.metrics.delete(label)

    // Log slow operations in development
    if (process.env.NODE_ENV === "development" && duration > 100) {
      console.warn(`Slow operation detected: ${label} took ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.startTiming(label)
    return fn().finally(() => {
      this.endTiming(label)
    })
  }

  measureSync<T>(label: string, fn: () => T): T {
    this.startTiming(label)
    try {
      return fn()
    } finally {
      this.endTiming(label)
    }
  }
}

// Memory management utilities
export class MemoryManager {
  private static cleanupTasks: (() => void)[] = []

  static addCleanupTask(task: () => void): void {
    this.cleanupTasks.push(task)
  }

  static cleanup(): void {
    this.cleanupTasks.forEach((task) => {
      try {
        task()
      } catch (error) {
        console.error("Cleanup task failed:", error)
      }
    })
    this.cleanupTasks = []
  }

  static debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null

    return (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }

  static throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
    let inThrottle = false

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  }
}

// Bundle size optimization
export const loadComponent = (importFn: () => Promise<any>) => {
  return importFn().catch((error) => {
    console.error("Failed to load component:", error)
    throw error
  })
}
