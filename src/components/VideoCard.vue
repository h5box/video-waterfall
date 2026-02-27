<template>
  <div 
    ref="containerRef"
    class="relative group rounded-xl overflow-hidden bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    :class="{ 'ring-2 ring-indigo-500 shadow-indigo-500/50 scale-[1.02] z-10': isHighlighted }"
  >
    <div 
      class="aspect-video relative bg-black cursor-pointer" 
      @click="openPlayer"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <img 
        v-if="posterUrl && !isPlaying" 
        :src="posterUrl" 
        class="w-full h-full object-cover"
      />
      <video
        v-show="isPlaying || !posterUrl"
        ref="videoRef"
        :src="videoUrl"
        class="w-full h-full object-cover"
        :muted="isMuted"
        loop
        playsinline
        disablePictureInPicture
        preload="none"
      ></video>
      
      <!-- Error State -->
      <div v-if="hasError" class="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-20">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span class="text-xs text-gray-400">无法解码视频</span>
      </div>

      <!-- Audio/No-Video State -->
      <div v-if="isAudioOnly" class="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10 p-4 text-center">
        <template v-if="isAudioFile">
          <!-- Music Icon for actual audio files -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-indigo-400 mb-2 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <span class="text-xs text-gray-400 font-medium">音频文件</span>
        </template>
        <template v-else>
          <!-- Warning Icon for video files with no video track (HEVC etc) -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18" />
          </svg>
          <span class="text-xs text-gray-300 font-medium">无法预览画面</span>
          <span class="text-[10px] text-gray-500 mt-1">可能是不支持的编码 (如 HEVC)</span>
        </template>
      </div>

      <!-- Loading State -->
      <div v-if="!videoUrl && !posterUrl && !hasError && !isAudioOnly" class="absolute inset-0 flex items-center justify-center bg-gray-900">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>

      <!-- Mute Control (Visible on Hover) -->
      <button 
        @click.stop="toggleMute"
        class="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform scale-90 hover:scale-100 backdrop-blur-sm"
        :title="isMuted ? '取消静音' : '静音'"
      >
        <svg v-if="isMuted" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clip-rule="evenodd" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      </button>
      
      <!-- Progress Bar -->
      <div 
        class="absolute bottom-0 left-0 right-0 h-4 bg-transparent z-20 group-hover:block hidden cursor-pointer group/progress"
        @mousemove="handleProgressHover"
        @mouseleave="handleProgressLeave"
        @click.stop="handleProgressClick"
      >
        <!-- Tooltip -->
        <div 
          v-if="hoverTime !== null"
          class="absolute bottom-6 bg-black/80 rounded-lg overflow-hidden border border-gray-700 pointer-events-none transform -translate-x-1/2 z-30"
          :style="{ left: hoverX + 'px' }"
        >
          <div v-if="hoverThumbnail" class="w-32 aspect-video bg-black">
            <img :src="hoverThumbnail" class="w-full h-full object-cover" />
          </div>
          <div class="px-2 py-1 text-center text-xs text-white">
            {{ formatTime(hoverTime) }}
          </div>
        </div>

        <!-- Bar Track -->
        <div class="absolute bottom-0 left-0 right-0 h-1 bg-gray-700/50 group-hover/progress:h-1.5 transition-all duration-200">
          <div 
            class="h-full bg-indigo-500/80 transition-all duration-100" 
            :style="{ width: progress + '%' }"
          ></div>
        </div>
      </div>
      
      <!-- Resolution Badge -->
      <div v-if="resolution" class="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded backdrop-blur-sm pointer-events-none">
        {{ resolution }}
      </div>

      <!-- Duration Badge -->
      <div class="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded backdrop-blur-sm pointer-events-none">
        {{ duration }}
      </div>
    </div>

    <div class="p-3">
      <h3 class="text-sm font-medium text-gray-200 truncate" :title="file.name">{{ getDisplayName(file.name) }}</h3>
      <div class="flex justify-between items-center mt-1 text-xs text-gray-400">
        <span v-if="file.size">{{ formatSize(file.size) }}</span>
        <span v-if="file.lastModified">{{ new Date(file.lastModified).toLocaleDateString() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { thumbnailCache } from '../utils/thumbnailCache'

const props = defineProps({
  fileHandle: {
    type: Object,
    required: true
  },
  isHighlighted: {
    type: Boolean,
    default: false
  },
  coverPosition: {
    type: String,
    default: 'first_frame'
  }
})

const emit = defineEmits(['delete', 'open'])

const containerRef = ref(null)
const videoRef = ref(null)
const videoUrl = ref('')
const posterUrl = ref('')
const isPlaying = ref(false)
const hasError = ref(false)
const isAudioOnly = ref(false)
const file = ref({ name: '', size: 0, lastModified: 0 })
const duration = ref('00:00')
const resolution = ref('')
const progress = ref(0)
const lastTime = ref(0)
const isMuted = ref(true)
const dimensions = ref({ width: 0, height: 0 })

// Thumbnail & Progress Hover
const hoverTime = ref(null)
const hoverX = ref(0)
const hoverThumbnail = ref(null)
const thumbnails = ref([])
const isGeneratingThumbnails = ref(false)
const playTimer = ref(null)
let thumbnailTimer = null

const isAudioFile = computed(() => {
  const name = file.value.name || props.fileHandle.name || ''
  return /\.(mp3|wav|ogg|aac|flac|m4a|wma|aiff)$/i.test(name)
})

const getDisplayName = (name) => {
  return name ? name.replace(/\.[^/.]+$/, "") : ""
}

const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const unloadVideo = () => {
    if (videoUrl.value) {
        const urlToRevoke = videoUrl.value
        videoUrl.value = ''
        
        if (videoRef.value) {
            videoRef.value.pause()
            videoRef.value.removeAttribute('src')
            videoRef.value.load()
        }
        
        setTimeout(() => {
            URL.revokeObjectURL(urlToRevoke)
        }, 100)
    }
}

watch(() => props.fileHandle, (newVal) => {
  // Reset state when file changes (recycling)
  unloadVideo()
  posterUrl.value = ''
  isPlaying.value = false
  hasError.value = false
  isAudioOnly.value = false
  progress.value = 0
  duration.value = '00:00'
  resolution.value = ''
  
  // Basic info from handle
  file.value = { 
    name: newVal.name, 
    size: 0, 
    lastModified: 0 
  }
  
  // Check cache
  const cached = thumbnailCache.get(newVal.relativePath)
  if (cached) {
    if (typeof cached === 'string') {
        // Legacy cache support
        posterUrl.value = cached
    } else {
        // Check if cached poster matches current setting
        if (cached.coverPosition === props.coverPosition) {
            posterUrl.value = cached.poster || ''
        } else {
            posterUrl.value = ''
        }
        duration.value = cached.duration || '00:00'
        resolution.value = cached.resolution || ''
        hasError.value = cached.hasError || false
        isAudioOnly.value = cached.isAudioOnly || false
    }
  }
}, { immediate: true })

watch(() => props.coverPosition, (newVal) => {
  // Check if we already have a cached poster for this position
  const cached = thumbnailCache.get(props.fileHandle.relativePath)
  if (cached && cached.coverPosition === newVal && cached.poster) {
      posterUrl.value = cached.poster
      return
  }
  
  // Otherwise clear current poster and reload
  posterUrl.value = ''
  if (!isPlaying.value && !isAudioOnly.value) {
      loadVideo(false, true)
  }
})

const handleMouseEnter = () => {
  // Delay playback by 300ms
  playTimer.value = setTimeout(() => {
      // Do not set isPlaying=true yet to avoid black frame
      playPreview()
  }, 300)
}

const handleMouseLeave = () => {
  if (playTimer.value) {
    clearTimeout(playTimer.value)
    playTimer.value = null
  }
  
  stopPreview()
  isPlaying.value = false // Hide video element
  
  if (thumbnailTimer) {
    clearTimeout(thumbnailTimer)
    thumbnailTimer = null
  }
}

const generateThumbnails = async (targetTime) => {
  if (isGeneratingThumbnails.value || isAudioOnly.value) return
  
  // Calculate index range to load (around targetTime)
  // Total 100 thumbnails
  const totalThumbnails = 100
  if (!duration.value || duration.value === '00:00') return
  
  // Parse duration string to seconds for calculation if needed, 
  // but we can just use videoRef.value.duration if available
  // Let's assume we have videoRef or metadata loaded
  let videoDuration = 0
  if (videoRef.value && videoRef.value.duration) {
      videoDuration = videoRef.value.duration
  } else {
      // If no video duration, we can't calculate index
      return
  }
  
  const interval = videoDuration / totalThumbnails
  const targetIndex = Math.floor(targetTime / interval)
  
  // Load 10 thumbnails around target (5 before, 5 after)
  const startIdx = Math.max(0, targetIndex - 5)
  const endIdx = Math.min(totalThumbnails - 1, targetIndex + 5)
  
  // Filter out already loaded thumbnails
  const indexesToLoad = []
  for (let i = startIdx; i <= endIdx; i++) {
      if (!thumbnails.value.find(t => t.index === i)) {
          indexesToLoad.push(i)
      }
  }
  
  if (indexesToLoad.length === 0) return

  isGeneratingThumbnails.value = true

  let urlToUse = videoUrl.value
  let isTempUrl = false
  let video = null

  try {
    // If no videoUrl available (not loaded yet or scrolled out), create a temporary one
    if (!urlToUse) {
        const fileData = file.value && file.value.size ? file.value : await props.fileHandle.getFile()
        // Cache file data if not present
        if (!file.value.size) file.value = fileData
        
        urlToUse = URL.createObjectURL(fileData)
        isTempUrl = true
    }

    video = document.createElement('video')
    video.src = urlToUse
    video.muted = true
    video.playsInline = true
    video.crossOrigin = 'anonymous'
    
    // Wait for metadata
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = resolve
      video.onerror = (e) => {
         // If we have duration despite error (e.g. partial content), resolve
         if (video.duration) resolve()
         else reject(e)
      }
      // Timeout fallback
      setTimeout(() => reject(new Error('Timeout loading video metadata')), 5000)
    })
    
    if (!video.duration) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const width = 160 // Thumbnail width
    const height = (video.videoHeight / video.videoWidth) * width
    canvas.width = width
    canvas.height = height
    
    for (const i of indexesToLoad) {
      const time = i * interval
      
      // Seek
      video.currentTime = time
      await new Promise(resolve => {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked)
          resolve()
        }
        video.addEventListener('seeked', onSeeked)
      })
      
      // Draw
      ctx.drawImage(video, 0, 0, width, height)
      thumbnails.value.push({
        index: i,
        time: time,
        url: canvas.toDataURL('image/jpeg', 0.6)
      })
      
      // Yield
      await new Promise(resolve => setTimeout(resolve, 0))
    }
    
    // Sort thumbnails by time
    thumbnails.value.sort((a, b) => a.time - b.time)
    
  } catch (err) {
    console.error('Thumbnail generation failed:', err)
  } finally {
    isGeneratingThumbnails.value = false
    
    // Cleanup video element first to stop any pending requests
    if (video) {
       video.pause()
       video.removeAttribute('src')
       video.load()
       video = null
    }

    // Cleanup temp url
    if (isTempUrl && urlToUse) {
       // Delay revoke to prevent browser accessing it immediately after cleanup
       setTimeout(() => {
           URL.revokeObjectURL(urlToUse)
       }, 1000)
    }
  }
}

