<template>
  <Teleport to="body">
    <Transition name="modal" :duration="{ enter: 300, leave: 0 }">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center" :class="isWebMaximized ? 'p-0' : 'p-4 sm:p-6'" @click.self="close">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="close"></div>

    <!-- Modal Content -->
        <div 
          class="relative bg-gray-900 shadow-2xl overflow-hidden border border-gray-800 transform transition-all group"
          :class="isWebMaximized ? 'w-full h-full max-w-none rounded-none' : 'rounded-2xl'"
          :style="!isWebMaximized ? modalStyle : {}"
          @mouseleave="isIdle = true"
          @contextmenu="handleContextMenu"
        >
          <!-- Top Bar Hover Zone -->
          <div class="absolute top-0 left-0 right-0 h-24 z-20 group/topbar">
            <div 
              class="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 transition-opacity duration-300 bg-gradient-to-b from-black/80 to-transparent"
              :class="showTopBar ? 'opacity-100' : 'opacity-0 group-hover/topbar:opacity-100'"
            >
              <h3 class="text-lg font-medium text-white truncate pr-4 drop-shadow-md" :title="fileName">
                {{ fileName }}
              </h3>
              <div class="flex items-center space-x-2">
                <button 
                  @click="close"
                  class="p-2 text-gray-200 hover:text-white transition-colors rounded-full hover:bg-white/10 drop-shadow-md border border-gray-500/50 hover:border-white/80"
                  title="关闭 (Esc)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div 
            class="w-full h-full bg-black flex items-center justify-center relative overflow-hidden"
            @dblclick.capture="handleDoubleClick"
          >
            <div ref="playerHost" class="w-full h-full"></div>
             
            <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          </div>

        </div>

        <!-- Context Menu -->
        <div 
          v-if="contextMenu.show" 
          class="fixed z-[60] bg-gray-800 text-gray-200 rounded-lg shadow-xl py-1 w-40 border border-gray-700 text-sm overflow-hidden"
          :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
          @click.stop
        >
          <button @click="takeScreenshot(); closeContextMenu()" class="w-full text-left px-4 py-2 hover:bg-gray-700 hover:text-white flex items-center transition-colors">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            截图
          </button>
          <button @click="openDetails(); closeContextMenu()" class="w-full text-left px-4 py-2 hover:bg-gray-700 hover:text-white flex items-center transition-colors">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            视频详情
          </button>
          <div class="h-px bg-gray-700 my-1"></div>
          <button @click="handleDeleteClick(); closeContextMenu()" class="w-full text-left px-4 py-2 hover:bg-red-900/50 hover:text-red-400 text-red-400 flex items-center transition-colors">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            删除视频
          </button>
        </div>

        <!-- Details Modal -->
        <div v-if="showDetailsModal" class="fixed inset-0 z-[70] flex items-center justify-center p-4" @click.self="showDetailsModal = false">
           <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
           <div class="relative bg-gray-900 rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-700">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-bold text-white">视频详情</h3>
              <button @click="showDetailsModal = false" class="text-gray-400 hover:text-white">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between border-b border-gray-800 pb-2">
                <span class="text-gray-400 shrink-0 mr-4">文件名</span> 
                <span class="text-white text-right break-all" :title="videoDetails.name">{{ videoDetails.name }}</span>
              </div>
              <div class="flex justify-between border-b border-gray-800 pb-2" v-if="videoDetails.path">
                <span class="text-gray-400 shrink-0 mr-4">路径</span> 
                <span class="text-white text-right break-all" :title="videoDetails.path">{{ videoDetails.path }}</span>
              </div>
              <div class="flex justify-between border-b border-gray-800 pb-2">
                <span class="text-gray-400">分辨率</span> 
                <span class="text-white">{{ videoDetails.resolution }}</span>
              </div>
              <div class="flex justify-between border-b border-gray-800 pb-2">
                <span class="text-gray-400">时长</span> 
                <span class="text-white">{{ videoDetails.duration }}</span>
              </div>
              <div class="flex justify-between border-b border-gray-800 pb-2">
                <span class="text-gray-400">大小</span> 
                <span class="text-white">{{ videoDetails.size }}</span>
              </div>
              <div class="flex justify-between border-b border-gray-800 pb-2">
                <span class="text-gray-400">类型</span> 
                <span class="text-white">{{ videoDetails.type }}</span>
              </div>
              <div class="flex justify-between pt-1">
                <span class="text-gray-400">修改时间</span> 
                <span class="text-white">{{ videoDetails.lastModified }}</span>
              </div>
            </div>
            <div class="mt-6 flex justify-end">
               <button @click="showDetailsModal = false" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-lg">关闭</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onUnmounted, nextTick, onMounted, computed } from 'vue'
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'

