<template>
  <LoadingScreen v-if="showLoading" />

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

  <HackerTerminal
    v-if="currentView === 'terminal'"
    @done="onTerminalDone"
  />

  <RetroDesktop
    v-if="currentView === 'computer'"
    @exit-computer="onExitComputer"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LoadingScreen   from './components/LoadingScreen.vue'
import ThreeScene      from './components/ThreeScene.vue'
import HackerTerminal  from './components/HackerTerminal.vue'
import RetroDesktop    from './components/RetroDesktop.vue'

const currentView   = ref('room')
const showLoading   = ref(true)
const hintHidden    = ref(false)
const threeSceneRef = ref(null)

onMounted(() => {
  setTimeout(() => { showLoading.value = false }, 3500)
})

function onEnterComputer() {
  if (currentView.value !== 'room') return
  hintHidden.value = true
  currentView.value = 'terminal'   // show hacker terminal first
}

function onTerminalDone() {
  currentView.value = 'computer'   // then launch the OS
}

function onExitComputer() {
  currentView.value = 'room'
  hintHidden.value = false
}
</script>
