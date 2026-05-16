<template>
  <div
    ref="containerRef"
    class="three-canvas-container"
    :style="{ cursor: cursorStyle }"
    @mousemove="onMouseMove"
    @click="onCanvasClick"
  >
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { GLTFLoader }  from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

const props = defineProps({ active: { type: Boolean, default: true } })
const emit  = defineEmits(['enter-computer'])

const containerRef = ref(null)
const cursorStyle  = ref('default')

// All Three.js objects initialized inside initScene — never at module level
let scene    = null
let camera   = null
let renderer = null
let animationId = null
let raycaster   = null
let mouse2D     = null

let computerMeshes = []
let needsRender    = true

// Parallax
let targetCamX  = 0
let currentCamX = 0
let baseCamX = 0, baseCamY = 2, baseCamZ = 4
let baseLookX = 0, baseLookY = 2, baseLookZ = 0
const PARALLAX_RANGE  = 0.5
const PARALLAX_SMOOTH = 0.07

// Object positions
const POS = {
  computer:   { x:  0,   z: 0 },
  arcade:     { x:  2.2, z: 0 },
  gramophone: { x: -1.8, z: 0 },
}

// ── Init ─────────────────────────────────────────────────
function initScene() {
  const container = containerRef.value
  if (!container) return

  // Initialize Three.js objects here, not at module level
  raycaster = new THREE.Raycaster()
  mouse2D   = new THREE.Vector2()

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x060608)

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(0, 2, 5)
  camera.lookAt(0, 1.5, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type    = THREE.PCFShadowMap
  renderer.toneMapping       = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2

  const canvas = renderer.domElement
  canvas.draggable = false
  canvas.style.userSelect = 'none'
  canvas.addEventListener('dragstart', e => e.preventDefault())
  canvas.addEventListener('mousedown', e => e.preventDefault())
  container.appendChild(canvas)

  buildRoom()
  addNeonSign()
  setupLights()
  loadModels()
  animate()

  window.addEventListener('resize', onResize)
}

// ── Room geometry ─────────────────────────────────────────
function buildRoom() {
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x111116, roughness: 0.9, metalness: 0.1 })
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)

  const grid = new THREE.GridHelper(40, 40, 0x1a1a2e, 0x141420)
  grid.position.y = 0.002
  scene.add(grid)

  const wallMat = new THREE.MeshStandardMaterial({ color: 0x0c0c14, roughness: 1.0 })

  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(40, 14), wallMat)
  backWall.position.set(0, 7, -10)
  backWall.receiveShadow = true
  scene.add(backWall)

  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(24, 14), wallMat)
  leftWall.rotation.y = Math.PI / 2
  leftWall.position.set(-10, 7, 2)
  leftWall.receiveShadow = true
  scene.add(leftWall)

  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(24, 14), wallMat)
  rightWall.rotation.y = -Math.PI / 2
  rightWall.position.set(10, 7, 2)
  rightWall.receiveShadow = true
  scene.add(rightWall)

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(40, 24), wallMat)
  ceiling.rotation.x = Math.PI / 2
  ceiling.position.set(0, 10, -3)
  scene.add(ceiling)
}

// ── Neon sign on back wall ────────────────────────
function addNeonSign() {
  const W = 1024, H = 256
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')

  // Transparent background
  ctx.clearRect(0, 0, W, H)

  const drawText = (blur, alpha, size) => {
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.shadowColor   = '#ff5500'
    ctx.shadowBlur    = blur
    ctx.fillStyle     = '#ff8822'
    ctx.font          = `bold ${size}px 'Arial Black', sans-serif`
    ctx.textAlign     = 'center'
    ctx.textBaseline  = 'middle'
    ctx.letterSpacing = '8px'
    ctx.fillText('YANIS LAB', W / 2, H / 2)
    ctx.restore()
  }

  // Multiple passes: outer glow → mid → bright core
  drawText(80, 0.4, 110)
  drawText(40, 0.6, 110)
  drawText(15, 0.85, 110)
  drawText(4,  1.0,  110)

  const texture = new THREE.CanvasTexture(canvas)
  const mat  = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false })
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(7, 1.75), mat)
  sign.position.set(0, 4.5, -9.85)  // lower — visible from camera
  scene.add(sign)

  const glow1 = new THREE.PointLight(0xff5500, 6.0, 14, 1.8)
  glow1.position.set(0, 4.5, -9.0)
  scene.add(glow1)

  const glow2 = new THREE.PointLight(0xff7700, 3.5, 20, 2)
  glow2.position.set(0, 3.5, -8.0)
  scene.add(glow2)
}

