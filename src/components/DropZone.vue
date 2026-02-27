<template>
  <div
    class="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-colors cursor-pointer"
    :class="[
      'border-gray-600 hover:border-gray-400 bg-gray-800/50'
    ]"
    @click="selectDirectory"
  >
    <div class="text-center p-6">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
      <h3 class="text-xl font-medium text-gray-200 mb-2">点击选择或拖拽文件夹到这里</h3>
      <p class="text-sm text-gray-400">支持 .mp4, .webm, .mov 等视频格式</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['directory-selected'])

const selectDirectory = async () => {
  try {
    const handle = await window.showDirectoryPicker()
    emit('directory-selected', handle)
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('选择目录出错:', err)
      alert('无法访问该目录，请重试')
    }
  }
}
</script>
