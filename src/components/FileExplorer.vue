<template>
  <div class="file-explorer">
    <div class="fe-header">
      <div class="fe-nav-buttons">
        <button 
          class="fe-nav-btn back-btn" 
          :disabled="historyIndex === 0" 
          @click="handleBack"
          title="Back"
        ></button>
        <button 
          class="fe-nav-btn fwd-btn" 
          :disabled="historyIndex === history.length - 1" 
          @click="handleForward"
          title="Forward"
        ></button>
      </div>
      <div class="fe-address-bar">
        <img src="/images/icons/dossierLogo.png" class="fe-address-icon" />
        <div class="fe-breadcrumbs">
          <template v-for="(bc, idx) in breadcrumbs" :key="bc.id">
            <span class="fe-breadcrumb-item" @click="openFolder(bc.id)">{{ bc.name }}</span>
            <span v-if="idx < breadcrumbs.length - 1" class="fe-breadcrumb-separator">▶</span>
          </template>
        </div>
        <div class="fe-address-dropdown">▼</div>
      </div>
      <div class="fe-search-bar">
        <input type="text" :placeholder="'Search ' + currentFolder.name" v-model="searchQuery" />
        <div class="fe-search-icon">🔍</div>
      </div>
    </div>
    
    <div class="fe-toolbar">
      <div class="fe-tool-group">
        <button class="fe-tool-btn">Organize <span class="caret">▼</span></button>
      </div>
      <div class="fe-tool-group" v-if="selectedItem">
        <button class="fe-tool-btn" @click="handleDblClick(selectedItem)">Open</button>
      </div>
      <div class="fe-tool-group">
        <button class="fe-tool-btn">Share with <span class="caret">▼</span></button>
        <button class="fe-tool-btn">New folder</button>
      </div>
      <div class="fe-view-controls">
        <button class="fe-tool-btn">View <span class="caret">▼</span></button>
        <button class="fe-tool-btn">❓</button>
      </div>
    </div>
    
    <div class="fe-body">
      <div class="fe-sidebar">
        <div class="fe-sidebar-section">
          <div class="fe-sidebar-title">
            <span class="caret">▼</span> Favorites
          </div>
          <div class="fe-sidebar-item" :class="{active: currentFolderId === 'favorites'}" @click="openFolder('favorites')">
            <span class="fe-sidebar-icon">⭐</span> Favorites
          </div>
          <div class="fe-sidebar-item" :class="{active: currentFolderId === 'desktop'}" @click="openFolder('desktop')">
            <span class="fe-sidebar-icon">🖥️</span> Desktop
          </div>
        </div>
        
        <div class="fe-sidebar-section">
          <div class="fe-sidebar-title" :class="{active: currentFolderId === 'libraries'}" @click="openFolder('libraries')">
            <span class="caret">▼</span> Libraries
          </div>
          <div class="fe-sidebar-item" :class="{active: currentFolderId.startsWith('projects')}" @click="openFolder('projects')">
            <img src="/images/icons/dossierLogo.png" class="fe-sidebar-img" /> Projects
          </div>
          <div class="fe-sidebar-item" :class="{active: currentFolderId.startsWith('exp')}" @click="openFolder('experience')">
            <img src="/images/icons/dossierLogo.png" class="fe-sidebar-img" /> Experience
          </div>
          <div class="fe-sidebar-item" :class="{active: currentFolderId.startsWith('documents')}" @click="openFolder('documents')">
            <img src="/images/icons/dossierLogo.png" class="fe-sidebar-img" /> Documents
          </div>
          <div class="fe-sidebar-item" @click="$emit('show-coming-soon', 'Music')">
            <img src="/images/icons/music folder.png" class="fe-sidebar-img" /> Music
          </div>
          <div class="fe-sidebar-item" @click="$emit('show-coming-soon', 'Pictures')">
            <img src="/images/icons/dossierLogo.png" class="fe-sidebar-img" /> Pictures
          </div>
        </div>
        
        <div class="fe-sidebar-section">
          <div class="fe-sidebar-title">
            <span class="caret">▶</span> Computer
          </div>
          <div class="fe-sidebar-title">
            <span class="caret">▶</span> Network
          </div>
        </div>
      </div>
      
      <div class="fe-content" @click="selectedItem = null">
        <!-- Grouped view -->
        <template v-if="groupedItems.hasGroups && filteredItems.length > 0">
          <div v-for="(groupItems, groupName) in groupedItems.groups" :key="groupName" class="fe-group-section">
            <div class="fe-content-header">
              {{ groupName }} ({{ groupItems.length }})
              <div class="fe-content-line"></div>
            </div>
            <div class="fe-grid">
              <div 
                v-for="item in groupItems" 
                :key="item.name" 
                class="fe-item"
                :class="{ selected: selectedItem === item }"
                @click.stop="selectedItem = item"
                @dblclick.stop="handleDblClick(item)"
              >
                <img v-if="item.iconUrl" :src="item.iconUrl" class="fe-item-icon" />
                <div v-else class="fe-item-icon-text">{{ item.emoji || '📄' }}</div>
                <div class="fe-item-name" :class="{ 'fe-item-name-selected': selectedItem === item }">{{ item.name }}</div>
              </div>
            </div>
          </div>
        </template>
        
        <!-- Flat view -->
        <template v-else>
          <div class="fe-content-header" v-if="filteredItems.length > 0">
            Folder ({{ filteredItems.length }})
            <div class="fe-content-line"></div>
          </div>
          <div class="fe-content-header" v-else>
            No items match your search.
            <div class="fe-content-line"></div>
          </div>
          <div class="fe-grid">
            <div 
              v-for="item in filteredItems" 
              :key="item.name" 
              class="fe-item"
              :class="{ selected: selectedItem === item }"
              @click.stop="selectedItem = item"
              @dblclick.stop="handleDblClick(item)"
            >
              <img v-if="item.iconUrl" :src="item.iconUrl" class="fe-item-icon" />
              <div v-else class="fe-item-icon-text">{{ item.emoji || '📄' }}</div>
              <div class="fe-item-name" :class="{ 'fe-item-name-selected': selectedItem === item }">{{ item.name }}</div>
            </div>
          </div>
        </template>
      </div>
    </div>
    
    <div class="fe-footer">
      <div v-if="selectedItem" class="fe-footer-info">
        <img v-if="selectedItem.iconUrl" :src="selectedItem.iconUrl" class="fe-footer-icon" />
        <div v-else class="fe-footer-icon-text">{{ selectedItem.emoji || '📄' }}</div>
        <div class="fe-footer-details">
          <div class="fe-footer-name">{{ selectedItem.name }}</div>
          <div class="fe-footer-desc">{{ selectedItem.desc || 'File Folder' }}</div>
        </div>
      </div>
      <div v-else class="fe-footer-info">
        <div class="fe-footer-details">
          <div class="fe-footer-name">{{ filteredItems.length }} items</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { desktopIcons, getIconById, folders } from '../config/desktopData'

