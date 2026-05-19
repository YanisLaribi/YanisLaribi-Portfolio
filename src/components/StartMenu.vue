<template>
  <transition name="fade-slide">
    <div v-if="isOpen" class="start-menu aero-glass" @click.stop>
      <div class="start-menu-left">
        <div 
          v-for="res in displayResults" 
          :key="'sm-'+res.title" 
          class="start-menu-item"
          @click="handleResultClick(res)"
        >
          <img v-if="res.iconUrl" :src="res.iconUrl" class="sm-img" />
          <span v-else class="sm-icon">{{ res.emoji }}</span>
          <div class="sm-details">
            <span class="sm-text">{{ res.title }}</span>
            <span class="sm-subtext" v-if="res.desc">{{ res.desc }}</span>
          </div>
        </div>
        <div class="start-search">
          <input type="text" placeholder="Search programs and files" v-model="searchQuery" />
        </div>
      </div>
      <div class="start-menu-right">
        <div class="user-profile">
          <div class="user-avatar"><img src="/flower image loading screen windows 7.jpg" class="user-avatar-img" /></div>
          <div class="user-name">Visitor</div>
        </div>
        <div class="right-links">
          <div class="right-link" @click="$emit('open-app', { id: 'files-explorer', title: 'Files Explorer', iconUrl: '/dossierLogo.png' })">Documents</div>
          <div class="right-link" @click="$emit('show-coming-soon', 'Pictures')">Pictures</div>
          <hr>
          <div class="right-link" @click="$emit('shutdown')">Shut down</div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { searchAll } from '../config/desktopData'

const props = defineProps({
  isOpen: Boolean,
  icons: Array
})

const emit = defineEmits(['open-app', 'show-project', 'show-coming-soon', 'shutdown'])

const searchQuery = ref('')

const displayResults = computed(() => {
  if (!searchQuery.value) {
    return props.icons.map(icon => ({
      title: icon.title,
      iconUrl: icon.iconUrl,
      emoji: icon.emoji,
      type: 'app',
      originalApp: icon
    }))
  }
  return searchAll(searchQuery.value)
})

function handleResultClick(res) {
  if (res.type === 'app') {
    emit('open-app', res.originalApp)
  } else if (res.type === 'project' || res.type === 'experience') {
    emit('show-project', res.originalItem)
  }
}

watch(() => props.isOpen, (newVal) => {
  if (!newVal) searchQuery.value = ''
})
</script>

<style scoped>
.aero-glass {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border-radius: 8px;
}

.start-menu {
  position: absolute;
  bottom: 40px;
  left: 0;
  width: 400px;
  height: 500px;
  display: flex;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  overflow: hidden;
  z-index: 9999;
}

.start-menu-left {
  flex: 1;
  background: #fff;
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.start-menu-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
}

.start-menu-item:hover {
  background: #e5f3fb;
}

.sm-icon {
  font-size: 24px;
  margin-right: 10px;
}

.sm-img {
  width: 24px;
  height: 24px;
  object-fit: contain;
  margin-right: 10px;
}



.sm-details {
  display: flex;
  flex-direction: column;
}

.sm-text {
  font-size: 14px;
  color: #333;
}

.sm-subtext {
  font-size: 10px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}

.start-search {
  margin-top: auto;
  padding-top: 10px;
}

.start-search input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 15px;
  outline: none;
  font-family: "Segoe UI", Tahoma, sans-serif;
}

.start-menu-right {
  width: 150px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  display: flex;
  flex-direction: column;
  padding: 10px 0;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: #fff;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 0 5px rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.8);
}

.user-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 2px;
}

.user-name {
  color: #fff;
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0,0,0,0.8);
  font-size: 14px;
}

.right-links {
  display: flex;
  flex-direction: column;
}

.right-link {
  padding: 6px 15px;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0,0,0,0.8);
  cursor: pointer;
  font-size: 13px;
}

.right-link:hover {
  background: rgba(255, 255, 255, 0.2);
}

.right-links hr {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  margin: 5px 15px;
}

.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.2s ease;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
