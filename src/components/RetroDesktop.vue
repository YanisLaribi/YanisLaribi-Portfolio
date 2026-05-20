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
          @show-coming-soon="showAlert('Coming soon!', 'This feature is currently under development. Please check back later.')"
          @open-app="openWindow"
          @show-project="showProjectAlert"
        />
        <div class="window-body" v-else>
          <template v-if="win.id === 'about'">
            <AboutWindow />
          </template>
          <template v-else-if="win.id === 'contacts'">
            <ContactsWindow />
          </template>
          <template v-else-if="win.appType === 'notepad'">
            <NotepadWindow :projectData="win.projectData" />
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
      @show-project="showProjectAlert"
      @show-coming-soon="showAlert('Coming soon!', 'This feature is currently under development. Please check back later.')"
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
import { ref } from 'vue'
import DialogBox from './DialogBox.vue'
import StartMenu from './StartMenu.vue'
import Taskbar from './Taskbar.vue'
import FileExplorer from './FileExplorer.vue'
import AboutWindow from './windows/AboutWindow.vue'
import ContactsWindow from './windows/ContactsWindow.vue'
import NotepadWindow from './windows/NotepadWindow.vue'
import { desktopIcons, startMenuIcons } from '../config/desktopData'

import { useClock } from '../composables/useClock'
import { useDialog } from '../composables/useDialog'
import { useWindowManager } from '../composables/useWindowManager'
import { useDragResize } from '../composables/useDragResize'

const emit = defineEmits(['exit-computer'])

const isStartMenuOpen = ref(false)
const selectedIcon = ref(null)

const { time, date } = useClock()
const { dialog, showConfirm, showAlert, closeDialog } = useDialog()
const {
  windows,
  activeWindow,
  openWindow: baseOpenWindow,
  focusWindow,
  closeWindow,
  minimizeWindow,
  toggleMaximize,
  toggleTaskbarWindow,
  minimizeAllWindows,
  showProjectAlert: baseShowProjectAlert,
  windowStyle
} = useWindowManager((folder) => {
  isStartMenuOpen.value = false
  showAlert(folder, 'Coming soon!', 'This feature is currently under development. Please check back later.')
})

const { startDrag, startResize } = useDragResize(focusWindow)

function selectIcon(id) {
  selectedIcon.value = id
  isStartMenuOpen.value = false
}

function openWindow(icon) {
  isStartMenuOpen.value = false
  baseOpenWindow(icon)
}

function showProjectAlert(project) {
  isStartMenuOpen.value = false
  baseShowProjectAlert(project)
}

function toggleStartMenu() {
  isStartMenuOpen.value = !isStartMenuOpen.value
}

function closeStartMenu() {
  isStartMenuOpen.value = false
  selectedIcon.value = null
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
</script>

<style scoped>
.win7-os {
  position: absolute;
  inset: 0;
  background: url('/images/windows7_wallpaper.jpg') no-repeat center center;
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

.window-resize-handle {
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 12px;
  height: 12px;
  cursor: nwse-resize;
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
