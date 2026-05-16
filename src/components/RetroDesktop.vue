<template>
  <div class="crt-screen">

    <!-- BOOT SEQUENCE -->
    <div v-if="booting" class="boot">
      <div class="boot-terminal">
        <div v-for="(line, i) in bootLines" :key="i" class="boot-line">
          <span :class="line.cls">{{ line.text }}</span>
        </div>
        <div class="boot-progress" v-if="showBootBar">
          <div class="boot-bar-track">
            <div class="boot-bar-fill" :style="{ width: bootProgress + '%' }"></div>
          </div>
        </div>
        <span class="boot-cursor">_</span>
      </div>
    </div>

    <!-- DESKTOP -->
    <div v-show="!booting" class="desktop" @click="onDesktopClick" @contextmenu.prevent>

      <!-- Top bar -->
      <div class="topbar">
        <span class="topbar-sys">SYS READY</span>
        <span class="topbar-sep">|</span>
        <span>MEM 640K</span>
        <span class="topbar-sep">|</span>
        <span>{{ openWindows.length }} TASK{{ openWindows.length !== 1 ? 'S' : '' }}</span>
        <div class="topbar-right">
          <span>{{ currentDate }}</span>
          <span class="topbar-sep">|</span>
          <span class="topbar-clock">{{ currentTime }}</span>
        </div>
      </div>

      <!-- Desktop Icons Grid -->
      <div class="icon-grid">
        <div
          v-for="icon in desktopIcons"
          :key="icon.id"
          class="icon"
          :class="{ selected: selectedIcon === icon.id }"
          @click.stop="selectIcon(icon.id)"
          @dblclick.stop="openWindow(icon.id)"
        >
          <div class="icon-glyph">{{ icon.glyph }}</div>
          <span class="icon-label">{{ icon.label }}</span>
        </div>
      </div>

      <!-- Windows -->
      <div
        v-for="win in visibleWindows"
        :key="win.id"
        class="window"
        :class="{ focused: focusedId === win.id }"
        :style="winStyle(win)"
        @mousedown.stop="bringToFront(win.id)"
      >
        <!-- Title bar -->
        <div class="win-titlebar" @mousedown.prevent="startDrag($event, win)">
          <div class="win-title-left">
            <span class="win-dot"></span>
            <span class="win-title-text">{{ win.title }}</span>
          </div>
          <div class="win-controls">
            <button class="win-btn win-min" @mousedown.stop @click.stop="toggleMinimize(win.id)" title="Minimize">&#x2013;</button>
            <button class="win-btn win-close" @mousedown.stop @click.stop="closeWindow(win.id)" title="Close">&#x2715;</button>
          </div>
        </div>

        <!-- Window Content -->
        <div class="win-content">
          <!-- Projects -->
          <template v-if="win.id === 'projects'">
            <div v-for="p in projects" :key="p.title" class="entry">
              <div class="entry-head">
                <span class="entry-title">> {{ p.title }}</span>
                <span v-if="p.badge" class="entry-badge">{{ p.badge }}</span>
              </div>
              <div class="entry-desc">{{ p.desc }}</div>
              <div class="entry-tags">
                <span v-for="t in p.tags" :key="t" class="tag">{{ t }}</span>
              </div>
            </div>
          </template>

          <!-- About -->
          <template v-else-if="win.id === 'about'">
            <div class="section-head">ABOUT ME</div>
            <div class="divider"></div>
            <div class="info-grid">
              <span class="info-key">Name</span><span class="info-val">Yanis Laribi</span>
              <span class="info-key">Role</span><span class="info-val">Software Engineering Student</span>
              <span class="info-key">School</span><span class="info-val">Universite Laval</span>
              <span class="info-key">Location</span><span class="info-val">Quebec City, QC</span>
            </div>
            <p class="about-text">I love blending creativity with technical skill to build projects that stand out. My goal is to transform every idea into a memorable experience.</p>
            <div class="subsection-head">INTERESTS</div>
            <ul class="about-list">
              <li>Web development &amp; 3D graphics</li>
              <li>Machine learning &amp; data science</li>
              <li>Interactive design &amp; animation</li>
              <li>Cybersecurity research</li>
              <li>Manga &amp; anime (1000+ read)</li>
            </ul>
          </template>

          <!-- Skills -->
          <template v-else-if="win.id === 'skills'">
            <div v-for="cat in skillCategories" :key="cat.name" class="skill-cat">
              <div class="subsection-head">{{ cat.name }}</div>
              <div v-for="s in cat.skills" :key="s[0]" class="skill-row">
                <span class="skill-name">{{ s[0] }}</span>
                <div class="skill-track"><div class="skill-fill" :style="{ width: s[1] + '%' }"></div></div>
                <span class="skill-pct">{{ s[1] }}%</span>
              </div>
            </div>
          </template>

          <!-- Education -->
          <template v-else-if="win.id === 'education'">
            <div class="section-head">EDUCATION &amp; EXPERIENCE</div>
            <div class="divider"></div>
            <div class="subsection-head">ACADEMIC</div>
            <div class="timeline-item">
              <div class="timeline-title">Bachelor of Software Engineering</div>
              <div class="timeline-sub">Universite Laval â€” 3rd Year â€” GPA: 3.5/4.3</div>
              <div class="timeline-loc">Quebec City, QC</div>
            </div>
            <div class="timeline-item">
              <div class="timeline-title">Student Exchange Program</div>
              <div class="timeline-sub">Brock University</div>
              <div class="timeline-loc">St. Catharines, ON</div>
            </div>
            <div class="subsection-head">INTERNSHIP</div>
            <div class="timeline-item">
              <div class="timeline-title">Data Science Intern â€” Anomaly Detection</div>
              <div class="timeline-sub">Federal Government of Canada â€” Environment and Climate Change</div>
              <div class="timeline-loc">May 2026 â€” Aug 2026, Quebec City</div>
            </div>
            <div class="subsection-head">RESEARCH</div>
            <div class="timeline-item">
              <div class="timeline-title">SGD Beyond â€” Academic ML Club (2025â€“2026)</div>
            </div>
            <div class="timeline-item">
              <div class="timeline-title">CANLock â€” Vehicle Cybersecurity (Thales, 2025)</div>
            </div>
          </template>

          <!-- Contact -->
          <template v-else-if="win.id === 'contact'">
            <div class="section-head">CONTACT</div>
            <div class="divider"></div>
            <div class="contact-grid">
              <span class="contact-key">Email</span><span class="contact-dots"></span><span class="contact-val">yanis.laribi.1@ulaval.ca</span>
              <span class="contact-key">Phone</span><span class="contact-dots"></span><span class="contact-val">418-264-7838</span>
              <span class="contact-key">LinkedIn</span><span class="contact-dots"></span><span class="contact-val">linkedin.com/in/yanislaribi</span>
              <span class="contact-key">GitHub</span><span class="contact-dots"></span><span class="contact-val">github.com/YanisLaribi</span>
              <span class="contact-key">Location</span><span class="contact-dots"></span><span class="contact-val">Quebec City, QC, Canada</span>
            </div>
          </template>

          <!-- Resume -->
          <template v-else-if="win.id === 'cv'">
            <div class="section-head">RESUME</div>
            <div class="divider"></div>
            <div class="cv-name">Yanis Laribi</div>
            <div class="cv-role">Software Engineering Student</div>
            <div class="subsection-head">PROFILE</div>
            <p class="cv-text">3rd year Software Engineering student at Universite Laval. Specializing in full-stack development, machine learning, 3D graphics, and cybersecurity.</p>
            <div class="subsection-head">EXPERIENCE</div>
            <p class="cv-text">Data Science Intern â€” Government of Canada (Mayâ€“Aug 2026)
