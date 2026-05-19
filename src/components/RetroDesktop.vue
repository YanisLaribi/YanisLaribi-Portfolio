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
        <FileExplorer 
          v-if="['projects', 'files-explorer', 'experience'].includes(win.id)"
          :initialFolder="win.id === 'files-explorer' ? 'desktop' : win.id"
          @show-coming-soon="showComingSoon"
          @open-app="openWindow"
          @show-project="showProjectAlert"
        />
        <div class="window-body" v-else>
          <template v-if="win.id === 'about'">
            <div class="about-app">
              <div class="about-header">
                <img src="/user.png" class="about-avatar" />
                <div class="about-title">
                  <h2>Yanis Laribi</h2>
                  <p class="about-subtitle">Software Engineering Student • Université Laval</p>
                </div>
              </div>
              <div class="about-body">
                <p class="about-paragraph first-letter">I grew up in Algeria and came to Canada when I was six. One bedroom for three people, no table to eat at, and a country where the language was a mystery to my eyes. But my father had kept his laptop from Algeria, and that changed everything. Every free moment I had, I was in front of that screen. I didn’t know it then, but that’s where my obsession with technology quietly took root.</p>

                <p class="about-paragraph">Little after, in high school, a teacher introduced me to Scratch. The moment I moved that cartoon cat across the screen, something clicked. I remember thinking: <em>That I was limitless, and I could do anything (yes at 12 years old a simple cartoon cat made me feel that)</em> <span class="about-sidenote">(Data structures, algorithms, statistics and probabilities were still somewhere over the horizon... they’d show up soon enough.)</span></p>

                <p class="about-paragraph">That conviction never left me. When it came time to choose a path, Software Engineering was the only natural answer. Since then, I’ve been pushing myself forward with an unlimited curiosity and a perseverance that was forged long before university...</p>

                <p class="about-paragraph">Outside of code, I lift weights, play sports, and travel whenever I can. The gym keeps me sane. Travelling keeps me humble. And sports remind me that losing is fine, as long as you show up again the next day. Which, honestly, applies to programming too.</p>

                <p class="about-paragraph">Anyway, I hope you know me a little better now. Feel free to reach out, I don't bite.</p>

              </div>
            </div>
          </template>
          <template v-else-if="win.id === 'contacts'">
            <div class="contacts-app">
              <div class="contacts-header">
                <img src="/ContactIcone.webp" class="contacts-header-icon" />
                <div class="contacts-header-text">
                  <h2>Contact Yanis</h2>
                  <p>Let's get in touch!</p>
                </div>
              </div>
              <div class="contacts-body">
                <div class="contacts-info">
                  <div class="contact-item"><strong>Email:</strong> yanis.laribi.1@ulaval.ca</div>
                  <div class="contact-item"><strong>Phone:</strong> 418-264-7838</div>
                  <div class="contact-item"><strong>LinkedIn:</strong> linkedin.com/in/yanislaribi</div>
                  <div class="contact-item"><strong>GitHub:</strong> github.com/YanisLaribi</div>
                </div>
                <form class="contacts-form" @submit.prevent="sendMail">
                  <h3>Send an Email</h3>
                  <div class="form-group">
                    <label>Subject:</label>
                    <input type="text" v-model="mailSubject" class="win7-input" placeholder="Enter subject..." required />
                  </div>
                  <div class="form-group">
                    <label>Message:</label>
                    <textarea v-model="mailBody" class="win7-textarea" placeholder="Type your message here..." required></textarea>
                  </div>
                  <button type="submit" class="win7-button send-btn">Send Email via Default Client</button>
                </form>
              </div>
            </div>
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
      :icons="startMenuIcons"
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
import FileExplorer from './FileExplorer.vue'
import { desktopIcons, startMenuIcons, getIconById } from '../config/desktopData'

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
  if (icon.id === 'resume') {
    window.open('/Resume-summer2026 (1).pdf', '_blank')
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
    width: ['projects', 'files-explorer', 'experience'].includes(icon.id) ? 800 : 600,
    height: ['projects', 'files-explorer', 'experience'].includes(icon.id) ? 550 : 400,
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

const mailSubject = ref('')
const mailBody = ref('')

function sendMail() {
  window.open(`mailto:yanis.laribi.1@ulaval.ca?subject=${encodeURIComponent(mailSubject.value)}&body=${encodeURIComponent(mailBody.value)}`, '_blank')
}

function showComingSoon(folder) {
  isStartMenuOpen.value = false
  showAlert(
    folder,
    'Coming soon!',
    'This feature is currently under development. Please check back later.'
  )
}

function showProjectAlert(project) {
  showAlert(
    project.name,
    'Project Details',
    project.desc
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

/* About App Styles */
.about-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: "Segoe UI", Tahoma, sans-serif;
  margin: -20px;
  background: #f8f9fa;
}

.about-header {
  display: flex;
  align-items: center;
  padding: 20px;
  background: linear-gradient(to bottom, #ffffff, #e1eaf5);
  border-bottom: 1px solid #99b4d1;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  position: relative;
  overflow: hidden;
}

.about-header::after {
  content: '';
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.2) 100%);
  pointer-events: none;
}

.about-avatar {
  width: 64px;
  height: 64px;
  border-radius: 4px;
  border: 1px solid #b9cce3;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  margin-right: 20px;
  background: #fff;
  padding: 4px;
  object-fit: contain;
}

.about-title h2 {
  margin: 0 !important;
  color: #003399 !important;
  font-size: 24px !important;
  font-weight: 600;
  text-shadow: 1px 1px 0px #fff;
  border: none !important;
  padding-bottom: 0 !important;
}

.about-subtitle {
  margin: 2px 0 4px 0;
  color: #555;
  font-size: 13px;
  font-weight: 500;
}

.about-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 6px;
}