const handleProgressHover = (e) => {
  if (!videoRef.value || !videoRef.value.duration) return
  
  const rect = e.currentTarget.getBoundingClientRect()
  const x = e.clientX - rect.left
  const width = rect.width
  const percentage = Math.max(0, Math.min(1, x / width))
  
  // Calculate hoverX with boundary checks for tooltip
  const tooltipWidth = 128 // 32 * 4 (w-32)
  const halfTooltip = tooltipWidth / 2
  
  let tooltipX = x
  if (x < halfTooltip) {
    tooltipX = halfTooltip
  } else if (x > width - halfTooltip) {
    tooltipX = width - halfTooltip
  }
  
  hoverX.value = tooltipX
  const time = percentage * videoRef.value.duration
  hoverTime.value = time
  
  // Trigger lazy loading of thumbnails
  if (thumbnailTimer) clearTimeout(thumbnailTimer)
  thumbnailTimer = setTimeout(() => {
      generateThumbnails(time)
  }, 100) // 100ms debounce
  
  // Find closest thumbnail
  if (thumbnails.value.length > 0) {
    // Binary search or simple find (array is sorted by time)
    const closest = thumbnails.value.reduce((prev, curr) => {
      return (Math.abs(curr.time - time) < Math.abs(prev.time - time) ? curr : prev)
    })
    
    // Only show if close enough (e.g. within 5% of duration or 5 seconds)
    // If the gap is too large, it means we haven't loaded that part yet
    // But for better UX, showing slightly off is better than nothing? 
    // Let's just show closest.
    hoverThumbnail.value = closest.url
  } else {
    hoverThumbnail.value = null
  }
}

