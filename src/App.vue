<template>
  <LoadingScreen
    v-if="showLoading"
    :progress="loadingProgress"
    @done="onLoadingDone"
  />

  <ThreeScene
    ref="threeSceneRef"
    :active="currentView === 'room'"
    @enter-computer="onEnterComputer"
  />

  <div
    v-if="currentView === 'room' && !showLoading"
    class="interaction-hint"
    :class="{ hidden: hintHidden }"
  >
    <span>Click on the computer to enter</span>
  </div>

  <RetroDesktop
    v-if="currentView === 'computer'"
    @exit-computer="onExitComputer"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LoadingScreen from './components/LoadingScreen.vue'
import ThreeScene from './components/ThreeScene.vue'
import RetroDesktop from './components/RetroDesktop.vue'

const currentView = ref('room')
const showLoading = ref(true)
const loadingProgress = ref(0)
const hintHidden = ref(false)
const threeSceneRef = ref(null)

onMounted(() => {
  const interval = setInterval(() => {
    loadingProgress.value += Math.random() * 15
    if (loadingProgress.value >= 100) {
      loadingProgress.value = 100
      clearInterval(interval)
    }
  }, 200)
})

function onLoadingDone() {
  showLoading.value = false
}

function onEnterComputer() {
  if (currentView.value !== 'room') return
  hintHidden.value = true
  currentView.value = 'computer'
}

function onExitComputer() {
  currentView.value = 'room'
  hintHidden.value = false
}
</script>