Unsupervised ML for anomaly detection in climate data.</p>
            <div class="subsection-head">NOTABLE PROJECTS</div>
            <p class="cv-text">BatiBloc â€” Winner of Yves-Roy Award
Medical Case Simulator â€” Flask, MySQL
CANLock â€” Vehicle Cybersecurity (Thales)</p>
            <div class="subsection-head">TECHNOLOGIES</div>
            <p class="cv-text">Java, Python, C/C++, JavaScript, SQL, Vue.js, Three.js, Flask, PyTorch, Docker, Git</p>
            <div class="subsection-head">LANGUAGES</div>
            <p class="cv-text">French â€” Native
English â€” Advanced</p>
          </template>

        </div>
      </div>


      <!-- Taskbar -->
      <div class="taskbar">
        <button class="taskbar-menu-btn" :class="{ active: menuOpen }" @click.stop="menuOpen = !menuOpen">
          MENU
        </button>
        <div class="taskbar-tasks">
          <button
            v-for="win in openWindows"
            :key="'tb-' + win.id"
            class="taskbar-task"
            :class="{ active: focusedId === win.id && !win.minimized, minimized: win.minimized }"
            @click.stop="onTaskbarClick(win.id)"
          >
            {{ win.title }}
          </button>
        </div>
        <button class="taskbar-shutdown" @click.stop="$emit('exit-computer')" title="Back to room">
          SHUT DOWN
        </button>
      </div>

      <!-- Start Menu -->
      <Transition name="menu-slide">
        <div v-if="menuOpen" class="menu" @click.stop>
          <div class="menu-header">PORTFOLIO</div>
          <div
            v-for="icon in desktopIcons"
            :key="'m-' + icon.id"
            class="menu-item"
            @click="openWindow(icon.id); menuOpen = false"
          >
            <span class="menu-item-glyph">{{ icon.glyph }}</span>
            <span>{{ icon.label }}</span>
          </div>
          <div class="menu-divider"></div>
          <div class="menu-item menu-item-shutdown" @click="$emit('exit-computer'); menuOpen = false">
            <span class="menu-item-glyph">[X]</span>
            <span>Shut Down</span>
          </div>
        </div>
      </Transition>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const emit = defineEmits(['exit-computer'])