// ── Lights ────────────────────────────────────────────────
function setupLights() {
  // Low ambient base
  scene.add(new THREE.AmbientLight(0x332244, 2.0))

  // Main warm key from above-front
  const key = new THREE.DirectionalLight(0xfff0d0, 3.0)
  key.position.set(1, 9, 6)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  key.shadow.camera.near   = 1
  key.shadow.camera.far    = 30
  key.shadow.camera.left   = -10
  key.shadow.camera.right  = 10
  key.shadow.camera.top    = 10
  key.shadow.camera.bottom = -10
  scene.add(key)

  // Cool fill from left
  const fillL = new THREE.DirectionalLight(0x88aacc, 1.5)
  fillL.position.set(-8, 5, 3)
  scene.add(fillL)

  // Warm fill from right
  const fillR = new THREE.DirectionalLight(0xddaa88, 1.5)
  fillR.position.set(8, 5, 3)
  scene.add(fillR)

  // Invisible warm spot above each object
  const objPositions = [POS.computer, POS.arcade, POS.gramophone]
  objPositions.forEach(({ x }) => {
    const warm = new THREE.PointLight(0xffdd88, 16.0, 10, 1.5)
    warm.position.set(x, 3.2, -1.8)
    warm.castShadow = true
    warm.shadow.mapSize.set(256, 256)
    scene.add(warm)

    const bounce = new THREE.PointLight(0xffcc66, 6.0, 6, 2)
    bounce.position.set(x, 0.8, -0.8)
    scene.add(bounce)
  })

  // Blue rim from back
  const rim = new THREE.PointLight(0x2244aa, 4.0, 18, 2)
  rim.position.set(0, 4, -9)
  scene.add(rim)
}

// ── Model helper ──────────────────────────────────────────
function placeModel(model, targetHeight, x, z, rotY = 0) {
  const box  = new THREE.Box3().setFromObject(model)
  const size = new THREE.Vector3()
  box.getSize(size)
  const scale = targetHeight / Math.max(size.x, size.y, size.z)
  model.scale.setScalar(scale)

  box.setFromObject(model)
  const center = new THREE.Vector3()
  box.getCenter(center)

  model.position.set(x - center.x, -box.min.y, z - center.z)
  model.rotation.y = rotY
  scene.add(model)
  model.updateMatrixWorld(true)
  return new THREE.Box3().setFromObject(model)
}

// ── Load models ───────────────────────────────────────────
function loadModels() {
  const loader = new GLTFLoader()
  const draco  = new DRACOLoader()
  draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')
  loader.setDRACOLoader(draco)

  let loaded = 0
  const total = 3
  const done  = () => { if (++loaded === total) { draco.dispose(); needsRender = true } }

  // Computer — center
  loader.load('/models/retro_crt_computer.glb', (gltf) => {
    const model = gltf.scene
    model.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true } })

    const box = placeModel(model, 2.2, POS.computer.x, POS.computer.z, 0)
    model.traverse(c => { if (c.isMesh) computerMeshes.push(c) })

    const center  = new THREE.Vector3()
    box.getCenter(center)
    const screenY = box.min.y + (box.max.y - box.min.y) * 0.65

    baseCamX = center.x;  baseCamY = screenY;  baseCamZ = center.z + 3.8
    baseLookX = center.x; baseLookY = screenY;  baseLookZ = center.z

    targetCamX  = baseCamX
    currentCamX = baseCamX
    camera.position.set(baseCamX, baseCamY, baseCamZ)
    camera.lookAt(baseLookX, baseLookY, baseLookZ)
    needsRender = true
    done()
  }, undefined, e => { console.error('Computer:', e); done() })

  // Arcade — right, 40° to the left
  loader.load('/models/pong_arcade_cabin.glb', (gltf) => {
    const model = gltf.scene
    model.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true } })
    placeModel(model, 2.5, POS.arcade.x, POS.arcade.z, 2 * Math.PI / 9)
    needsRender = true
    done()
  }, undefined, e => { console.error('Arcade:', e); done() })

  // Gramophone — left
  loader.load('/models/gramophone_on_the_table._low_poly.glb', (gltf) => {
    const model = gltf.scene
    model.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true } })
    placeModel(model, 2.0, POS.gramophone.x, POS.gramophone.z, Math.PI / 6)
    needsRender = true
    done()
  }, undefined, e => { console.error('Gramophone:', e); done() })
}

