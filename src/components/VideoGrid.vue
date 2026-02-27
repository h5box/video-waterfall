<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="files.length === 0" class="text-center text-gray-500 py-12">
      <p>暂无视频文件</p>
    </div>
    
    <div v-else>
      <RecycleScroller
        :items="rows"
        :item-size="320"
        key-field="id"
        page-mode
        class="scroller"
        ref="scrollerRef"
      >
        <template v-slot="{ item, index, active }">
          <div 
              class="grid gap-6 py-4 px-2"
              :class="{
                'grid-cols-1': cols === 1,
                'grid-cols-2': cols === 2,
                'grid-cols-3': cols === 3,
                'grid-cols-4': cols === 4
              }"
          >
              <div 
                v-for="file in item.items" 
                :key="file.relativePath" 
                :ref="(el) => setCardRef(el, file.relativePath)"
                class="transition-all duration-500"
                :class="{ 'z-20 relative': highlightedVideo && highlightedVideo.relativePath === file.relativePath }"
              >
                <VideoCard 
                  :fileHandle="file" 
                  :is-highlighted="highlightedVideo && highlightedVideo.relativePath === file.relativePath"
                  :cover-position="coverPosition"
                  @delete="handleDelete"
                  @open="handleOpen"
                />
              </div>
          </div>
        </template>
      </RecycleScroller>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'
import VideoCard from './VideoCard.vue'

const props = defineProps({
  files: {
    type: Array,
    default: () => []
  },
  highlightedVideo: {
    type: Object,
    default: null
  },
  coverPosition: {
    type: String,
    default: 'first_frame'
  }
})

const emit = defineEmits(['file-deleted', 'open-player'])
const cardRefs = ref({})
const scrollerRef = ref(null)

const breakpoints = useBreakpoints(breakpointsTailwind)

const cols = computed(() => {
  if (breakpoints.xl.value) return 4
  if (breakpoints.lg.value) return 3
  if (breakpoints.sm.value) return 2
  return 1
})

const rows = computed(() => {
  const c = cols.value
  const result = []
  for (let i = 0; i < props.files.length; i += c) {
    const chunk = props.files.slice(i, i + c)
    result.push({
      id: chunk.map(f => f.relativePath).join('_'), // Unique ID based on content
      items: chunk
    })
  }
  return result
})

const setCardRef = (el, id) => {
  if (el) {
    cardRefs.value[id] = el
  } else {
    delete cardRefs.value[id]
  }
}

watch(() => props.highlightedVideo, async (newVal) => {
  if (newVal) {
    await nextTick()
    
    const index = props.files.findIndex(f => f.relativePath === newVal.relativePath)
    if (index === -1) return

    // Check visibility
    let shouldScroll = true
    const el = cardRefs.value[newVal.relativePath]
    const headerOffset = 80 // Header height + padding
    
    if (el && el.isConnected) {
      const rect = el.getBoundingClientRect()
      // Check if completely visible
      const isInViewport = (
        rect.top >= headerOffset &&
        rect.bottom <= window.innerHeight
      )
      if (isInViewport) {
        shouldScroll = false
      }
    }

    if (shouldScroll && scrollerRef.value) {
       const rowIndex = Math.floor(index / cols.value)
       scrollerRef.value.scrollToItem(rowIndex)
       
       setTimeout(() => {
         window.scrollBy({ top: -headerOffset, behavior: 'smooth' })
       }, 50)
    }
  }
})

const handleDelete = (fileHandle) => {
  emit('file-deleted', fileHandle)
}

const handleOpen = (fileHandle, startTime = 0, dimensions = null) => {
  emit('open-player', fileHandle, startTime, dimensions)
}
</script>