const handleProgressLeave = () => {
  hoverTime.value = null
  hoverThumbnail.value = null
}

const handleProgressClick = (e) => {
  if (!videoRef.value || !videoRef.value.duration) return
  
  const rect = e.currentTarget.getBoundingClientRect()
  const x = e.clientX - rect.left
  const width = rect.width
  const percentage = Math.max(0, Math.min(1, x / width))
  const time = percentage * videoRef.value.duration
  
  // Update video time
  videoRef.value.currentTime = time
  lastTime.value = time
  
  // Ensure playing if paused
  videoRef.value.play().catch(() => {})
}

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const loadVideo = async (shouldLoadMetadata = false, onlyPoster = false) => {
  if (videoUrl.value) return

  try {
    const fileData = await props.fileHandle.getFile()
    file.value = fileData
    videoUrl.value = URL.createObjectURL(fileData)
    
    if (videoRef.value) {
      videoRef.value.ontimeupdate = (e) => {
        const video = e.target
        if (video.duration) {
          progress.value = (video.currentTime / video.duration) * 100
        }
      }

      // Helper for capturing poster
      const capturePoster = (video) => {
           if (video.videoWidth === 0 || video.videoHeight === 0) return

           const canvas = document.createElement('canvas')
           canvas.width = video.videoWidth
           canvas.height = video.videoHeight
           canvas.getContext('2d').drawImage(video, 0, 0)
           const data = canvas.toDataURL('image/jpeg', 0.7)
           posterUrl.value = data
           
           // Cache with position info
           thumbnailCache.set(props.fileHandle.relativePath, { 
               poster: data,
               coverPosition: props.coverPosition,
               duration: duration.value,
               resolution: resolution.value
           })
           
           // If only poster was requested, unload video immediately to save resources
           if (!isPlaying.value) {
             unloadVideo()
           }
      }

      videoRef.value.onloadedmetadata = (e) => {
        const video = e.target
        // Check if duration is valid/finite
        if (!Number.isFinite(video.duration) || video.duration <= 0) {
            console.warn('Invalid duration for', file.value.name)
        }

        const sec = Math.floor(video.duration)
        const min = Math.floor(sec / 60)
        const s = sec % 60
        duration.value = `${min}:${s.toString().padStart(2, '0')}`
        
        const width = video.videoWidth
        const height = video.videoHeight
        
        if (width === 0 || height === 0) {
          isAudioOnly.value = true
          thumbnailCache.set(props.fileHandle.relativePath, {
            duration: duration.value,
            isAudioOnly: true
          })
          
          if (onlyPoster && !isPlaying.value) {
             unloadVideo()
          }
        } else {
          resolution.value = `${width}x${height}`
          dimensions.value = { width, height }
          
          // Update metadata in cache
          thumbnailCache.set(props.fileHandle.relativePath, {
            duration: duration.value,
            resolution: resolution.value
          })
          
          // Handle Poster Capture with Position
          if (onlyPoster && !posterUrl.value && !isAudioOnly.value) {
              let target = 0
              const d = video.duration || 0
              const pos = props.coverPosition

              if (pos === 'percent_10') target = d * 0.1
              else if (pos === 'percent_25') target = d * 0.25
              else if (pos === 'percent_50') target = d * 0.5
              else if (pos === 'second_1') target = 1
              else if (pos === 'second_5') target = 5
              else if (pos === 'second_10') target = 10
              // first_frame is 0
              
              // Ensure target is within bounds (leave 0.5s buffer at end if possible)
              if (d > 0 && target >= d) target = Math.max(0, d - 0.5)
              
              // If target is effectively 0, we can capture immediately if ready
              if (target < 0.1) {
                  video.currentTime = 0
                  const onLoadedData = () => {
                      capturePoster(video)
                      video.removeEventListener('loadeddata', onLoadedData)
                  }
                  if (video.readyState >= 2) capturePoster(video)
                  else video.addEventListener('loadeddata', onLoadedData)
              } else {
                  // Seek to target
                  video.currentTime = target
                  const onSeeked = () => {
                      capturePoster(video)
                      video.removeEventListener('seeked', onSeeked)
                  }
                  video.addEventListener('seeked', onSeeked)
              }
          }
        }
      }

      videoRef.value.onerror = (e) => {
          // Ignore error if we already have a poster or if it's an empty src error
          if (!videoUrl.value || posterUrl.value) return
          
          console.error('Video error:', e, videoRef.value.error)
          hasError.value = true
          thumbnailCache.set(props.fileHandle.relativePath, { hasError: true })
          unloadVideo()
      }
      
      if (shouldLoadMetadata || onlyPoster) {
         videoRef.value.load()
      }
    }
  } catch (err) {
    console.error('Failed to load video:', err)
    hasError.value = true
  }
}