const props = defineProps({
  initialFolder: {
    type: String,
    default: 'projects'
  }
})

const emit = defineEmits(['show-coming-soon', 'open-app', 'show-project'])

const currentFolderId = ref(props.initialFolder)
const currentFolder = computed(() => folders[currentFolderId.value] || folders.libraries)
const selectedItem = ref(null)
const searchQuery = ref('')

// Navigation History (Back / Forward)
const history = ref([props.initialFolder])
const historyIndex = ref(0)

const breadcrumbs = computed(() => {
  if (!currentFolder.value || !currentFolder.value.path) return []
  return currentFolder.value.path.split(' ▸ ').map((name) => {
    let id = 'libraries'
    const lower = name.toLowerCase()
    if (lower === 'projects') id = 'projects'
    else if (lower === 'experience') id = 'experience'
    else if (lower === 'documents') id = 'documents'
    else if (lower === 'favorites') id = 'favorites'
    else if (lower === 'desktop') id = 'desktop'
    else if (lower === 'libraries') id = 'libraries'
    return { name, id }
  })
})

const filteredItems = computed(() => {
  if (!currentFolder.value || !currentFolder.value.items) return []
  if (!searchQuery.value) return currentFolder.value.items
  const q = searchQuery.value.toLowerCase()
  return currentFolder.value.items.filter(item => 
    item.name.toLowerCase().includes(q) || (item.desc && item.desc.toLowerCase().includes(q))
  )
})

const groupedItems = computed(() => {
  const groups = {}
  let hasGroups = false
  
  filteredItems.value.forEach(item => {
    if (item.group) hasGroups = true
    const groupName = item.group || 'Files'
    if (!groups[groupName]) {
      groups[groupName] = []
    }
    groups[groupName].push(item)
  })
  
  return { hasGroups, groups }
})

