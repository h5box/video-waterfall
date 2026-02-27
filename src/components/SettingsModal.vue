<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="close">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>

        <div class="relative w-full max-w-md bg-gray-800 rounded-xl shadow-2xl border border-gray-700 transform transition-all p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-white">设置</h2>
            <button @click="close" class="text-gray-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-medium text-gray-200">删除确认</h3>
                <p class="text-sm text-gray-400 mt-1">在删除文件前弹出确认框</p>
              </div>
              <button 
                @click="toggleSetting('confirmDelete')"
                class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                :class="[modelValue.confirmDelete ? 'bg-indigo-600' : 'bg-gray-600']"
              >
                <span class="sr-only">Toggle confirm delete</span>
                <span 
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  :class="[modelValue.confirmDelete ? 'translate-x-5' : 'translate-x-0']"
                />
              </button>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-medium text-gray-200">自动播放</h3>
                <p class="text-sm text-gray-400 mt-1">视频播放结束后自动播放下一个</p>
              </div>
              <button 
                @click="toggleSetting('autoPlayNext')"
                class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                :class="[modelValue.autoPlayNext ? 'bg-indigo-600' : 'bg-gray-600']"
              >
                <span class="sr-only">Toggle auto play</span>
                <span 
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  :class="[modelValue.autoPlayNext ? 'translate-x-5' : 'translate-x-0']"
                />
              </button>
            </div>
            
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-medium text-gray-200">封面获取位置</h3>
                <p class="text-sm text-gray-400 mt-1">设置视频封面的截取时间点</p>
              </div>
              <select 
                :value="modelValue.coverPosition || 'first_frame'"
                @change="e => updateSetting('coverPosition', e.target.value)"
                class="bg-gray-700 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 border-gray-600 placeholder-gray-400"
              >
                <option value="first_frame">第一帧 (默认)</option>
                <option value="percent_10">10%</option>
                <option value="percent_25">25%</option>
                <option value="percent_50">50%</option>
                <option value="second_1">第 1 秒</option>
                <option value="second_5">第 5 秒</option>
                <option value="second_10">第 10 秒</option>
              </select>
            </div>
            
            <!-- Future settings can be added here -->
            <div class="pt-4 border-t border-gray-700">
               <p class="text-xs text-gray-500 text-center">Video Waterfall Viewer v1.0</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'update:modelValue'])

const close = () => {
  emit('close')
}

const toggleSetting = (key) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: !props.modelValue[key]
  })
}

const updateSetting = (key, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  })
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .transform,
.modal-leave-active .transform {
  transition: all 0.2s ease-out;
}

.modal-enter-from .transform,
.modal-leave-to .transform {
  opacity: 0;
  transform: scale(0.95);
}
</style>
