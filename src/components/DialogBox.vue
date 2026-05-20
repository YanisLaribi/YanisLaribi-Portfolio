<template>
  <div v-if="dialog.show" class="win7-dialog-overlay" @mousedown.stop>
    <div class="window aero-glass dialog-window">
      <div class="window-titlebar">
        <div class="titlebar-text">{{ dialog.title }}</div>
        <div class="titlebar-controls">
          <button class="win-btn close" @click.stop="$emit('close', false)"></button>
        </div>
      </div>
      <div class="dialog-content-area">
        <div class="dialog-body">
          <div class="dialog-icon">⚠️</div>
          <div class="dialog-text">
            <div class="dialog-main">{{ dialog.mainText }}</div>
            <div class="dialog-sub">{{ dialog.subText }}</div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="win7-button" v-if="dialog.type === 'confirm'" @click="$emit('close', true)">OK</button>
          <button class="win7-button" v-if="dialog.type === 'confirm'" @click="$emit('close', false)">Cancel</button>
          <button class="win7-button" v-if="dialog.type === 'alert'" @click="$emit('close', true)">OK</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  dialog: Object
})
defineEmits(['close'])
</script>

<style scoped>
.win7-dialog-overlay {
  position: absolute;
  inset: 0;
  z-index: 20000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.aero-glass {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border-radius: 8px;
}

.window {
  position: absolute;
  display: flex;
  flex-direction: column;
}

.dialog-window {
  position: relative;
  min-width: 450px;
  max-width: 450px;
  min-height: auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.window-titlebar {
  height: 30px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  cursor: default;
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

.dialog-content-area {
  background: #fff;
  border: 1px solid #999;
  margin: 0 4px 4px 4px;
  border-radius: 0 0 4px 4px;
  display: flex;
  flex-direction: column;
}

.dialog-body {
  padding: 20px 15px;
  display: flex;
  gap: 15px;
  background: #ffffff;
}

.dialog-icon {
  font-size: 36px;
  line-height: 1;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.dialog-text {
  flex: 1;
}

.dialog-main {
  color: #003399;
  font-size: 19px;
  font-family: "Segoe UI", Tahoma, sans-serif;
  margin-bottom: 10px;
}

.dialog-sub {
  color: #000;
  font-size: 12px;
  line-height: 1.4;
}

.dialog-footer {
  background: #f0f0f0;
  border-top: 1px solid #dfdfdf;
  padding: 12px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.win7-button {
  min-width: 75px;
  padding: 4px 15px;
  font-family: "Segoe UI", Tahoma, sans-serif;
  font-size: 12px;
  color: #222;
  background: linear-gradient(to bottom, #f2f2f2 0%, #ebebeb 50%, #dddddd 50%, #cfcfcf 100%);
  border: 1px solid #707070;
  border-radius: 3px;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.7), 0 1px 2px rgba(0,0,0,0.1);
  cursor: pointer;
}

.win7-button:hover {
  background: linear-gradient(to bottom, #eaf6fd 0%, #d9f0fc 50%, #bee6fd 50%, #a7d9f5 100%);
  border-color: #3c7fb1;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.8), 0 1px 2px rgba(0,0,0,0.1);
}

.win7-button:active {
  background: linear-gradient(to bottom, #e5f4fc 0%, #c4e5f6 50%, #98d1ef 50%, #68b3db 100%);
  border-color: #2c628b;
}
</style>
