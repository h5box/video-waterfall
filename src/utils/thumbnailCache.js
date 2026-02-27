import { reactive } from 'vue'

// 使用 Map 存储缩略图缓存
// Key: fileName
// Value: { poster: string, duration: string, resolution: string, hasError: boolean }
const cache = reactive(new Map())

export const thumbnailCache = {
  get(fileName) {
    return cache.get(fileName)
  },
  set(fileName, data) {
    // 简单的内存限制，防止占用过多内存
    if (cache.size > 1000) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }
    
    // Merge with existing cache if any
    const existing = cache.get(fileName)
    if (existing && typeof existing === 'object') {
        cache.set(fileName, { ...existing, ...data })
    } else {
        cache.set(fileName, data)
    }
  },
  has(fileName) {
    return cache.has(fileName)
  }
}