const playPreview = () => {
  if (!videoUrl.value) {
     loadVideo(true).then(() => {
        if (videoRef.value) {
           videoRef.value.currentTime = lastTime.value
           videoRef.value.play().then(() => {
               // Only show video after it starts playing to avoid black flash
               isPlaying.value = true
           }).catch(() => {})
        }
     })
  } else if (videoRef.value) {
    if (videoRef.value.readyState === 0) videoRef.value.load()
    videoRef.value.currentTime = lastTime.value
    videoRef.value.play().then(() => {
        isPlaying.value = true
    }).catch(() => {})
  }
}

const stopPreview = () => {
  if (videoRef.value) {
    lastTime.value = videoRef.value.currentTime
    
    // Update poster with current frame
    if (videoRef.value.readyState >= 2 && videoRef.value.videoWidth > 0) { // HAVE_CURRENT_DATA
        try {
            const canvas = document.createElement('canvas')
            canvas.width = videoRef.value.videoWidth
            canvas.height = videoRef.value.videoHeight
            const ctx = canvas.getContext('2d')
            ctx.drawImage(videoRef.value, 0, 0)
            const data = canvas.toDataURL('image/jpeg', 0.7)
            posterUrl.value = data
            thumbnailCache.set(props.fileHandle.relativePath, { poster: data })
        } catch (e) {
            console.warn('Failed to update poster', e)
        }
    }
    
    videoRef.value.pause()
  }
  // If we have a poster, unload the video to save memory
  if (posterUrl.value) {
      unloadVideo()
  }
}

