<template>
  <!-- Boot Screen -->
  <div v-if="appState === 'boot'" class="win7-boot">
    <div class="boot-container">
      <img src="/YanisLaribi-Portfolio/images/windows 7 logo launcher.png" alt="Windows 7 Logo" class="boot-logo" />
      <div class="boot-title">Windows 7</div>
      
      <div class="boot-progress-bar">
        <div class="boot-progress-fill"></div>
      </div>
      
      <div class="boot-text-under"><i>Under Construction</i></div>
    </div>
    
    <div class="boot-copyright">Copyright © 2009 Microsoft Corp.</div>
  </div>

  <!-- Login Screen -->
  <div v-else-if="appState === 'login'" class="win7-fullscreen">
    <div class="user-account" @click="login">
      <div class="user-frame">
        <img src="/YanisLaribi-Portfolio/images/flower image loading screen windows 7.jpg" alt="Visitor Avatar" class="user-avatar" />
      </div>
      <div class="user-name">Visitor</div>
    </div>
  </div>

  <!-- Welcome / Loading Screen -->
  <div v-else-if="appState === 'welcome'" class="win7-fullscreen">
    <div class="welcome-container">
      <div class="win7-spinner"></div>
      <div class="win7-welcome-text">Welcome</div>
    </div>
  </div>

  <!-- Desktop -->
  <RetroDesktop v-else-if="appState === 'desktop'" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import RetroDesktop from './components/RetroDesktop.vue'

// States: 'boot' -> 'login' -> 'welcome' -> 'desktop'
const appState = ref('boot')

onMounted(() => {
  setTimeout(() => {
    appState.value = 'login'
  }, 3500)
})

function login() {
  appState.value = 'welcome'
  setTimeout(() => {
    appState.value = 'desktop'
  }, 3500)
}
</script>

<style>
#app {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  font-family: "Segoe UI", Tahoma, sans-serif;
}

/* BOOT SCREEN STYLES */
.win7-boot {
  position: absolute;
  inset: 0;
  background-color: #000000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  user-select: none;
}

.boot-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.boot-logo {
  width: 100px;
  height: auto;
  margin-bottom: 10px;
  filter: drop-shadow(0 0 10px rgba(255,255,255,0.2));
}

.boot-title {
  color: white;
  font-size: 42px;
  font-weight: 300;
  letter-spacing: -1px;
}

.boot-progress-bar {
  width: 160px;
  height: 10px;
  border: 1px solid #444;
  border-radius: 4px;
  background: #111;
  margin: 25px 0 10px 0;
  position: relative;
  overflow: hidden;
}

.boot-progress-fill {
  width: 40px;
  height: 100%;
  background: linear-gradient(90deg, transparent, #44ff44 50%, transparent);
  border-radius: 2px;
  position: absolute;
  animation: boot-load 1.5s linear infinite;
}

@keyframes boot-load {
  0% { left: -40px; }
  100% { left: 160px; }
}

.boot-text-under {
  color: white;
  font-family: "Segoe UI", Tahoma, sans-serif;
  font-size: 15px;
  font-weight: bold;
}

.boot-copyright {
  position: absolute;
  bottom: 20px;
  right: 20px;
  color: #555;
  font-size: 10px;
}

/* FULLSCREEN BASE FOR OTHERS */
.win7-fullscreen {
  position: absolute;
  inset: 0;
  background: url('/YanisLaribi-Portfolio/images/windows7_wallpaper.jpg') no-repeat center center;
  background-size: cover;
  background-color: #166fb9;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  user-select: none;
}

/* LOGIN SCREEN STYLES */
.user-account {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transform: translateY(-20px);
}

.user-frame {
  width: 120px;
  height: 120px;
  padding: 4px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 5px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.8);
  margin-bottom: 12px;
  transition: all 0.1s ease;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.user-frame:hover {
  background: linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 100%);
  border-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 5px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,1);
}

.user-frame:active {
  transform: scale(0.97);
}

.user-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid rgba(0,0,0,0.4);
}

.user-name {
  color: white;
  font-size: 26px;
  font-weight: 400;
  text-shadow: 0 1px 5px rgba(0,0,0,0.5);
}

/* WELCOME SCREEN STYLES */
.welcome-container {
  display: flex;
  align-items: center;
  gap: 12px;
  transform: translateY(-20px);
}

.win7-welcome-text {
  color: #ffffff;
  font-size: 28px;
  font-weight: 400;
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.4);
}

.win7-spinner {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, transparent 0%, transparent 30%, rgba(20, 220, 255, 0.4) 70%, #0cebfe 100%);
  -webkit-mask: radial-gradient(transparent 55%, black 57%);
  mask: radial-gradient(transparent 55%, black 57%);
  animation: win7-spin 1.2s linear infinite;
}

@keyframes win7-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