const props = defineProps({
  isOpen: Boolean,
  fileHandle: Object,
  startTime: {
    type: Number,
    default: 0
  },
  hasNext: {
    type: Boolean,
    default: false
  },
  hasPrev: {
    type: Boolean,
    default: false
  },
  initialDimensions: {
    type: Object,
    default: null
  }
})
const emit = defineEmits(['close', 'request-delete', 'next-video', 'prev-video', 'video-ended'])

const playerHost = ref(null)
const videoUrl = ref('')
const fileName = ref('')
const loading = ref(false)
const isIdle = ref(false)
const isWebMaximized = ref(false)
const showTopBar = ref(false)
const contextMenu = ref({ show: false, x: 0, y: 0 })
const showDetailsModal = ref(false)
const videoDetails = ref({})
const videoDimensions = ref({ width: 0, height: 0 })

let idleTimer = null
let topBarTimer = null
let player = null
let mediaEl = null

const modalStyle = computed(() => {
  if (videoDimensions.value.width === 0 || videoDimensions.value.height === 0) {
    return { width: '80vw', height: '80vh' } // Default placeholder size
  }

  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
  const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

  // Maximize to 95% of viewport to leave some margin
  const maxWidth = vw * 0.95
  const maxHeight = vh * 0.95

  const videoRatio = videoDimensions.value.width / videoDimensions.value.height
  
  let targetWidth = maxWidth
  let targetHeight = targetWidth / videoRatio

  if (targetHeight > maxHeight) {
    targetHeight = maxHeight
    targetWidth = targetHeight * videoRatio
  }

  return {
    width: `${targetWidth}px`,
    height: `${targetHeight}px`
  }
})

const resetIdleTimer = () => {
  isIdle.value = false
  if (idleTimer) clearTimeout(idleTimer)
  idleTimer = setTimeout(() => {
    isIdle.value = true
  }, 3000)
}

const showTopBarBriefly = () => {
  showTopBar.value = true
  if (topBarTimer) clearTimeout(topBarTimer)
  topBarTimer = setTimeout(() => {
    showTopBar.value = false
  }, 3000)
}

const closeContextMenu = () => {
  contextMenu.value.show = false
}

const handleContextMenu = (e) => {
  e.preventDefault()
  contextMenu.value = {
    show: true,
    x: e.clientX,
    y: e.clientY
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDuration = (seconds) => {
  if (!seconds) return 'Unknown'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return h > 0 
    ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    : `${m}:${s.toString().padStart(2, '0')}`
}

const openDetails = async () => {
  if (!props.fileHandle) return
  
  try {
    const file = await props.fileHandle.getFile()
    
    videoDetails.value = {
      name: file.name,
      path: props.fileHandle.relativePath || file.name,
      size: formatFileSize(file.size),
      type: file.type || 'video/mp4',
      lastModified: new Date(file.lastModified).toLocaleString(),
      resolution: mediaEl ? `${mediaEl.videoWidth} x ${mediaEl.videoHeight}` : 'Unknown',
      duration: mediaEl ? formatDuration(mediaEl.duration) : 'Unknown'
    }
    showDetailsModal.value = true
  } catch (err) {
    console.error('Failed to get file details:', err)
  }
}

const toggleWebMaximize = () => {
  isWebMaximized.value = !isWebMaximized.value
}

const handleDoubleClick = (e) => {
  // If clicking on controls, don't trigger web maximize
  if (e.target.closest('.plyr__controls')) return

  e.stopPropagation()
  e.preventDefault()
  toggleWebMaximize()
}

const handleKeydown = (e) => {
  if (!props.isOpen) return
  
  if (e.key === 'Escape') {
    close()
  } else if (e.key === 'ArrowRight' && e.ctrlKey) {
    if (props.hasNext) emit('next-video')
  } else if (e.key === 'ArrowLeft' && e.ctrlKey) {
    if (props.hasPrev) emit('prev-video')
  } else if (e.key === 'Delete') {
    handleDeleteClick()
  } else if (e.key.toLowerCase() === 's') {
    const tagName = document.activeElement?.tagName
    if (tagName !== 'INPUT' && tagName !== 'TEXTAREA') {
      takeScreenshot()
    }
  }
}

const handleWheel = (e) => {
  if (!player) return
  
  e.preventDefault()

  // Sensitivity factor: 1 step per event (usually 100px or so)
  // We'll use a fixed step of 5 seconds for now
  const step = 5

  if (e.deltaY < 0) {
    // Scroll Up -> Backward
    player.rewind(step)
  } else {
    // Scroll Down -> Forward
    player.forward(step)
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('click', closeContextMenu)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('click', closeContextMenu)
  if (player) {
    player.destroy()
    player = null
  }
  if (idleTimer) clearTimeout(idleTimer)
  if (topBarTimer) clearTimeout(topBarTimer)
  if (playerHost.value) {
    playerHost.value.innerHTML = ''
  }
  mediaEl = null
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value)
  }
})

