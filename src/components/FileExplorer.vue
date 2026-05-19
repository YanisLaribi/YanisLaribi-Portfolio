<template>
  <div class="file-explorer">
    <div class="fe-header">
      <div class="fe-nav-buttons">
        <button class="fe-nav-btn back-btn" disabled></button>
        <button class="fe-nav-btn fwd-btn" disabled></button>
      </div>
      <div class="fe-address-bar">
        <img src="/dossierLogo.png" class="fe-address-icon" />
        <div class="fe-address-path">{{ currentFolder.path }}</div>
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
        <button class="fe-tool-btn">Open</button>
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
          <div class="fe-sidebar-item" :class="{active: currentFolder.id === 'favorites'}" @click="openFolder('favorites')">
            <span class="fe-sidebar-icon">⭐</span> Favorites
          </div>
          <div class="fe-sidebar-item" :class="{active: currentFolder.id === 'desktop'}" @click="openFolder('desktop')">
            <span class="fe-sidebar-icon">🖥️</span> Desktop
          </div>
        </div>
        
        <div class="fe-sidebar-section">
          <div class="fe-sidebar-title">
            <span class="caret">▼</span> Libraries
          </div>
          <div class="fe-sidebar-item" :class="{active: currentFolder.id === 'projects'}" @click="openFolder('projects')">
            <img src="/dossierLogo.png" class="fe-sidebar-img" /> Projects
          </div>
          <div class="fe-sidebar-item" :class="{active: currentFolder.id === 'experience'}" @click="openFolder('experience')">
            <img src="/dossierLogo.png" class="fe-sidebar-img" /> Experience
          </div>
          <div class="fe-sidebar-item" :class="{active: currentFolder.id === 'documents'}" @click="openFolder('documents')">
            <img src="/dossierLogo.png" class="fe-sidebar-img" /> Documents
          </div>
          <div class="fe-sidebar-item" @click="$emit('show-coming-soon', 'Music')">
            <img src="/music folder.png" class="fe-sidebar-img" /> Music
          </div>
          <div class="fe-sidebar-item" @click="$emit('show-coming-soon', 'Pictures')">
            <img src="/dossierLogo.png" class="fe-sidebar-img" /> Pictures
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
const currentFolder = computed(() => folders[currentFolderId.value])
const selectedItem = ref(null)
const searchQuery = ref('')

const filteredItems = computed(() => {
  if (!searchQuery.value) return currentFolder.value.items
  const q = searchQuery.value.toLowerCase()
  return currentFolder.value.items.filter(item => 
    item.name.toLowerCase().includes(q) || (item.desc && item.desc.toLowerCase().includes(q))
  )
})

function openFolder(id) {
  currentFolderId.value = id
  selectedItem.value = null
  searchQuery.value = ''
}

function handleDblClick(item) {
  if (item.type === 'app') {
    emit('open-app', getIconById(item.appId))
  } else if (item.type === 'project' || item.type === 'experience') {
    emit('show-project', item)
  } else if (item.type === 'resume') {
    window.open('/Resume-summer2026 (1).pdf', '_blank')
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
  gap: 2px;
}

.fe-nav-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #ccc;
  background: #e4e4e4;
  color: #888;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: not-allowed;
}

.fe-nav-btn.back-btn::after {
  content: '←';
}

.fe-nav-btn.fwd-btn::after {
  content: '→';
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

.fe-address-path {
  flex: 1;
  font-size: 12px;
  color: #333;
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
}

.fe-sidebar-title:hover {
  color: #0066cc;
}

.fe-sidebar-item {
  font-size: 12px;
  color: #333;
  padding: 4px 10px 4px 25px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.fe-sidebar-item:hover {
  background: #e5f3fb;
}

.fe-sidebar-item.active {
  background: #cce8ff;
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