// ── Mouse ─────────────────────────────────────────────────
function onMouseMove(event) {
  if (!props.active || !camera || !raycaster) return
  const rect = containerRef.value.getBoundingClientRect()
  const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1
  targetCamX = baseCamX + nx * PARALLAX_RANGE

  if (computerMeshes.length > 0) {
    mouse2D.x =  nx
    mouse2D.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(mouse2D, camera)
    const hit = raycaster.intersectObjects(computerMeshes, true).length > 0
    cursorStyle.value = hit ? 'pointer' : 'default'
  }
}

function onCanvasClick(event) {
  if (!props.active || !camera || !raycaster || !computerMeshes.length) return
  const rect = containerRef.value.getBoundingClientRect()
  mouse2D.x =  ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse2D.y = -((event.clientY - rect.top)  / rect.height) * 2 + 1
  raycaster.setFromCamera(mouse2D, camera)
  if (raycaster.intersectObjects(computerMeshes, true).length > 0) zoomToScreen()
}

function zoomToScreen() {
  if (!camera) return
  const startZ = camera.position.z
  const startX = camera.position.x
  const startY = camera.position.y
  const targetZ = baseCamZ - 2.6
  const targetX = baseCamX
  const targetY = baseCamY + 0.1
  const dur = 1100
  const t0 = performance.now()

  function frame(ts) {
    const t = Math.min(1, (ts - t0) / dur)
    const e = t < 0.5 ? 2*t*t : -1+(4-2*t)*t  // easeInOut
    camera.position.z = startZ + (targetZ - startZ) * e
    camera.position.x = startX + (targetX - startX) * e
    camera.position.y = startY + (targetY - startY) * e
    camera.lookAt(baseLookX, baseLookY, baseLookZ)
    needsRender = true
    if (t < 1) requestAnimationFrame(frame)
    else emit('enter-computer')
  }
  requestAnimationFrame(frame)
}

// ── Resize ────────────────────────────────────────────────
function onResize() {
  if (!camera || !renderer) return
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  needsRender = true
}

// ── Render loop ───────────────────────────────────────────
function animate() {
  animationId = requestAnimationFrame(animate)

  if (Math.abs(currentCamX - targetCamX) > 0.001) {
    currentCamX += (targetCamX - currentCamX) * PARALLAX_SMOOTH
    camera.position.x = currentCamX
    camera.lookAt(baseLookX, baseLookY, baseLookZ)
    needsRender = true
  }

  if (needsRender) {
    renderer.render(scene, camera)
    needsRender = false
  }
}

// ── Lifecycle ─────────────────────────────────────────────
onMounted(() => {
  initScene()
  // Force renders while models load
  let count = 0
  const t = setInterval(() => {
    needsRender = true
    if (++count > 80) clearInterval(t)
  }, 100)
})

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('resize', onResize)
  if (renderer) {
    renderer.dispose()
    if (containerRef.value && renderer.domElement.parentNode === containerRef.value) {
      containerRef.value.removeChild(renderer.domElement)
    }
  }
})
</script>
