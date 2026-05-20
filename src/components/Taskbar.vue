<template>
  <div class="taskbar aero-glass">
    <div class="start-button" :class="{ active: isStartMenuOpen }" @click.stop="$emit('toggle-start-menu')">
      <div class="win-logo"></div>
    </div>
    
    <div class="taskbar-items">
      <div 
        v-for="win in windows" 
        :key="'tb-'+win.id"
        class="taskbar-item"
        :class="{ active: activeWindow === win.id && !win.minimized }"
        @click="$emit('toggle-taskbar-window', win)"
      >
        <img v-if="win.iconUrl" :src="win.iconUrl" class="taskbar-img" />
        <span v-else class="taskbar-emoji">{{ win.emoji }}</span>
        {{ win.title }}
      </div>
    </div>

    <div class="system-tray">
      <div class="tray-icon" title="I mean this website is clearly running... so I guess we do have wifi yes">📶</div>
      <div class="tray-icon battery-icon" title="Don't worry, this portfolio is fueled with redbull and coffee!">🔋</div>
      <div class="tray-time">
        <div>{{ time }}</div>
        <div>{{ date }}</div>
      </div>
      <div class="show-desktop" @click="$emit('minimize-all')"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  windows: Array,
  activeWindow: String,
  isStartMenuOpen: Boolean,
  time: String,
  date: String
})
defineEmits(['toggle-start-menu', 'toggle-taskbar-window', 'minimize-all'])
</script>

<style scoped>
.aero-glass {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.taskbar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  border-radius: 0;
  border-left: none;
  border-right: none;
  border-bottom: none;
  z-index: 10000;
  padding: 0;
}

.start-button {
  width: 50px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.start-button:hover, .start-button.active {
  background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%);
}

.win-logo {
  width: 36px;
  height: 36px;
  background: url('/images/windows 7 logo launcher.png') center/contain no-repeat;
  filter: drop-shadow(0 0 2px rgba(255,255,255,0.4));
}

.taskbar-items {
  flex: 1;
  display: flex;
  height: 100%;
  padding: 0 10px;
  gap: 5px;
  align-items: center;
}

.taskbar-item {
  height: 32px;
  padding: 0 12px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  color: white;
  text-shadow: 0 1px 2px black;
  font-weight: 500;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid transparent;
}

.taskbar-item:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.taskbar-item.active {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: inset 0 0 5px rgba(255,255,255,0.5);
}

.taskbar-img {
  width: 16px;
  height: 16px;
  object-fit: contain;
  margin-right: 5px;
}

.system-tray {
  display: flex;
  height: 100%;
  align-items: center;
  color: white;
  text-shadow: 0 1px 2px black;
  padding-right: 5px;
}

.tray-icon {
  margin: 0 5px;
  font-size: 16px;
  cursor: default;
}

.tray-time {
  margin: 0 10px;
  font-size: 12px;
  text-align: right;
  line-height: 1.1;
  cursor: default;
}

.show-desktop {
  width: 15px;
  height: 100%;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
}

.show-desktop:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
