import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useClock() {
  const time = ref('')
  const date = ref('')
  let clockInterval = null

  function updateClock() {
    const now = new Date()
    time.value = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    date.value = now.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
  }

  onMounted(() => {
    updateClock()
    clockInterval = setInterval(updateClock, 1000)
  })

  onBeforeUnmount(() => {
    clearInterval(clockInterval)
  })

  return { time, date }
}