watch(() => props.isOpen, async (newVal) => {
  if (newVal && props.fileHandle) {
    fileName.value = props.fileHandle.name
    resetIdleTimer()
    isWebMaximized.value = false
    videoDimensions.value = props.initialDimensions || { width: 0, height: 0 }
    showTopBarBriefly()
    await loadVideo()
  } else {
    if (player) {
      player.destroy()
      player = null
    }
    if (playerHost.value) {
      playerHost.value.innerHTML = ''
    }
    mediaEl = null
    if (videoUrl.value) {
      URL.revokeObjectURL(videoUrl.value)
      videoUrl.value = ''
    }
  }
})

watch(() => props.fileHandle, async (newVal) => {
  if (props.isOpen && newVal) {
    fileName.value = newVal.name
    resetIdleTimer()
    // For navigation within player, we don't have new dimensions yet, so reset
    videoDimensions.value = { width: 0, height: 0 }
    showTopBarBriefly()
    await loadVideo()
  }
})

watch(() => [props.hasPrev, props.hasNext], () => {
  updateCustomControls()
})

const customControls = {
  prev: null,
  next: null
}

const updateCustomControls = () => {
  if (customControls.prev) {
    if (props.hasPrev) {
      customControls.prev.removeAttribute('disabled')
      customControls.prev.style.opacity = '1'
      customControls.prev.style.cursor = 'pointer'
    } else {
      customControls.prev.setAttribute('disabled', '')
      customControls.prev.style.opacity = '0.5'
      customControls.prev.style.cursor = 'not-allowed'
    }
  }
  if (customControls.next) {
    if (props.hasNext) {
      customControls.next.removeAttribute('disabled')
      customControls.next.style.opacity = '1'
      customControls.next.style.cursor = 'pointer'
    } else {
      customControls.next.setAttribute('disabled', '')
      customControls.next.style.opacity = '0.5'
      customControls.next.style.cursor = 'not-allowed'
    }
  }
}

const injectCustomControls = (plyrInstance) => {
  if (!plyrInstance || !plyrInstance.elements.controls) return

  const controls = plyrInstance.elements.controls
  const playBtn = controls.querySelector('[data-plyr="play"]')
  
  // Create Prev Button
  const prevBtn = document.createElement('button')
  prevBtn.type = 'button'
  prevBtn.className = 'plyr__controls__item plyr__control'
  prevBtn.setAttribute('data-plyr', 'prev')
  prevBtn.setAttribute('aria-label', 'Previous Video')
  // Use a more solid/filled icon style matching Plyr
  prevBtn.innerHTML = `<svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>`
  prevBtn.addEventListener('click', () => emit('prev-video'))
  
  // Create Next Button
  const nextBtn = document.createElement('button')
  nextBtn.type = 'button'
  nextBtn.className = 'plyr__controls__item plyr__control'
  nextBtn.setAttribute('data-plyr', 'next')
  nextBtn.setAttribute('aria-label', 'Next Video')
  nextBtn.innerHTML = `<svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>`
  nextBtn.addEventListener('click', () => emit('next-video'))

  // Insert
  if (playBtn) {
    controls.insertBefore(prevBtn, playBtn)
    if (playBtn.nextSibling) {
      controls.insertBefore(nextBtn, playBtn.nextSibling)
    } else {
      controls.appendChild(nextBtn)
    }
  } else {
    controls.prepend(nextBtn)
    controls.prepend(prevBtn)
  }

  customControls.prev = prevBtn
  customControls.next = nextBtn
  
  updateCustomControls()
}

const ensureMediaEl = () => {
  if (!playerHost.value) return null
  playerHost.value.innerHTML = ''
  const el = document.createElement('video')
  el.className = 'plyr-video w-full h-full'
  el.setAttribute('controls', '')
  el.setAttribute('playsinline', '')
  playerHost.value.appendChild(el)
  return el
}

