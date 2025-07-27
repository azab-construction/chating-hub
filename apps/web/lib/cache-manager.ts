interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

export class CacheManager {
  private cache = new Map<string, CacheItem<any>>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

  /**
   * حفظ البيانات في الذاكرة المؤقتة
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })

    // تنظيف الذاكرة المؤقتة تلقائياً
    setTimeout(() => {
      this.delete(key)
    }, ttl)
  }

  /**
   * استرجاع البيانات من الذاكرة المؤقتة
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    // التحقق من انتهاء الصلاحية
    if (Date.now() - item.timestamp > item.ttl) {
      this.delete(key)
      return null
    }

    return item.data
  }

  /**
   * حذف عنصر من الذاكرة المؤقتة
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * مسح جميع البيانات المؤقتة
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * الحصول على حجم الذاكرة المؤقتة
   */
  size(): number {
    return this.cache.size
  }

  /**
   * تنظيف البيانات المنتهية الصلاحية
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.delete(key)
      }
    }
  }
}

// إنشاء مثيل عام لإدارة الذاكرة المؤقتة
export const cacheManager = new CacheManager()

// تنظيف دوري كل 10 دقائق
setInterval(
  () => {
    cacheManager.cleanup()
  },
  10 * 60 * 1000,
)