function openFolder(id, pushToHistory = true) {
  if (pushToHistory) {
    // Cut off any forward history when doing a new navigation
    history.value = history.value.slice(0, historyIndex.value + 1)
    history.value.push(id)
    historyIndex.value = history.value.length - 1
  }
  currentFolderId.value = id
  selectedItem.value = null
  searchQuery.value = ''
}

function handleBack() {
  if (historyIndex.value > 0) {
    historyIndex.value--
    openFolder(history.value[historyIndex.value], false)
  }
}

function handleForward() {
  if (historyIndex.value < history.value.length - 1) {
    historyIndex.value++
    openFolder(history.value[historyIndex.value], false)
  }
}

function handleDblClick(item) {
  if (item.type === 'folder') {
    openFolder(item.folderId)
  } else if (item.type === 'app') {
    emit('open-app', getIconById(item.appId))
  } else if (item.type === 'project' || item.type === 'experience') {
    emit('show-project', item)
  } else if (item.type === 'resume') {
    window.open('/resume/Resume-summer2026.pdf', '_blank')
  }
}

function showProject(name) {
  const proj = folders.projects.items.find(p => p.name === name)
  if (proj) {
    emit('show-project', proj)
  }
}
</script>

<style scoped>
.file-explorer {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #ffffff;
  font-family: "Segoe UI", Tahoma, sans-serif;
}

/* Header (Address bar and Search) */
.fe-header {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  background: #f0f0f0;
  border-bottom: 1px solid #d9d9d9;
  gap: 10px;
}

.fe-nav-buttons {
  display: flex;
  align-items: center;
  position: relative;
  margin-right: 5px;
}

