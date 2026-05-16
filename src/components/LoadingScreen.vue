<template>
  <div class="loading-screen" :class="{ 'fade-out': fadeOut }">
    <div class="welcome-text">WELCOME</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const fadeOut = ref(false)

onMounted(() => {
  // Start fade after 3000ms, fully gone at 3500ms (matches App.vue timer)
  setTimeout(() => { fadeOut.value = true }, 3000)
})
</script>