// â”€â”€ State â”€â”€
const booting = ref(true)
const menuOpen = ref(false)
const selectedIcon = ref(null)
const focusedId = ref(null)
const currentTime = ref('')
const currentDate = ref('')
const bootLines = ref([])
const showBootBar = ref(false)
const bootProgress = ref(0)
let clockInterval = null
let nextZIndex = 100

// â”€â”€ Icons â”€â”€
const desktopIcons = [
  { id: 'projects', glyph: 'PRJ', label: 'Projects' },
  { id: 'about',    glyph: 'ABT', label: 'About' },
  { id: 'skills',   glyph: 'SKL', label: 'Skills' },
  { id: 'education',glyph: 'EDU', label: 'Education' },
  { id: 'contact',  glyph: 'CON', label: 'Contact' },
  { id: 'cv',       glyph: 'RSM', label: 'Resume' },
]

// â”€â”€ Window Config â”€â”€
const windowDefaults = {
  projects:  { title: 'Projects',  w: 620, h: 460, x: 180, y: 50 },
  about:     { title: 'About Me',  w: 520, h: 410, x: 220, y: 65 },
  skills:    { title: 'Skills',    w: 560, h: 430, x: 200, y: 55 },
  education: { title: 'Education', w: 520, h: 430, x: 240, y: 60 },
  contact:   { title: 'Contact',   w: 480, h: 320, x: 260, y: 80 },
  cv:        { title: 'Resume',    w: 530, h: 490, x: 190, y: 50 },
}

const openWindows = ref([])

const visibleWindows = computed(() =>
  openWindows.value.filter(w => !w.minimized)
)

// â”€â”€ Data â”€â”€
const projects = [
  { title: 'BatiBloc', badge: 'AWARD WINNER', desc: 'Construction simulation with 2D/3D visualization, PDF import, and cost estimation. Winner of the Yves-Roy Award.', tags: ['Java', 'JavaFX', 'Swing', 'PDFBox'] },
  { title: 'Medical Case Simulator', desc: '3-tier web app for clinical case simulations. WCAG AA accessible, REST API, secure MySQL backend.', tags: ['Python', 'Flask', 'MySQL', 'JS'] },
  { title: '3D Portfolio', desc: 'This portfolio â€” an immersive 3D web experience with a retro OS interface.', tags: ['Vue.js', 'Three.js'] },
  { title: 'CANLock', desc: 'AI-powered anomaly detection on CAN bus vehicular networks. Thales partnership.', tags: ['Python', 'AI', 'Cybersecurity'] },
  { title: 'Web Automation Agent', desc: 'Autonomous agent bypassing anti-bot mechanisms. Built at ConUHack 2026.', tags: ['Python', 'Selenium', 'Wireshark'] },
  { title: 'Banking System', desc: 'OOP banking application with secure transactions and exception handling.', tags: ['C++', 'Qt', 'OOP'] },
]

const skillCategories = [
  { name: 'LANGUAGES', skills: [['Java', 90], ['Python', 88], ['JavaScript', 85], ['C/C++', 75], ['SQL', 80]] },
  { name: 'WEB / BACKEND', skills: [['Vue.js', 80], ['Flask', 78], ['REST APIs', 82], ['Three.js', 72], ['MySQL', 78]] },
  { name: 'AI / DATA', skills: [['PyTorch', 70], ['scikit-learn', 75], ['Pandas/NumPy', 80], ['Data Analysis', 78]] },
  { name: 'TOOLS', skills: [['Git', 90], ['Docker', 65], ['Linux', 75], ['Blender', 60]] },
]

// â”€â”€ Window Helpers â”€â”€
function winStyle(win) {
  return {
    left: win.x + 'px',
    top: win.y + 'px',
    width: win.w + 'px',
    height: win.h + 'px',
    zIndex: win.z,
  }
}

function selectIcon(id) {
  selectedIcon.value = id
}

function openWindow(id) {
  selectedIcon.value = null
  const existing = openWindows.value.find(w => w.id === id)
  if (existing) {
    existing.minimized = false
    bringToFront(id)
    return
  }
  const cfg = windowDefaults[id]
  if (!cfg) return
  const offset = openWindows.value.length * 18
  openWindows.value.push({
    id,
    title: cfg.title,
    w: cfg.w,
    h: cfg.h,
    x: cfg.x + offset,
    y: cfg.y + offset,
    z: nextZIndex++,
    minimized: false,
  })
  bringToFront(id)
}

