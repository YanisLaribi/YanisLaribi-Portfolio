<template>
  <div class="notepad-app">
    <div class="notepad-menu">
      <span class="notepad-menu-item"><u>F</u>ile</span>
      <span class="notepad-menu-item"><u>E</u>dit</span>
      <span class="notepad-menu-item"><u>F</u>ormat</span>
      <span class="notepad-menu-item"><u>V</u>iew</span>
      <span class="notepad-menu-item"><u>H</u>elp</span>
    </div>
    <div 
      class="notepad-textarea" 
      v-html="formatNotepadText(projectData?.content)"
    ></div>
  </div>
</template>

<script setup>
const props = defineProps({
  projectData: Object
})

function formatNotepadText(text) {
  if (!text) return '';
  let formatted = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  
  // Separators
  formatted = formatted.replace(/(={10,})/g, '<span class="np-separator">$1</span>');
  // Headers [TEXT]
  formatted = formatted.replace(/\[(.*?)\]/g, '<span class="np-header">[$1]</span>');
  // Key value pairs
  formatted = formatted.replace(/^(PROJECT:|ROLE:|TECHNOLOGY STACK:|ACCOLADES:|ORGANIZATION:|LOCATION:|DURATION:|COLLABORATION:)/gm, '<span class="np-key">$1</span>');
  // Lists
  formatted = formatted.replace(/^\* (.*)/gm, '<span class="np-list-bullet">*</span> <span class="np-list-item">$1</span>');
  
  return formatted;
}
</script>

<style scoped>
/* Notepad App Styles */
.notepad-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: -20px;
  background: #ffffff;
}

.notepad-menu {
  display: flex;
  background: #f0f0f0;
  border-bottom: 1px solid #d9d9d9;
  padding: 2px 5px;
  user-select: none;
}

.notepad-menu-item {
  padding: 2px 8px;
  font-size: 11px;
  color: #000;
  font-family: "Segoe UI", Tahoma, sans-serif;
  cursor: default;
}

.notepad-menu-item:hover {
  background: #cce8ff;
  outline: 1px solid #99d1ff;
  border-radius: 1px;
}

.notepad-textarea {
  flex: 1;
  border: none;
  outline: none;
  padding: 15px;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #24292e;
  background: #ffffff;
  overflow-y: auto;
  white-space: pre-wrap;
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.03);
}

/* Syntax Highlighting for Notepad */
:deep(.np-separator) {
  color: #a3a3a3;
  letter-spacing: -1px;
}

:deep(.np-header) {
  color: #0366d6;
  font-weight: bold;
  background: #f1f8ff;
  padding: 2px 4px;
  border-radius: 3px;
  border: 1px solid #c8e1ff;
}

:deep(.np-key) {
  color: #d73a49;
  font-weight: bold;
}

:deep(.np-list-bullet) {
  color: #e36209;
  font-weight: bold;
}

:deep(.np-list-item) {
  color: #24292e;
}
</style>
