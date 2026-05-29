<template>
  <div class="scene3d-root" ref="containerRef" @mousemove="onMouseMove">
    <!-- Loading screen -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <div class="loading-text">Entering the office...</div>
        <div class="loading-bar-track">
          <div
            class="loading-bar-fill"
            :style="{ width: loadProgress + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Renderers container -->
    <div ref="rendererContainer" class="renderer-container"></div>

    <!-- Orbit control overlay — captures mouse for 3D navigation -->
    <div
      ref="controlsOverlayRef"
      class="controls-overlay"
      :class="{ 'controls-disabled': isOverScreen }"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/examples/jsm/renderers/CSS3DRenderer.js";

// Refs
const containerRef = ref(null);
const rendererContainer = ref(null);
const controlsOverlayRef = ref(null);
const loading = ref(true);
const loadProgress = ref(0);
const hintsVisible = ref(false);

// Interaction state
const isOverScreen = ref(false);
let isZoomingOut = false;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const savedCameraPos = new THREE.Vector3();
const savedControlsTarget = new THREE.Vector3();
const targetCameraPos = new THREE.Vector3();
const targetControlsTarget = new THREE.Vector3();

// Three.js objects (non-reactive)
let scene, camera, webglRenderer, css3dRenderer;
let controls;
let screenMesh = null;
let screenPlane = null; // Invisible plane for raycasting
let animationFrameId = null;
let clock = new THREE.Clock();
let mixer = null;

// Base URL for the iframe
const baseUrl = import.meta.env.BASE_URL || "/";
const desktopUrl = computed(
  () => window.location.origin + baseUrl + "#/desktop",
);

onMounted(async () => {
  await nextTick();
  initScene();
  createRoom();
  setupLighting();
  await loadModel();

  // Calculate screen corners after model loaded
  if (screenMesh) {
    calculateScreenCorners();
  }

  animate();
  loading.value = false;

  // Show hints after a short delay
  setTimeout(() => {
    hintsVisible.value = true;
    setTimeout(() => {
      hintsVisible.value = false;
    }, 6000);
  }, 800);
});

onBeforeUnmount(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  if (controls) controls.dispose();
  if (webglRenderer) webglRenderer.dispose();
  window.removeEventListener("resize", onResize);
});

function initScene() {
  const container = rendererContainer.value;
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);
  scene.fog = new THREE.Fog(0xf0f0f0, 10, 25);

  // Camera
  camera = new THREE.PerspectiveCamera(42, width / height, 0.01, 100);
  camera.position.set(0, 1.55, 2.6);
  camera.lookAt(0, 0.95, 0);

  // WebGL Renderer
  webglRenderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });
  webglRenderer.setSize(width, height);
  webglRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  webglRenderer.shadowMap.enabled = true;
  webglRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
  webglRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  webglRenderer.toneMappingExposure = 1.0;
  webglRenderer.domElement.style.position = "absolute";
  webglRenderer.domElement.style.top = "0";
  webglRenderer.domElement.style.left = "0";
  webglRenderer.domElement.style.zIndex = "0";

  // CSS3D Renderer (ON TOP of WebGL)
  css3dRenderer = new CSS3DRenderer();
  css3dRenderer.setSize(width, height);
  css3dRenderer.domElement.style.position = "absolute";
  css3dRenderer.domElement.style.top = "0";
  css3dRenderer.domElement.style.left = "0";
  css3dRenderer.domElement.style.zIndex = "1"; // Render over the WebGL scene

  // Add renderers to container
  container.appendChild(webglRenderer.domElement);
  container.appendChild(css3dRenderer.domElement);

  // OrbitControls — attach to controlsOverlayRef
  controls = new OrbitControls(camera, controlsOverlayRef.value);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.set(0, 0.95, 0);
  controls.minDistance = 1.5;
  controls.maxDistance = 5;
  controls.minPolarAngle = Math.PI * 0.2;
  controls.maxPolarAngle = Math.PI * 0.52;
  controls.minAzimuthAngle = -Math.PI * 0.35;
  controls.maxAzimuthAngle = Math.PI * 0.35;
  controls.enablePan = false;
  controls.update();

  window.addEventListener("resize", onResize);

  // Temporary debug helper: double click to find mesh name
  window.addEventListener("dblclick", (event) => {
    const clickMouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1,
    );
    const clickRaycaster = new THREE.Raycaster();
    clickRaycaster.setFromCamera(clickMouse, camera);
    const intersects = clickRaycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
      alert("Le nom de cet objet est : " + intersects[0].object.name);
    }
  });
}

