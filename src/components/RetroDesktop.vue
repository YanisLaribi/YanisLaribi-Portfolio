<template>
  <div class="win7-os" @click="closeStartMenu">
    <!-- Desktop Area -->
    <div class="desktop-area">
      <div class="desktop-icons">
        <div 
          v-for="icon in desktopIcons" 
          :key="icon.id" 
          class="desktop-icon" 
          @dblclick="openWindow(icon)"
          @click.stop="selectIcon(icon.id)"
          :class="{ selected: selectedIcon === icon.id }"
        >
          <img v-if="icon.iconUrl" :src="icon.iconUrl" class="icon-img" />
          <div v-else class="icon-image">{{ icon.emoji }}</div>
          <div class="icon-label">{{ icon.title }}</div>
        </div>
        
      </div>
    </div>

    <!-- Windows -->
    <div 
      v-for="win in windows" 
      :key="win.id" 
      class="window aero-glass"
      v-show="!win.minimized"
      :class="{ active: activeWindow === win.id, maximized: win.maximized }"
      :style="windowStyle(win)"
      @mousedown="focusWindow(win.id)"
    >
      <div class="window-titlebar" @mousedown="startDrag($event, win)" @dblclick="toggleMaximize(win)">
        <div class="titlebar-icon">
          <img v-if="win.iconUrl" :src="win.iconUrl" class="titlebar-img" />
          <span v-else>{{ win.emoji }}</span>
        </div>
        <div class="titlebar-text">{{ win.title }}</div>
        <div class="titlebar-controls">
          <button class="win-btn minimize" @click.stop="minimizeWindow(win)"></button>
          <button class="win-btn maximize" @click.stop="toggleMaximize(win)"></button>
          <button class="win-btn close" @click.stop="closeWindow(win.id)"></button>
        </div>
      </div>
      <div class="window-content-area">
        <div class="window-body">
          <template v-if="win.id === 'about'">
            <h2>About Me</h2>
            <p>Hi, I'm Yanis Laribi, a Software Engineering Student.</p>
            <p>I have a passion for web development, 3D graphics, machine learning, and cybersecurity.</p>
          </template>
          <template v-else-if="win.id === 'projects'">
            <h2>My Projects</h2>
            <ul>
              <li><b>BatiBloc:</b> Construction simulation with 2D/3D visualization.</li>
              <li><b>Medical Case Simulator:</b> 3-tier web app for clinical simulations.</li>
              <li><b>CANLock:</b> AI anomaly detection on CAN bus vehicular networks.</li>
              <li><b>Web Automation Agent:</b> Autonomous agent bypassing anti-bot mechanisms.</li>
            </ul>
          </template>
          <template v-else-if="win.id === 'experience'">
            <h2>Experience</h2>
            <p><b>Data Science Intern</b> — Federal Government of Canada (ECCC) <br><i>May–Aug 2026</i></p>
            <p><b>Researcher</b> — SGD Beyond (ML Club) <br><i>2025–2026</i></p>
          </template>
          <template v-else-if="win.id === 'contacts'">
            <h2>Contact Information</h2>
            <p><b>Email:</b> yanis.laribi.1@ulaval.ca</p>
            <p><b>Phone:</b> 418-264-7838</p>
            <p><b>LinkedIn:</b> linkedin.com/in/yanislaribi</p>
            <p><b>GitHub:</b> github.com/YanisLaribi</p>
          </template>
          <template v-else-if="win.id === 'resume'">
            <h2>Resume</h2>
            <p>Click below to download my resume.</p>
            <a href="#" class="download-btn" @click.prevent="downloadResume">Download CV</a>
          </template>
        </div>
      </div>
      <div class="window-resize-handle" @mousedown.prevent.stop="startResize($event, win)"></div>
    </div>

    <!-- Dialog Box -->
    <DialogBox :dialog="dialog" @close="closeDialog" />

    <!-- Start Menu -->
    <StartMenu 
      :isOpen="isStartMenuOpen" 
      :icons="desktopIcons"
      @open-app="openWindow"
      @show-coming-soon="showComingSoon"
      @shutdown="handleShutdown"
    />

    <!-- Taskbar -->
    <Taskbar
      :windows="windows"
      :activeWindow="activeWindow"
      :isStartMenuOpen="isStartMenuOpen"
      :time="time"
      :date="date"
      @toggle-start-menu="toggleStartMenu"
      @toggle-taskbar-window="toggleTaskbarWindow"
      @minimize-all="minimizeAllWindows"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import DialogBox from './DialogBox.vue'
import StartMenu from './StartMenu.vue'
import Taskbar from './Taskbar.vue'
import { desktopIcons } from '../config/desktopData'

const emit = defineEmits(['exit-computer'])

const time = ref('')
const date = ref('')
let clockInterval = null

