<template>
  <div class="min-h-screen bg-gray-900 text-gray-100 font-sans">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500 hidden sm:block">
            视频瀑布流
          </h1>
        </div>

        <div v-if="currentDirHandle" class="flex-1 max-w-xl mx-4 relative">
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="搜索视频..." 
              class="w-full bg-gray-800 text-gray-100 px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-700"
            />
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>
        
        <div class="flex items-center space-x-4">
          <div v-if="currentDirHandle" class="flex items-center space-x-4">
            <div class="flex items-center space-x-2 text-gray-400 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span class="max-w-[150px] truncate" :title="currentDirHandle.name">{{ currentDirHandle.name }}</span>
            </div>
            <button 
              @click="resetDirectory"
              class="flex items-center space-x-1 px-2 py-1 text-sm text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
              title="关闭当前目录"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <button 
            @click="isSettingsOpen = true"
            class="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
            title="设置"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <transition name="fade" mode="out-in">
        <!-- Initial State: Drop Zone -->
        <div v-if="!currentDirHandle" class="max-w-2xl mx-auto mt-20" key="dropzone">
          <DropZone @directory-selected="handleDirectorySelected" />
          
          <div class="mt-12 text-center text-gray-500 text-sm">
            <p>使用 File System Access API 直接读取本地文件</p>
            <p class="mt-2">所有操作均在本地完成，不会上传任何数据</p>
          </div>
        </div>

        <!-- Loaded State: Video Grid -->
        <div v-else key="grid">
          <div v-if="loading" class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            <span class="ml-4 text-gray-400">正在扫描视频文件...</span>
          </div>
          
          <div v-else>
             <div class="mb-4 text-gray-400 text-sm">
                共 {{ processedFiles.length }} 个视频
             </div>
             <VideoGrid 
               :files="processedFiles" 
               :highlighted-video="lastPlayedVideo"
               :cover-position="settings.coverPosition"
               @file-deleted="removeFileFromList" 
               @open-player="openPlayer" 
             />
          </div>
        </div>
      </transition>
    </main>
    
    <!-- Video Player Modal -->
    <VideoPlayerModal 
      :is-open="isPlayerOpen" 
      :file-handle="currentVideoHandle" 
      :start-time="playerStartTime"
      :initial-dimensions="playerInitialDimensions"
      :has-next="hasNext"
      :has-prev="hasPrev"
      @close="closePlayer"
      @request-delete="handleRequestDelete"
      @next-video="playNext"
      @prev-video="playPrev"
      @video-ended="handleVideoEnded"
    />

    <!-- Settings Modal -->
    <SettingsModal 
      :is-open="isSettingsOpen" 
      v-model="settings"
      @close="isSettingsOpen = false"
    />

    <!-- Confirm Modal -->
    <ConfirmModal
      :is-open="confirmModal.isOpen"
      :title="confirmModal.title"
      :message="confirmModal.message"
      @close="closeConfirmModal"
      @confirm="handleConfirmAction"
      @cancel="closeConfirmModal"
    />

    <!-- Global Drop Overlay -->
    <transition name="fade">
      <div 
        v-show="isDraggingOver"
        class="fixed inset-0 z-[100] bg-gray-900/90 backdrop-blur-md flex flex-col items-center justify-center"
        @dragleave="handleOverlayDragLeave"
        @dragover.prevent
        @drop.prevent="handleOverlayDrop"
      >
        <div class="absolute inset-8 border-4 border-indigo-500/50 border-dashed rounded-3xl pointer-events-none animate-[pulse_2s_ease-in-out_infinite]"></div>
        <div class="text-center pointer-events-none z-10 transform transition-transform duration-300 scale-100">
          <div class="bg-indigo-500/20 p-6 rounded-full inline-block mb-6 backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 class="text-4xl font-bold text-white mb-4 tracking-wide drop-shadow-lg">{{ currentDirHandle ? '释放切换目录' : '释放打开目录' }}</h2>
          <p class="text-xl text-gray-300 drop-shadow-md">松开鼠标以加载新文件夹内容</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, shallowRef, computed, watch, onMounted, onUnmounted } from 'vue'
import { useStorage } from '@vueuse/core'
import DropZone from './components/DropZone.vue'
import VideoGrid from './components/VideoGrid.vue'
import VideoPlayerModal from './components/VideoPlayerModal.vue'
import SettingsModal from './components/SettingsModal.vue'
import ConfirmModal from './components/ConfirmModal.vue'

const currentDirHandle = shallowRef(null)
const files = ref([])
const loading = ref(false)
const searchQuery = ref('')

const processedFiles = computed(() => {
  let result = [...files.value]
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(f => f.name.toLowerCase().includes(q))
  }
  
  return result
})

// Settings State
const isSettingsOpen = ref(false)
const settings = useStorage('video-waterfall-settings', {
  confirmDelete: true,
  autoPlayNext: true,
  coverPosition: 'first_frame'
})

// Confirm Modal State
const confirmModal = ref({
  isOpen: false,
  title: '',
  message: '',
  onConfirm: null
})

// Player State
const isPlayerOpen = ref(false)
const currentVideoHandle = shallowRef(null)
const lastPlayedVideo = shallowRef(null)
const playerStartTime = ref(0)
const playerInitialDimensions = ref(null)