const initPlayer = () => {
  if (player) {
    player.destroy()
    player = null
    customControls.prev = null
    customControls.next = null
  }
  if (!mediaEl) return

  player = new Plyr(mediaEl, {
        controls: [
          'play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'
        ],
        settings: ['quality', 'speed', 'loop'],
        autoplay: true,
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
        keyboard: { focused: true, global: true },
        tooltips: { controls: true, seek: true },
        i18n: {
          restart: '重新播放',
          rewind: '快退 {seektime}s',
          play: '播放',
          pause: '暂停',
          fastForward: '快进 {seektime}s',
          seek: '进度',
          seekLabel: '{currentTime} / {duration}',
          played: '已播放',
          buffered: '已缓冲',
          currentTime: '当前时间',
          duration: '时长',
          volume: '音量',
          mute: '静音',
          unmute: '取消静音',
          enableCaptions: '开启字幕',
          disableCaptions: '关闭字幕',
          download: '下载',
          enterFullscreen: '进入全屏',
          exitFullscreen: '退出全屏',
          frameTitle: '播放器 {title}',
          captions: '字幕',
          settings: '设置',
          pip: '画中画',
          menuBack: '返回',
          speed: '速度',
          normal: '正常',
          quality: '画质',
          loop: '循环播放',
          start: '开始',
          end: '结束',
          all: '全部',
          reset: '重置',
          disabled: '禁用',
          enabled: '启用',
          advertisement: '广告',
        }
      })

  player.on('ready', () => {
    injectCustomControls(player)

    // Add wheel event to progress bar
    if (player.elements.progress) {
      player.elements.progress.addEventListener('wheel', handleWheel, { passive: false })
    }
  })

  player.on('ended', () => {
    emit('video-ended')
  })
}

const loadVideo = async () => {
  loading.value = true
  try {
    const file = await props.fileHandle.getFile()
    if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
    videoUrl.value = URL.createObjectURL(file)
    
    await nextTick()
    
    mediaEl = ensureMediaEl()
    if (!mediaEl) return
    mediaEl.src = videoUrl.value

    if (props.startTime > 0) {
      const startAt = props.startTime
      const onMeta = () => {
        if (!mediaEl) return
        mediaEl.currentTime = startAt
        videoDimensions.value = {
          width: mediaEl.videoWidth,
          height: mediaEl.videoHeight
        }
        mediaEl.removeEventListener('loadedmetadata', onMeta)
      }
      mediaEl.addEventListener('loadedmetadata', onMeta)
    } else {
       const onMeta = () => {
        if (!mediaEl) return
        videoDimensions.value = {
          width: mediaEl.videoWidth,
          height: mediaEl.videoHeight
        }
        mediaEl.removeEventListener('loadedmetadata', onMeta)
      }
      mediaEl.addEventListener('loadedmetadata', onMeta)
    }

    initPlayer()
    mediaEl.load()
  } catch (err) {
    console.error('Failed to load video:', err)
  } finally {
    loading.value = false
  }
}

const takeScreenshot = () => {
  if (!mediaEl) return
  
  const canvas = document.createElement('canvas')
  canvas.width = mediaEl.videoWidth
  canvas.height = mediaEl.videoHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(mediaEl, 0, 0, canvas.width, canvas.height)
  
  try {
    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `screenshot-${fileName.value}-${Math.floor(mediaEl.currentTime)}.png`
    link.href = dataUrl
    link.click()
  } catch (err) {
    console.error('Screenshot failed:', err)
  }
}

const close = () => {
  emit('close')
}

const handleDeleteClick = () => {
  emit('request-delete', props.fileHandle)
}
</script>

<style>
:root {
  --plyr-video-control-background-hover: rgba(0, 179, 255, .1);
}

.plyr {
  height: 100%;
  width: 100%;
}

.plyr__video-wrapper {
  height: 100%;
  width: 100%;
}

.plyr video {
  height: 100% !important;
  width: 100% !important;
  object-fit: contain;
}

.plyr__controls .plyr__controls__item.plyr__control[data-plyr="prev"],
.plyr__controls .plyr__controls__item.plyr__control[data-plyr="next"],
.plyr__controls .plyr__controls__item.plyr__control[data-plyr="web-maximize"] {
  padding: 7px;
}

.plyr__controls .plyr__controls__item.plyr__control[data-plyr="prev"] svg,
.plyr__controls .plyr__controls__item.plyr__control[data-plyr="next"] svg,
.plyr__controls .plyr__controls__item.plyr__control[data-plyr="web-maximize"] svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}
</style>

<style scoped>
.modal-enter-active .transform {
  transition: all 0.3s ease-out;
}

.modal-enter-from .transform {
  opacity: 0;
  transform: scale(0.95);
}
</style>