function closeWindow(id) {
  openWindows.value = openWindows.value.filter(w => w.id !== id)
  if (focusedId.value === id) {
    const top = [...openWindows.value].filter(w => !w.minimized).sort((a, b) => b.z - a.z)
    focusedId.value = top.length ? top[0].id : null
  }
}

function toggleMinimize(id) {
  const win = openWindows.value.find(w => w.id === id)
  if (!win) return
  win.minimized = !win.minimized
  if (win.minimized && focusedId.value === id) {
    const top = [...openWindows.value].filter(w => !w.minimized).sort((a, b) => b.z - a.z)
    focusedId.value = top.length ? top[0].id : null
  } else if (!win.minimized) {
    bringToFront(id)
  }
}

function bringToFront(id) {
  const win = openWindows.value.find(w => w.id === id)
  if (win) {
    win.z = nextZIndex++
    focusedId.value = id
  }
}

function onTaskbarClick(id) {
  const win = openWindows.value.find(w => w.id === id)
  if (!win) return
  if (win.minimized) {
    win.minimized = false
    bringToFront(id)
  } else if (focusedId.value === id) {
    win.minimized = true
    const top = [...openWindows.value].filter(w => !w.minimized).sort((a, b) => b.z - a.z)
    focusedId.value = top.length ? top[0].id : null
  } else {
    bringToFront(id)
  }
}

function onDesktopClick() {
  menuOpen.value = false
  selectedIcon.value = null
}

// â”€â”€ Drag â”€â”€
let dragId = null, dragOx = 0, dragOy = 0
function startDrag(e, win) {
  dragId = win.id
  dragOx = e.clientX - win.x
  dragOy = e.clientY - win.y
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', endDrag)
}
function onDrag(e) {
  const win = openWindows.value.find(w => w.id === dragId)
  if (!win) return
  win.x = Math.max(0, Math.min(e.clientX - dragOx, window.innerWidth - 100))
  win.y = Math.max(22, Math.min(e.clientY - dragOy, window.innerHeight - 60))
}
function endDrag() {
  dragId = null
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', endDrag)
}

// â”€â”€ Clock â”€â”€
function tick() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  currentDate.value = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// â”€â”€ Keyboard â”€â”€
function onKey(e) {
  if (e.key === 'Escape') {
    if (menuOpen.value) { menuOpen.value = false; return }
    if (focusedId.value) { closeWindow(focusedId.value); return }
    emit('exit-computer')
  }
}

// â”€â”€ Boot Sequence â”€â”€
const bootScript = [
  { text: 'POST CHECK.........OK', cls: 'dim', delay: 200 },
  { text: 'MEMORY TEST........640K OK', cls: 'dim', delay: 300 },
  { text: 'DISK 0.............READY', cls: 'dim', delay: 250 },
  { text: 'LOADING KERNEL.....', cls: 'dim', delay: 400 },
  { text: 'KERNEL LOADED', cls: 'ok', delay: 200 },
  { text: '', cls: '', delay: 100 },
  { text: 'INITIALIZING MODULES...', cls: 'accent', delay: 300 },
  { text: '  > display_driver    [OK]', cls: 'dim', delay: 150 },
  { text: '  > input_handler     [OK]', cls: 'dim', delay: 120 },
  { text: '  > window_manager    [OK]', cls: 'dim', delay: 130 },
  { text: '  > portfolio_data    [OK]', cls: 'dim', delay: 180 },
  { text: '', cls: '', delay: 100 },
  { text: 'SYSTEM READY', cls: 'ok', delay: 400 },
  { text: 'STARTING DESKTOP...', cls: 'accent', delay: 600 },
]

async function runBoot() {
  for (const step of bootScript) {
    await new Promise(r => setTimeout(r, step.delay))
    bootLines.value.push(step)
  }
  showBootBar.value = true
  const start = performance.now()
  const duration = 800
  function frame(ts) {
    const elapsed = ts - start
    bootProgress.value = Math.min(100, (elapsed / duration) * 100)
    if (elapsed < duration) {
      requestAnimationFrame(frame)
    } else {
      bootProgress.value = 100
      setTimeout(() => { booting.value = false }, 200)
    }
  }
  requestAnimationFrame(frame)
}

// â”€â”€ Lifecycle â”€â”€
onMounted(() => {
  tick()
  clockInterval = setInterval(tick, 1000)
  window.addEventListener('keydown', onKey)
  runBoot()
})

onBeforeUnmount(() => {
  clearInterval(clockInterval)
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', endDrag)
})
</script>