function createRoom() {
  // Floor
  const floorGeo = new THREE.PlaneGeometry(14, 14);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0xe8e8e8,
    roughness: 0.85,
    metalness: 0.0,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  scene.add(floor);

  // Back wall
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xf2f2f2,
    roughness: 0.95,
    metalness: 0.0,
  });
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(14, 7), wallMat);
  backWall.position.set(0, 3.5, -4);
  backWall.receiveShadow = true;
  scene.add(backWall);

  // Left wall
  const leftWall = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 7),
    wallMat.clone(),
  );
  leftWall.position.set(-7, 3.5, 0);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.receiveShadow = true;
  scene.add(leftWall);

  // Right wall
  const rightWall = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 7),
    wallMat.clone(),
  );
  rightWall.position.set(7, 3.5, 0);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.receiveShadow = true;
  scene.add(rightWall);

  // Ceiling
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 14),
    new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 1.0 }),
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 7;
  scene.add(ceiling);

  // Baseboard trim
  const baseboard = new THREE.Mesh(
    new THREE.BoxGeometry(14, 0.08, 0.04),
    new THREE.MeshStandardMaterial({ color: 0xdcdcdc, roughness: 0.5 }),
  );
  baseboard.position.set(0, 0.04, -3.98);
  scene.add(baseboard);
}

function setupLighting() {
  // Ambient fill
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));

  // Main directional light with shadows
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(2, 5, 3);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 20;
  dirLight.shadow.camera.left = -5;
  dirLight.shadow.camera.right = 5;
  dirLight.shadow.camera.top = 5;
  dirLight.shadow.camera.bottom = -5;
  dirLight.shadow.bias = -0.0003;
  dirLight.shadow.normalBias = 0.02;
  dirLight.shadow.radius = 4;
  scene.add(dirLight);

  // Fill light from the left
  const fillLight = new THREE.DirectionalLight(0xe8f0ff, 0.4);
  fillLight.position.set(-3, 3, 1);
  scene.add(fillLight);

  // Screen glow
  const screenGlow = new THREE.PointLight(0x4488ff, 0.4, 3);
  screenGlow.position.set(0, 1.2, -0.3);
  scene.add(screenGlow);

  // Hemisphere light for ambient
  scene.add(new THREE.HemisphereLight(0xffffff, 0xe0e0e0, 0.3));
}

async function loadModel() {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();

    loader.load(
      baseUrl + "3d-model/gamersetup.gltf",
      (gltf) => {
        const model = gltf.scene;

        // Adjust scale
        model.scale.set(0.35, 0.35, 0.35);
        model.position.set(0, 0, 0);

        // Update matrix to calculate bounds correctly
        model.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(model);

        // Auto-align to floor: push the model up so its lowest point rests exactly at y=0
        // Nudged down slightly as requested
        model.position.y += -box.min.y - 0.2;

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            // Find and darken the screen mesh
            if (
              child.name === "Cube001_Material055_0" ||
              child.name === "MY SCREEN_MY SCREEN_0" ||
              child.name === "sm_monitor_mt_monitor_screen_0"
            ) {
              screenMesh = child;
              child.material = new THREE.MeshBasicMaterial({
                color: 0x050505, // Almost black
                side: THREE.DoubleSide,
              });
            }
          }
        });

        // Play animations (fans spinning)
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play();
          });
        }

        scene.add(model);
        loadProgress.value = 100;
        resolve();
      },
      (progress) => {
        if (progress.total > 0) {
          loadProgress.value = Math.round(
            (progress.loaded / progress.total) * 100,
          );
        }
      },
      (error) => {
        console.error("Error loading 3D model:", error);
        loadProgress.value = 100;
        resolve();
      },
    );
  });
}

function calculateScreenCorners() {
  if (!screenMesh) return;

  // We don't use this anymore, we just setup the iframe using local bounds
  setupScreenIframe();
}

