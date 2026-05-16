<template>
  <div
    ref="containerRef"
    class="three-canvas-container"
    :style="{ cursor: cursorStyle }"
    @mousedown="onMouseDown"
    @click="onCanvasClick"
  >
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

const props = defineProps({
  active: { type: Boolean, default: true }
})

const emit = defineEmits(['enter-computer'])

const containerRef = ref(null)
const cursorStyle = ref('default')

let scene, camera, renderer, animationId
let computerMeshes = []
let needsRender = true

// Camera orbit state — horizontal only, pivoting around the computer
let orbitTarget = new THREE.Vector3(0, 0, 0)   // set once computer loads
let orbitRadius = 4                              // distance from computer
let orbitAngle  = 0                              // radians, 0 = directly in front
let orbitY      = 0                              // camera height, set at screen level

// Drag state
let isDragging   = false
let dragStartX   = 0
let dragAngleStart = 0
let hasDragged   = false                         // to distinguish click from drag

const raycaster = new THREE.Raycaster()
const mouse     = new THREE.Vector2()

// ── Scene init ─────────────────────────────────────────
function initScene() {
  const container = containerRef.value
  if (!container) return

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x111111)

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 500)
  camera.position.set(0, 3, 5)
  camera.lookAt(0, 2, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.BasicShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.8
  container.appendChild(renderer.domElement)

  setupLights()
  loadModels()
  animate()

  window.addEventListener('resize', onResize)
  window.addEventListener('mousemove', onGlobalMouseMove)
  window.addEventListener('mouseup',   onMouseUp)
}

// ── Lights ─────────────────────────────────────────────
function setupLights() {
  scene.add(new THREE.AmbientLight(0xffffff, 3.0))
  scene.add(new THREE.HemisphereLight(0xffeedd, 0x333344, 2.0))

  const dir = new THREE.DirectionalLight(0xffddaa, 3.0)
  dir.position.set(2, 8, 5)
  dir.castShadow = true
  dir.shadow.mapSize.set(512, 512)
  scene.add(dir)

  const fill = new THREE.DirectionalLight(0x88aacc, 1.5)
  fill.position.set(-3, 4, -2)
  scene.add(fill)

  const warm = new THREE.PointLight(0xffb000, 2.0, 10, 2)
  warm.position.set(0, 4, -3)
  scene.add(warm)
}

// ── Model loading ───────────────────────────────────────
function loadModels() {
  const loader = new GLTFLoader()
  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')
  loader.setDRACOLoader(dracoLoader)

  loader.load('/models/room_scene.glb', (gltf) => {
    const sceneModel = gltf.scene
    sceneModel.traverse((child) => { if (child.isMesh) child.receiveShadow = true })
    scene.add(sceneModel)

    const sceneBox = new THREE.Box3().setFromObject(sceneModel)
    loadComputer(loader, dracoLoader, sceneBox)
    needsRender = true
  }, undefined, (e) => console.error('Scene load error:', e))
}

function loadComputer(loader, dracoLoader, sceneBox) {
  const sceneCenter = new THREE.Vector3()
  sceneBox.getCenter(sceneCenter)
  const floorY = sceneBox.min.y

  loader.load('/models/retro_crt_computer.glb', (gltf) => {
    const model = gltf.scene

    model.traverse((child) => {
      if (child.isMesh) { child.castShadow = true; child.receiveShadow = true }
    })

    // Scale
    const box = new THREE.Box3().setFromObject(model)
    const size = new THREE.Vector3()
    box.getSize(size)
    const scale = 3.0 / Math.max(size.x, size.y, size.z)
    model.scale.setScalar(scale)

    // Re-measure and place on floor, centered in scene
    box.setFromObject(model)
    const center = new THREE.Vector3()
    box.getCenter(center)
    model.position.set(
      sceneCenter.x - center.x,
      floorY - box.min.y,
      sceneCenter.z - center.z
    )
    scene.add(model)
    model.updateMatrixWorld(true)

    model.traverse((child) => { if (child.isMesh) computerMeshes.push(child) })

    // Set orbit pivot to the center of the computer
    box.setFromObject(model)
    box.getCenter(orbitTarget)

    // Camera height = screen level (55% up the computer's height)
    orbitY = box.min.y + (box.max.y - box.min.y) * 0.55

    // Start facing the computer from the front (angle = 0)
    orbitAngle = 0
    updateCamera()

    needsRender = true
    dracoLoader.dispose()
  }, undefined, (e) => console.error('Computer load error:', e))
}

// ── Orbit camera ────────────────────────────────────────
function updateCamera() {
  // Orbit horizontally around the orbitTarget
  camera.position.set(
    orbitTarget.x + Math.sin(orbitAngle) * orbitRadius,
    orbitY,
    orbitTarget.z + Math.cos(orbitAngle) * orbitRadius
  )
  camera.lookAt(orbitTarget.x, orbitY, orbitTarget.z)
  needsRender = true
}

// ── Mouse drag for horizontal orbit ─────────────────────
function onMouseDown(e) {
  if (!props.active) return
  isDragging    = true
  hasDragged    = false
  dragStartX    = e.clientX
  dragAngleStart = orbitAngle
  cursorStyle.value = 'grabbing'
}

function onGlobalMouseMove(e) {
  if (!props.active) return

  if (isDragging) {
    const dx = e.clientX - dragStartX
    if (Math.abs(dx) > 3) hasDragged = true
    // Sensitivity: full screen width = ~180° of rotation
    orbitAngle = dragAngleStart - dx * (Math.PI / window.innerWidth) * 2.5
    updateCamera()
  } else if (computerMeshes.length > 0 && camera) {
    // Hover detection for pointer cursor
    const rect = containerRef.value?.getBoundingClientRect()
    if (!rect) return
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(mouse, camera)
    const hit = raycaster.intersectObjects(computerMeshes, true).length > 0
    cursorStyle.value = hit ? 'pointer' : 'grab'
  }
}

function onMouseUp() {
  isDragging = false
  // Restore cursor based on hover state (will update on next mousemove)
  if (cursorStyle.value === 'grabbing') cursorStyle.value = 'grab'
}

// ── Click to enter (only if not a drag) ─────────────────
function onCanvasClick(e) {
  if (!props.active || !camera || hasDragged) return

  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect) return
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(mouse, camera)

  if (computerMeshes.length > 0) {
    const hits = raycaster.intersectObjects(computerMeshes, true)
    if (hits.length > 0) emit('enter-computer')
  }
}

// ── Resize / animate ────────────────────────────────────
function onResize() {
  if (!camera || !renderer) return
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  needsRender = true
}

function animate() {
  animationId = requestAnimationFrame(animate)
  if (needsRender) {
    renderer.render(scene, camera)
    needsRender = false
  }
}

// ── Lifecycle ───────────────────────────────────────────
onMounted(() => {
  initScene()
  // Keep rendering while models load
  let count = 0
  const forceRender = setInterval(() => {
    needsRender = true
    if (++count > 60) clearInterval(forceRender)
  }, 100)
})

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('mousemove', onGlobalMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  if (renderer) {
    renderer.dispose()
    if (containerRef.value?.contains(renderer.domElement)) {
      containerRef.value.removeChild(renderer.domElement)
    }
  }
})
</script>
