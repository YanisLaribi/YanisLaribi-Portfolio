import { onMounted, onBeforeUnmount } from "vue";

export function useDragResize(focusWindow) {
  let draggingWindow = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  let resizingWindow = null;
  let resizeStartX = 0;
  let resizeStartY = 0;
  let resizeStartWidth = 0;
  let resizeStartHeight = 0;

  function startDrag(e, win) {
    if (win.maximized) return;
    focusWindow(win.id);
    draggingWindow = win;
    dragOffsetX = e.clientX - win.x;
    dragOffsetY = e.clientY - win.y;
  }

  function onDrag(e) {
    if (!draggingWindow) return;
    draggingWindow.x = e.clientX - dragOffsetX;
    draggingWindow.y = e.clientY - dragOffsetY;
  }

  function stopDrag() {
    draggingWindow = null;
  }

  function startResize(e, win) {
    if (win.maximized) return;
    focusWindow(win.id);
    resizingWindow = win;
    resizeStartX = e.clientX;
    resizeStartY = e.clientY;
    resizeStartWidth = win.width;
    resizeStartHeight = win.height;
  }

  function onResize(e) {
    if (!resizingWindow) return;
    resizingWindow.width = Math.max(
      300,
      resizeStartWidth + (e.clientX - resizeStartX),
    );
    resizingWindow.height = Math.max(
      200,
      resizeStartHeight + (e.clientY - resizeStartY),
    );
  }

  function stopResize() {
    resizingWindow = null;
  }

  onMounted(() => {
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("mousemove", onResize);
    window.addEventListener("mouseup", stopResize);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("mousemove", onDrag);
    window.removeEventListener("mouseup", stopDrag);
    window.removeEventListener("mousemove", onResize);
    window.removeEventListener("mouseup", stopResize);
  });

  return { startDrag, startResize };
}