.fe-nav-btn {
  border: 1px solid rgba(0, 0, 0, 0.35);
  background: linear-gradient(to bottom, #fcfcfc 0%, #e1e1e1 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 1px 2px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  outline: none;
  transition: all 0.15s ease-in-out;
}

.fe-nav-btn:hover:not(:disabled) {
  background: linear-gradient(to bottom, #eaf6fd 0%, #a7d9f5 100%);
  border-color: #3c7fb1;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), 0 0 4px rgba(82,168,236,0.6);
}

.fe-nav-btn:active:not(:disabled) {
  background: linear-gradient(to bottom, #cbdff2 0%, #7db5e3 100%);
  border-color: #2c628b;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);
}

.fe-nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f0f0f0;
  border-color: #d3d3d3;
  box-shadow: none;
}

.back-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 16px;
  z-index: 2;
  background: radial-gradient(circle at 50% 30%, #ffffff 0%, rgba(255, 255, 255, 0) 50%), 
              linear-gradient(to bottom, #d5e9f5 0%, #72a9cf 50%, #447fa9 51%, #5c97c1 100%);
  border-color: #3b688d;
  color: #fff;
  text-shadow: 0 -1px 0 rgba(0,0,0,0.3);
  box-shadow: 0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5);
}

.back-btn::after {
  content: '◀';
  font-size: 11px;
}

.back-btn:hover:not(:disabled) {
  background: radial-gradient(circle at 50% 30%, #ffffff 0%, rgba(255, 255, 255, 0) 50%), 
              linear-gradient(to bottom, #eaf6fd 0%, #85c2ed 50%, #4c9ee2 51%, #79c5fc 100%);
  border-color: #2b7bc0;
  box-shadow: 0 1px 4px rgba(0,102,204,0.4), inset 0 1px 0 rgba(255,255,255,0.6);
}

.back-btn:active:not(:disabled) {
  background: linear-gradient(to bottom, #3976a4 0%, #20507a 100%);
  border-color: #173d5f;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.4);
}

.back-btn:disabled {
  background: #f3f3f3;
  border-color: #d2d2d2;
  color: #a0a0a0;
  text-shadow: none;
  box-shadow: none;
}

.fwd-btn {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 12px;
  margin-left: -5px;
  z-index: 1;
  padding-left: 4px;
}

.fwd-btn::after {
  content: '▶';
  font-size: 8px;
}

.fe-address-bar {
  flex: 1;
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #b9b9b9;
  border-radius: 2px;
  padding: 2px 6px;
  height: 26px;
}

.fe-address-icon {
  width: 16px;
  height: 16px;
  margin-right: 6px;
  object-fit: contain;
}

.fe-breadcrumbs {
  flex: 1;
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #333;
  overflow: hidden;
  white-space: nowrap;
}

.fe-breadcrumb-item {
  padding: 1px 4px;
  border-radius: 2px;
  cursor: pointer;
  user-select: none;
}

.fe-breadcrumb-item:hover {
  background: #e5f3fb;
  color: #0066cc;
}

.fe-breadcrumb-separator {
  margin: 0 4px;
  font-size: 8px;
  color: #888;
  user-select: none;
}

.fe-address-dropdown {
  font-size: 10px;
  color: #666;
  padding-left: 5px;
  border-left: 1px solid #eee;
  cursor: pointer;
}

.fe-search-bar {
  width: 200px;
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #b9b9b9;
  border-radius: 2px;
  height: 26px;
  padding: 0 6px;
}

.fe-search-bar input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 12px;
  font-style: italic;
  color: #666;
}

.fe-search-icon {
  font-size: 12px;
  color: #888;
}

/* Toolbar */
.fe-toolbar {
  display: flex;
  align-items: center;
  padding: 4px 10px;
  background: #f5f6f7;
  border-bottom: 1px solid #e0e0e0;
  gap: 15px;
}

.fe-tool-group {
  display: flex;
  gap: 2px;
  border-right: 1px solid #d9d9d9;
  padding-right: 15px;
}

.fe-view-controls {
  margin-left: auto;
  display: flex;
  gap: 5px;
}

.fe-tool-btn {
  background: transparent;
  border: 1px solid transparent;
  color: #333;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.fe-tool-btn:hover {
  background: #e5f3fb;
  border-color: #70c0e7;
}

.caret {
  font-size: 8px;
  color: #666;
}

/* Body (Sidebar + Content) */
.fe-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.fe-sidebar {
  width: 200px;
  background: #f1f5fb;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
  padding: 10px 0;
}

.fe-sidebar-section {
  margin-bottom: 15px;
}

.fe-sidebar-title {
  font-size: 12px;
  font-weight: 600;
  color: #333;
  padding: 4px 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 2px;
}

.fe-sidebar-title:hover {
  color: #0066cc;
  background: #e5f3fb;
}

.fe-sidebar-title.active {
  background: #cce8ff;
  border-color: #99d1ff;
  font-weight: 600;
}

.fe-sidebar-item {
  font-size: 12px;
  color: #333;
  padding: 4px 10px 4px 25px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 2px;
}

.fe-sidebar-item:hover {
  background: #e5f3fb;
}

.fe-sidebar-item.active {
  background: #cce8ff;
  border-color: #99d1ff;
  font-weight: 600;
}

.fe-sidebar-icon {
  font-size: 14px;
}

.fe-sidebar-img {
  width: 14px;
  height: 14px;
  object-fit: contain;
}

.fe-content {
  flex: 1;
  background: #fff;
  overflow-y: auto;
  padding: 15px;
}

.fe-group-section {
  margin-bottom: 25px;
}

.fe-content-header {
  font-size: 12px;
  color: #666;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.fe-content-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, #e0e0e0, transparent);
}

.fe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 15px;
}

.fe-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
  border: 1px solid transparent;
  border-radius: 3px;
  cursor: pointer;
}

.fe-item:hover {
  background: #e5f3fb;
  border-color: #d9ebf9;
}

.fe-item.selected {
  background: #cce8ff;
  border-color: #99d1ff;
}

.fe-item-icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
  margin-bottom: 5px;
}

.fe-item-icon-text {
  font-size: 40px;
  margin-bottom: 5px;
}

.fe-item-name {
  font-size: 12px;
  color: #000;
  text-align: center;
  word-wrap: break-word;
  max-width: 100%;
}

.fe-item-name-selected {
  background: #0066cc;
  color: #fff;
  padding: 0 2px;
}

/* Footer (Details pane) */
.fe-footer {
  height: 45px;
  background: #f0f4f9;
  border-top: 1px solid #d9d9d9;
  display: flex;
  align-items: center;
  padding: 0 15px;
}

.fe-footer-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.fe-footer-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.fe-footer-icon-text {
  font-size: 24px;
}

.fe-footer-details {
  display: flex;
  flex-direction: column;
}

.fe-footer-name {
  font-size: 12px;
  color: #333;
  font-weight: 600;
}

.fe-footer-desc {
  font-size: 11px;
  color: #666;
}
</style>