function setupScreenIframe() {
  screenMesh.updateWorldMatrix(true, false);

  const posAttr = screenMesh.geometry.attributes.position;
  const v = new THREE.Vector3();

  let minX = Infinity,
    maxX = -Infinity;
  let minY = Infinity,
    maxY = -Infinity;
  let minZ = Infinity,
    maxZ = -Infinity;

  let topV = new THREE.Vector3(0, -Infinity, 0);
  let bottomV = new THREE.Vector3(0, Infinity, 0);
  let leftV = new THREE.Vector3(Infinity, 0, 0);
  let rightV = new THREE.Vector3(-Infinity, 0, 0);

  for (let i = 0; i < posAttr.count; i++) {
    v.fromBufferAttribute(posAttr, i).applyMatrix4(screenMesh.matrixWorld);

    if (v.x < minX) minX = v.x;
    if (v.x > maxX) maxX = v.x;
    if (v.y < minY) minY = v.y;
    if (v.y > maxY) maxY = v.y;
    if (v.z < minZ) minZ = v.z;
    if (v.z > maxZ) maxZ = v.z;

    if (v.y > topV.y) topV.copy(v);
    if (v.y < bottomV.y) bottomV.copy(v);
    if (v.x < leftV.x) leftV.copy(v);
    if (v.x > rightV.x) rightV.copy(v);
  }

  // Calculate exact physical dimensions
  const screenWidth = leftV.distanceTo(rightV);
  const screenHeight = bottomV.distanceTo(topV);
  // Calculate center using bounding box
  const centerWorld = new THREE.Vector3(
    (minX + maxX) / 2,
    (minY + maxY) / 2,
    (minZ + maxZ) / 2,
  );

  // Extract true world rotation from the mesh
  const worldQuat = new THREE.Quaternion();
  screenMesh.getWorldQuaternion(worldQuat);

  // The mesh's local rotation makes the screen lie flat (Z is up).
  // We rotate it 90 degrees around its local X axis to make it stand up.
  // Using Math.PI / 2 (positive) to ensure it is right-side up.
  const fixRotation = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(1, 0, 0),
    Math.PI / 2,
  );
  worldQuat.multiply(fixRotation);

  // Extract Euler angles for tweaking if needed
  const euler = new THREE.Euler().setFromQuaternion(worldQuat, "XYZ");
  const tiltAngle = euler.x;
  const yawAngle = euler.y;

  // Define normal vector pointing forward (used for camera zoom)
  const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(worldQuat);

  // --- Center the camera on the screen by default ---
  controls.target.copy(centerWorld);
  // Position the camera slightly above and in front of the screen
  const defaultDistance = 2.8; // Start zoomed out to see the whole setup
  const initialPos = centerWorld
    .clone()
    .add(normal.clone().multiplyScalar(defaultDistance));
  initialPos.y += 0.5; // look slightly down at it
  camera.position.copy(initialPos);
  controls.update();
  // -------------------------------------------------


  // Match the iframe aspect ratio to the physical screen
  // Since the mesh includes some bezels, we reduce the coverage to fit inside
  const screenCoverageX = 0.855; // 85.5% of the mesh width (+1.5%)
  const screenCoverageY = 0.48; // 48% of the mesh height (+1%)

  const innerWidth = screenWidth * screenCoverageX;
  const innerHeight = screenHeight * screenCoverageY;

  const wrapperHeight = 720;
  const monitorAspect = innerWidth / innerHeight;
  const wrapperWidth = Math.round(wrapperHeight * monitorAspect);

  const iframe = document.createElement("iframe");
  iframe.src = window.location.origin + baseUrl + "#/desktop";
  iframe.style.width = wrapperWidth + "px";
  iframe.style.height = wrapperHeight + "px";
  iframe.style.border = "none";
  iframe.style.backgroundColor = "#000";
  iframe.style.overflow = "hidden";
  iframe.style.borderRadius = "2px";

  const wrapper = document.createElement("div");
  wrapper.style.width = wrapperWidth + "px";
  wrapper.style.height = wrapperHeight + "px";
  wrapper.style.backgroundColor = "#000";
  wrapper.style.boxShadow = "0 0 40px rgba(68, 136, 255, 0.15)";
  wrapper.appendChild(iframe);

  // Mouse hover logic handles zooming out automatically now.

  const css3dObject = new CSS3DObject(wrapper);
  css3dObject.position.copy(centerWorld);

  // Apply true world rotation
  css3dObject.quaternion.copy(worldQuat);

  // Since the mesh has some thickness, using its total depth pushes it too far forward.
  // We just apply a tiny fixed nudge to prevent Z-fighting with the glass.
  css3dObject.translateZ(0.002);

  // Nudge slightly left and up as requested
  css3dObject.translateX(0.004);
  css3dObject.translateY(0.01);

  // Scale down to fit the actual screen area inside the bezels
  const uniformScale = innerHeight / wrapperHeight;
  css3dObject.scale.set(uniformScale, uniformScale, uniformScale);

  scene.add(css3dObject);

  // Invisible plane for raycasting
  const planeGeo = new THREE.PlaneGeometry(innerWidth, innerHeight);
  const planeMat = new THREE.MeshBasicMaterial({
    visible: false,
    side: THREE.DoubleSide,
  });
  screenPlane = new THREE.Mesh(planeGeo, planeMat);
  screenPlane.position.copy(centerWorld);
  screenPlane.quaternion.copy(worldQuat);
  screenPlane.translateZ(0.002); // Match the tiny fixed nudge
  screenPlane.translateX(0.004); // Match the left/right nudge
  screenPlane.translateY(0.01); // Match the up nudge

  // Calculate dynamic perfect zoom distance to fit screen in FOV
  // Use innerHeight so it perfectly frames the glass part
  const fovInRads = (camera.fov * Math.PI) / 180;
  const zoomDistance = innerHeight / 2 / Math.tan(fovInRads / 2);

  // Target the exact center of the shifted iframe, not the original mesh bounds
  const iframeCenter = screenPlane.position.clone();

  targetControlsTarget.copy(iframeCenter);
  // 1.05 multiplier gives a nice 5% padding around the screen
  targetCameraPos
    .copy(iframeCenter)
    .add(normal.clone().multiplyScalar(zoomDistance * 1.05));

  scene.add(screenPlane);
}

