<template>
  <div class="loading-screen" :class="{ 'fade-out': fadeOut }">
    <div class="loading-logo">Yanis Laribi</div>
    <div class="loading-bar-container">
      <div class="loading-bar" :style="{ width: progress + '%' }"></div>
    </div>
    <div class="loading-text">Loading experience...</div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  progress: { type: Number, default: 0 }
})

const emit = defineEmits(['done'])
const fadeOut = ref(false)

watch(() => props.progress, (val) => {
  if (val >= 100) {
    setTimeout(() => {
      fadeOut.value = true
      setTimeout(() => emit('done'), 900)
    }, 500)
  }
})
</script>