const toggleMute = () => {
  isMuted.value = !isMuted.value
}

const openPlayer = () => {
  emit('open', props.fileHandle, lastTime.value, dimensions.value)
}

onMounted(() => {
  // Initial load is handled by IntersectionObserver
})

const loadVideoTimer = ref(null)

useIntersectionObserver(
  containerRef,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      // Check cache first
      const cached = thumbnailCache.get(props.fileHandle.relativePath)
      // If we have a cached poster OR error state, we don't need to load anything
      if (cached && (cached.poster || cached.hasError || typeof cached === 'string')) {
          if (typeof cached === 'string') posterUrl.value = cached
          else {
              if (cached.poster) posterUrl.value = cached.poster
              if (cached.hasError) hasError.value = true
          }
          return
      }

      // Debounce loading: only load if stays in viewport for 300ms
      loadVideoTimer.value = setTimeout(() => {
        if (!videoUrl.value && !posterUrl.value && !hasError.value) {
            // Load video just to generate poster, then unload
            loadVideo(false, true)
        }
      }, 300)
    } else {
      // Clear timer if scrolled out quickly
      if (loadVideoTimer.value) {
        clearTimeout(loadVideoTimer.value)
        loadVideoTimer.value = null
      }

      // Unload video to save memory when scrolled out
      unloadVideo()
    }
  },
  { rootMargin: '200px' } // Preload when close
)


onUnmounted(() => {
  unloadVideo()
  
  if (thumbnailTimer) {
    clearTimeout(thumbnailTimer)
  }
  if (loadVideoTimer.value) {
    clearTimeout(loadVideoTimer.value)
  }
  if (playTimer.value) {
    clearTimeout(playTimer.value)
  }
})
</script>
