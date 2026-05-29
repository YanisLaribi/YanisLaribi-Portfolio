import { ref } from "vue";

export function useWindowManager(showComingSoon) {
  const windows = ref([]);
  const activeWindow = ref(null);
  let zIndexCounter = 10;

  function openWindow(icon) {
    if (icon.id === "music") {
      return showComingSoon("Music");
    }
    if (icon.id === "linkedin") {
      window.open("https://linkedin.com/in/yanislaribi", "_blank");
      return;
    }
    if (icon.id === "resume") {
      window.open(
        "/YanisLaribi-Portfolio/resume/Resume-summer2026.pdf",
        "_blank",
      );
      return;
    }
    const existing = windows.value.find((w) => w.id === icon.id);
    if (existing) {
      existing.minimized = false;
      focusWindow(icon.id);
      return;
    }

    const offset = windows.value.length * 30;
    windows.value.push({
      id: icon.id,
      title: icon.title,
      emoji: icon.emoji,
      iconUrl: icon.iconUrl,
      x: 100 + offset,
      y: 100 + offset,
      width: ["projects", "files-explorer", "experience"].includes(icon.id)
        ? 800
        : 600,
      height: ["projects", "files-explorer", "experience"].includes(icon.id)
        ? 550
        : 400,
      minimized: false,
      maximized: false,
      zIndex: ++zIndexCounter,
    });
    activeWindow.value = icon.id;
  }

  function focusWindow(id) {
    const win = windows.value.find((w) => w.id === id);
    if (win) {
      win.zIndex = ++zIndexCounter;
      activeWindow.value = id;
    }
  }

  function closeWindow(id) {
    windows.value = windows.value.filter((w) => w.id !== id);
    if (activeWindow.value === id) {
      activeWindow.value =
        windows.value.length > 0
          ? windows.value[windows.value.length - 1].id
          : null;
    }
  }

  function minimizeWindow(win) {
    win.minimized = true;
    activeWindow.value = null;
  }

  function toggleMaximize(win) {
    win.maximized = !win.maximized;
    focusWindow(win.id);
  }

  function toggleTaskbarWindow(win) {
    if (win.minimized) {
      win.minimized = false;
      focusWindow(win.id);
    } else if (activeWindow.value === win.id) {
      win.minimized = true;
      activeWindow.value = null;
    } else {
      focusWindow(win.id);
    }
  }

  function minimizeAllWindows() {
    windows.value.forEach((w) => (w.minimized = true));
    activeWindow.value = null;
  }

  function showProjectAlert(project) {
    const notepadId = `notepad-${project.id || project.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    const existing = windows.value.find((w) => w.id === notepadId);
    if (existing) {
      existing.minimized = false;
      focusWindow(notepadId);
      return;
    }

    const offset = windows.value.length * 30;
    windows.value.push({
      id: notepadId,
      title: `${project.name} - Notepad`,
      emoji: "📝",
      iconUrl: "",
      x: 120 + offset,
      y: 80 + offset,
      width: 650,
      height: 480,
      minimized: false,
      maximized: false,
      zIndex: ++zIndexCounter,
      appType: "notepad",
      projectData: project,
    });
    activeWindow.value = notepadId;
  }

  function windowStyle(win) {
    if (win.maximized) {
      return {
        top: "0px",
        left: "0px",
        width: "100%",
        height: "calc(100% - 40px)",
        zIndex: win.zIndex,
      };
    }
    return {
      top: `${win.y}px`,
      left: `${win.x}px`,
      width: `${win.width}px`,
      height: `${win.height}px`,
      zIndex: win.zIndex,
    };
  }

  return {
    windows,
    activeWindow,
    openWindow,
    focusWindow,
    closeWindow,
    minimizeWindow,
    toggleMaximize,
    toggleTaskbarWindow,
    minimizeAllWindows,
    showProjectAlert,
    windowStyle,
  };
}