.about-tag {
  background: #dce8f5;
  border: 1px solid #b0cde8;
  color: #1a4273;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.about-body {
  padding: 25px 30px;
  flex: 1;
  overflow-y: auto;
  background: #fff;
  line-height: 1.7;
  color: #2b2b2b;
}

.about-paragraph {
  margin-bottom: 20px;
  font-size: 14px;
  text-align: justify;
}

.about-paragraph.first-letter::first-letter {
  font-size: 42px;
  font-weight: bold;
  color: #003399;
  float: left;
  line-height: 0.8;
  margin-right: 8px;
  margin-top: 4px;
  font-family: "Georgia", serif;
}

.about-sidenote {
  color: #666;
  font-style: italic;
  font-size: 13px;
}

.about-quote {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  border-left: 4px solid #003399;
  margin: 20px 0;
  background: #f4f8fc;
  padding: 14px 18px;
  border-radius: 0 4px 4px 0;
}

.about-quote-mark {
  font-size: 48px;
  line-height: 1;
  color: #003399;
  opacity: 0.3;
  font-family: "Georgia", serif;
  margin-top: -10px;
  flex-shrink: 0;
}

.about-quote-text {
  font-style: italic;
  color: #1a4273;
  font-size: 14px;
  line-height: 1.7;
}

.about-skills {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #e5e5e5;
}

.about-skill-title {
  font-size: 12px;
  font-weight: 600;
  color: #444;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.about-skill-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.about-skill-pill {
  background: linear-gradient(to bottom, #f5f5f5, #e8e8e8);
  border: 1px solid #c5c5c5;
  border-radius: 12px;
  padding: 4px 12px;
  font-size: 12px;
  color: #333;
  cursor: default;
  transition: all 0.15s;
}

.about-skill-pill:hover {
  background: linear-gradient(to bottom, #eaf6fd, #bee6fd);
  border-color: #3c7fb1;
  color: #003399;
}

/* Contacts App Styles */
.contacts-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: "Segoe UI", Tahoma, sans-serif;
  margin: -20px; /* offset the default .window-body padding */
}

.contacts-header {
  display: flex;
  align-items: center;
  background: linear-gradient(to bottom, #f9f9f9, #e0e0e0);
  padding: 15px;
  border-bottom: 1px solid #ccc;
}

.contacts-header-icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
  margin-right: 15px;
}

.contacts-header-text h2 {
  margin: 0 !important;
  color: #003399;
  font-size: 18px;
  border: none !important;
  padding-bottom: 0 !important;
}

.contacts-header-text p {
  margin: 0;
  color: #666;
  font-size: 12px;
}

.contacts-body {
  padding: 15px;
  flex: 1;
  overflow-y: auto;
  background: #fff;
}

.contacts-info {
  background: #f0f4f9;
  border: 1px solid #d9d9d9;
  border-radius: 3px;
  padding: 10px;
  margin-bottom: 15px;
}

.contact-item {
  font-size: 13px;
  color: #333;
  margin-bottom: 5px;
}

.contacts-form h3 {
  color: #003399;
  font-size: 14px;
  margin-top: 0;
  margin-bottom: 10px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 5px;
}

.form-group {
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 12px;
  color: #333;
  margin-bottom: 3px;
}

.win7-input, .win7-textarea {
  border: 1px solid #abadb3;
  border-radius: 2px;
  padding: 4px 6px;
  font-family: "Segoe UI", Tahoma, sans-serif;
  font-size: 13px;
  outline: none;
}

.win7-input:focus, .win7-textarea:focus {
  border-color: #569de5;
}

.win7-textarea {
  resize: vertical;
  min-height: 80px;
}

.win7-button {
  background: linear-gradient(to bottom, #f2f2f2 0%, #ebebeb 50%, #dddddd 51%, #cfcfcf 100%);
  border: 1px solid #707070;
  border-radius: 3px;
  padding: 4px 15px;
  font-family: "Segoe UI", Tahoma, sans-serif;
  font-size: 12px;
  color: #000;
  cursor: pointer;
  display: inline-block;
}

.win7-button:hover {
  background: linear-gradient(to bottom, #eaf6fd 0%, #d9f0fc 50%, #bee6fd 51%, #a7d9f5 100%);
  border-color: #3c7fb1;
}

.win7-button:active {
  background: linear-gradient(to bottom, #e5f4fc 0%, #c4e5fa 50%, #98d1ef 51%, #68b3db 100%);
  border-color: #2c628b;
}

.send-btn {
  margin-top: 5px;
}

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