function onMouseMove(event) {
  if (isZoomingOut) return; // Ignore raycasting while animating out

  if (!containerRef.value || !screenPlane) return;

  const rect = containerRef.value.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(screenPlane);

  if (intersects.length > 0) {
    if (!isOverScreen.value) {
      // Enter screen
      isOverScreen.value = true;
      controls.enabled = false;

      // Save current camera transform before zooming in
      savedCameraPos.copy(camera.position);
      savedControlsTarget.copy(controls.target);
    }
  } else {
    if (isOverScreen.value) {
      // Mouse left the screen area
      isOverScreen.value = false;
      isZoomingOut = true;
    }
  }
}

function onResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  if (webglRenderer) webglRenderer.setSize(width, height);
  if (css3dRenderer) css3dRenderer.setSize(width, height);
}

function animate() {
  animationFrameId = requestAnimationFrame(animate);

  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);

  // Smooth camera transitions for zoom in/out
  if (isOverScreen.value) {
    camera.position.lerp(targetCameraPos, 0.08);
    controls.target.lerp(targetControlsTarget, 0.08);
    camera.lookAt(controls.target);
  } else if (isZoomingOut) {
    camera.position.lerp(savedCameraPos, 0.08);
    controls.target.lerp(savedControlsTarget, 0.08);
    camera.lookAt(controls.target);

    // Once we are close to the original position, stop animating and hand back to OrbitControls
    if (camera.position.distanceTo(savedCameraPos) < 0.01) {
      isZoomingOut = false;
      controls.enabled = true;
    }
  } else {
    // Standard orbit controls update
    if (controls) controls.update();
  }

  if (webglRenderer) webglRenderer.render(scene, camera);
  if (css3dRenderer) css3dRenderer.render(scene, camera);
}
</script>

<style>
.scene3d-root {
  position: absolute;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  cursor: grab;
  background-color: #f0f0f0;
}

.scene3d-root:active {
  cursor: grabbing;
}

.renderer-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* Controls overlay — on top of everything, transparent, captures orbit events */
.controls-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  cursor: grab;
}

.controls-overlay:active {
  cursor: grabbing;
}

.controls-overlay.controls-disabled {
  pointer-events: none;
}

/* Loading overlay */
.loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 1000;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #4488ff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: rgba(255, 255, 255, 0.8);
  font-family: "Inter", "Segoe UI", sans-serif;
  font-size: 16px;
  font-weight: 300;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.loading-bar-track {
  width: 200px;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.loading-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #4488ff, #66aaff);
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* Hints overlay */
.scene-hints {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  gap: 24px;
  padding: 12px 24px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

.scene-hints.hints-visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.85);
  font-family: "Inter", "Segoe UI", sans-serif;
  font-size: 13px;
  font-weight: 400;
  white-space: nowrap;
}

.hint-icon {
  font-size: 16px;
}
</style>