const isStartMenuOpen = ref(false)
const selectedIcon = ref(null)

const windows = ref([])
const activeWindow = ref(null)
let zIndexCounter = 10

function updateClock() {
  const now = new Date()
  time.value = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  date.value = now.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
}

onMounted(() => {
  updateClock()
  clockInterval = setInterval(updateClock, 1000)
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
  window.addEventListener('mousemove', onResize)
  window.addEventListener('mouseup', stopResize)
})

onBeforeUnmount(() => {
  clearInterval(clockInterval)
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('mousemove', onResize)
  window.removeEventListener('mouseup', stopResize)
})

function selectIcon(id) {
  selectedIcon.value = id
  isStartMenuOpen.value = false
}

function openWindow(icon) {
  isStartMenuOpen.value = false
  if (icon.id === 'music') {
    return showComingSoon('Music')
  }
  if (icon.id === 'linkedin') {
    window.open('https://linkedin.com/in/yanislaribi', '_blank')
    return
  }
  const existing = windows.value.find(w => w.id === icon.id)
  if (existing) {
    existing.minimized = false
    focusWindow(icon.id)
    return
  }
  
  const offset = windows.value.length * 30
  windows.value.push({
    id: icon.id,
    title: icon.title,
    emoji: icon.emoji,
    iconUrl: icon.iconUrl,
    x: 100 + offset,
    y: 100 + offset,
    width: 600,
    height: 400,
    minimized: false,
    maximized: false,
    zIndex: ++zIndexCounter
  })
  activeWindow.value = icon.id
}

function focusWindow(id) {
  const win = windows.value.find(w => w.id === id)
  if (win) {
    win.zIndex = ++zIndexCounter
    activeWindow.value = id
  }
}

function closeWindow(id) {
  windows.value = windows.value.filter(w => w.id !== id)
  if (activeWindow.value === id) {
    activeWindow.value = windows.value.length > 0 ? windows.value[windows.value.length - 1].id : null
  }
}

function minimizeWindow(win) {
  win.minimized = true
  activeWindow.value = null
}

function toggleMaximize(win) {
  win.maximized = !win.maximized
  focusWindow(win.id)
}

function toggleTaskbarWindow(win) {
  if (win.minimized) {
    win.minimized = false
    focusWindow(win.id)
  } else if (activeWindow.value === win.id) {
    win.minimized = true
    activeWindow.value = null
  } else {
    focusWindow(win.id)
  }
}

function minimizeAllWindows() {
  windows.value.forEach(w => w.minimized = true)
  activeWindow.value = null
}

function toggleStartMenu() {
  isStartMenuOpen.value = !isStartMenuOpen.value
}

function closeStartMenu() {
  isStartMenuOpen.value = false
  selectedIcon.value = null
}

const dialog = ref({
  show: false,
  type: 'alert',
  title: '',
  mainText: '',
  subText: '',
  onConfirm: null
})

function showConfirm(title, mainText, subText, onConfirm) {
  dialog.value = { show: true, type: 'confirm', title, mainText, subText, onConfirm }
}

function showAlert(title, mainText, subText) {
  dialog.value = { show: true, type: 'alert', title, mainText, subText, onConfirm: null }
}

function closeDialog(confirmed) {
  dialog.value.show = false
  if (confirmed && dialog.value.onConfirm) {
    dialog.value.onConfirm()
  }
}

function handleShutdown() {
  isStartMenuOpen.value = false
  showConfirm(
    'Shut down',
    'Warning: This will shut down the computer.',
    'Are you sure you want to proceed? Any unsaved work will be lost.',
    () => {
      showAlert(
        'System Message',
        'Just kidding',
        'It does absolutely nothing but I respect the courage.'
      )
    }
  )
}

function showComingSoon(folder) {
  isStartMenuOpen.value = false
  showAlert(
    folder,
    'Coming soon!',
    'This feature is currently under development. Please check back later.'
  )
}

function downloadResume() {
  showAlert(
    'Download',
    'CV Download Started',
    'This is a simulation. In a real scenario, the file would download now.'
  )
}

function windowStyle(win) {
  if (win.maximized) {
    return {
      top: '0px',
      left: '0px',
      width: '100%',
      height: 'calc(100% - 40px)',
      zIndex: win.zIndex
    }
  }
  return {
    top: `${win.y}px`,
    left: `${win.x}px`,
    width: `${win.width}px`,
    height: `${win.height}px`,
    zIndex: win.zIndex
  }
}

// Drag logic
let draggingWindow = null
let dragOffsetX = 0
let dragOffsetY = 0

function startDrag(e, win) {
  if (win.maximized) return
  focusWindow(win.id)
  draggingWindow = win
  dragOffsetX = e.clientX - win.x
  dragOffsetY = e.clientY - win.y
}