const currentIndex = computed(() => {
  if (!currentVideoHandle.value || processedFiles.value.length === 0) return -1
  return processedFiles.value.findIndex(f => f.relativePath === currentVideoHandle.value.relativePath)
})

const hasPrev = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value !== -1 && currentIndex.value < processedFiles.value.length - 1)

const playNext = () => {
  if (hasNext.value) {
    const nextFile = processedFiles.value[currentIndex.value + 1]
    openPlayer(nextFile)
  }
}

const playPrev = () => {
  if (hasPrev.value) {
    const prevFile = processedFiles.value[currentIndex.value - 1]
    openPlayer(prevFile)
  }
}

const handleVideoEnded = () => {
  if (settings.value.autoPlayNext) {
    playNext()
  }
}

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.mkv', '.avi', '.wmv', '.flv', '.m4v']

const isVideoFile = (name) => {
  const ext = name.slice(name.lastIndexOf('.')).toLowerCase()
  return VIDEO_EXTENSIONS.includes(ext)
}

const handleDirectorySelected = async (handle) => {
  currentDirHandle.value = handle
  await scanDirectory(handle)
}

const scanDirectory = async (dirHandle) => {
  loading.value = true
  files.value = []
  
  try {
    const fileHandles = []
    
    // Recursive scan
    async function* getFilesRecursively(entry, path = '') {
      if (entry.kind === 'file') {
        if (isVideoFile(entry.name)) {
          entry.relativePath = path ? `${path}/${entry.name}` : entry.name
          yield entry
        }
      } else if (entry.kind === 'directory') {
        for await (const handle of entry.values()) {
          yield* getFilesRecursively(handle, path ? `${path}/${entry.name}` : entry.name)
        }
      }
    }

    for await (const fileHandle of getFilesRecursively(dirHandle)) {
      fileHandles.push(fileHandle)
    }
    
    // Sort files by name
    fileHandles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }))
    
    files.value = fileHandles
  } catch (err) {
    console.error('Error scanning directory:', err)
    alert('读取目录失败，请检查权限')
    currentDirHandle.value = null
  } finally {
    loading.value = false
  }
}

const removeFileFromList = (deletedHandle) => {
  files.value = files.value.filter(h => h.relativePath !== deletedHandle.relativePath)
}

const performDelete = async (fileHandle) => {
  try {
    // Find index before deletion to determine next video
    const index = files.value.findIndex(f => f.relativePath === fileHandle.relativePath)
    const wasPlaying = currentVideoHandle.value && currentVideoHandle.value.relativePath === fileHandle.relativePath

    await fileHandle.remove()
    removeFileFromList(fileHandle)
    
    // Play next video if the deleted file was being played
    if (wasPlaying) {
      if (index !== -1 && index < files.value.length) {
        // The file at the same index is now the next video
        openPlayer(files.value[index])
      } else {
        // No next video (deleted the last one), close player
        closePlayer()
      }
    }
  } catch (err) {
    console.error('Delete failed:', err)
    alert('删除失败，可能没有权限')
  }
}

const handleRequestDelete = (fileHandle) => {
  if (settings.value.confirmDelete) {
    confirmModal.value = {
      isOpen: true,
      title: '删除确认',
      message: `确定要永久删除 "${fileHandle.name}" 吗？此操作不可撤销。`,
      onConfirm: () => performDelete(fileHandle)
    }
  } else {
    performDelete(fileHandle)
  }
}

const closeConfirmModal = () => {
  confirmModal.value.isOpen = false
  confirmModal.value.onConfirm = null
}

const handleConfirmAction = () => {
  if (confirmModal.value.onConfirm) {
    confirmModal.value.onConfirm()
  }
  closeConfirmModal()
}

const openPlayer = (fileHandle, startTime = 0, dimensions = null) => {
  currentVideoHandle.value = fileHandle
  playerStartTime.value = startTime
  playerInitialDimensions.value = dimensions
  isPlayerOpen.value = true
}

const closePlayer = () => {
  lastPlayedVideo.value = currentVideoHandle.value
  isPlayerOpen.value = false
  currentVideoHandle.value = null
  playerStartTime.value = 0
  playerInitialDimensions.value = null
}

const resetDirectory = () => {
  currentDirHandle.value = null
  files.value = []
}

// Global Drag State
const isDraggingOver = ref(false)

const handleWindowDragEnter = (e) => {
  // Check if dragging files
  if (e.dataTransfer && e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
    isDraggingOver.value = true
  }
}

const handleOverlayDragLeave = (e) => {
  // Only hide if leaving the overlay (e.relatedTarget is null means left the window)
  if (e.relatedTarget === null) {
    isDraggingOver.value = false
  }
}

const handleOverlayDrop = async (e) => {
  isDraggingOver.value = false
  const item = e.dataTransfer.items[0]
  if (item && item.kind === 'file') {
    const entry = await item.getAsFileSystemHandle()
    if (entry.kind === 'directory') {
      await handleDirectorySelected(entry)
    } else {
      alert('请拖拽文件夹而不是单个文件')
    }
  }
}

onMounted(() => {
  window.addEventListener('dragenter', handleWindowDragEnter)
})

onUnmounted(() => {
  window.removeEventListener('dragenter', handleWindowDragEnter)
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