function onDrag(e) {
  if (!draggingWindow) return
  draggingWindow.x = e.clientX - dragOffsetX
  draggingWindow.y = e.clientY - dragOffsetY
}

function stopDrag() {
  draggingWindow = null
}

// Resize logic
let resizingWindow = null
let resizeStartX = 0
let resizeStartY = 0
let resizeStartWidth = 0
let resizeStartHeight = 0

function startResize(e, win) {
  if (win.maximized) return
  focusWindow(win.id)
  resizingWindow = win
  resizeStartX = e.clientX
  resizeStartY = e.clientY
  resizeStartWidth = win.width
  resizeStartHeight = win.height
}

function onResize(e) {
  if (!resizingWindow) return
  resizingWindow.width = Math.max(300, resizeStartWidth + (e.clientX - resizeStartX))
  resizingWindow.height = Math.max(200, resizeStartHeight + (e.clientY - resizeStartY))
}

function stopResize() {
  resizingWindow = null
}
</script>

<style scoped>
.win7-os {
  position: absolute;
  inset: 0;
  /* Classic Win 7 blue background style */
  background: url('/windows7_wallpaper.jpg') no-repeat center center;
  background-size: cover;
  background-color: #166fb9;
  font-family: "Segoe UI", Tahoma, sans-serif;
  overflow: hidden;
  user-select: none;
}

.aero-glass {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border-radius: 8px;
}

/* Desktop Icons */
.desktop-area {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 40px;
  right: 0;
  padding: 10px;
}

.desktop-icons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: fit-content;
}

.desktop-icon {
  width: 74px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid transparent;
}

.desktop-icon:hover {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.desktop-icon.selected {
  background: rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.icon-image {
  font-size: 32px;
  margin-bottom: 5px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

.icon-label {
  color: white;
  text-shadow: 0 1px 2px black, 0 1px 4px black;
  font-size: 12px;
  text-align: center;
  word-wrap: break-word;
}

/* Window */
.window {
  position: absolute;
  display: flex;
  flex-direction: column;
  min-width: 300px;
  min-height: 200px;
}

.window.maximized {
  border-radius: 0;
}

.window-titlebar {
  height: 30px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  cursor: default;
}

.titlebar-icon {
  font-size: 14px;
  margin-right: 8px;
}

.titlebar-text {
  flex: 1;
  font-weight: 600;
  color: #111;
  text-shadow: 0 0 5px rgba(255,255,255,0.8);
  font-size: 13px;
}

.titlebar-controls {
  display: flex;
  gap: 2px;
}

.win-btn {
  width: 26px;
  height: 20px;
  border: 1px solid rgba(0,0,0,0.2);
  border-radius: 3px;
  background: rgba(255,255,255,0.5);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
  position: relative;
  cursor: pointer;
}

.win-btn:hover {
  background: rgba(255,255,255,0.8);
}

.win-btn.close:hover {
  background: #e81123;
  color: white;
}

.win-btn.minimize::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 7px;
  width: 10px;
  height: 2px;
  background: black;
}

.win-btn.maximize::after {
  content: '';
  position: absolute;
  top: 4px;
  left: 6px;
  width: 10px;
  height: 8px;
  border: 2px solid black;
}

.win-btn.close::after, .win-btn.close::before {
  content: '';
  position: absolute;
  top: 9px;
  left: 6px;
  width: 12px;
  height: 2px;
  background: black;
  transform-origin: center;
}

.win-btn.close::after { transform: rotate(45deg); }
.win-btn.close::before { transform: rotate(-45deg); }
.win-btn.close:hover::after, .win-btn.close:hover::before { background: white; }

.window-content-area {
  flex: 1;
  background: #fff;
  border: 1px solid #999;
  margin: 0 4px 4px 4px;
  border-radius: 0 0 4px 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.window.maximized .window-content-area {
  margin: 0;
  border-radius: 0;
  border: none;
}

.window-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  color: #333;
  font-size: 14px;
  line-height: 1.5;
}

.window-body h2 {
  margin-top: 0;
  color: #003399;
  border-bottom: 1px solid #ccc;
  padding-bottom: 5px;
}

.download-btn {
  display: inline-block;
  margin-top: 10px;
  padding: 8px 16px;
  background: #166fb9;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
}

.download-btn:hover {
  background: #11538a;
}

.window-resize-handle {
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 12px;
  height: 12px;
  cursor: nwse-resize;
}

/* Sub-component styles removed */

.icon-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  margin-bottom: 5px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

.titlebar-img {
  width: 16px;
  height: 16px;
  object-fit: contain;
  margin-right: 8px;
}

.taskbar-img {
  width: 16px;
  height: 16px;
  object-fit: contain;
  margin-right: 5px;
}

.sm-img {
  width: 24px;
  height: 24px;
  object-fit: contain;
  margin-right: 10px;
}

.user-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 2px;
}
</style>
