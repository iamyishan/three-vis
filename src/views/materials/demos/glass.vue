<template>
  <div class="scene-container">
    <BackButton />
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'
import BackButton from '@/components/common/BackButton.vue'

const canvasRef = ref(null)
let scene, camera, renderer, controls, gui

// GUI 控制参数
const params = {
  roughness: 0.1,
  metalness: 0.9,
  transmission: 0.9,
  thickness: 0.5,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
  ior: 1.5
}

onMounted(() => {
  initScene()
  initGUI()
  animate()
})

onBeforeUnmount(() => {
  if (renderer) {
    renderer.dispose()
  }
  if (gui) {
    gui.destroy()
  }
  window.removeEventListener('resize', onWindowResize)
})

function initScene() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf5f5f5)

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.set(3, 3, 5)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.physicallyCorrectLights = true
  renderer.toneMapping = THREE.ACESFilmicToneMapping

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  // 创建玻璃材质
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    roughness: params.roughness,
    metalness: params.metalness,
    transmission: params.transmission,
    thickness: params.thickness,
    clearcoat: params.clearcoat,
    clearcoatRoughness: params.clearcoatRoughness,
    ior: params.ior,
    transparent: true
  })

  // 创建几何体
  const geometry = new THREE.SphereGeometry(1, 32, 32)
  const sphere = new THREE.Mesh(geometry, glassMaterial)
  scene.add(sphere)

  // 添加环境贴图
  const envMapLoader = new THREE.CubeTextureLoader()
  const envMap = envMapLoader.load([
    '/textures/env/px.jpg',
    '/textures/env/nx.jpg',
    '/textures/env/py.jpg',
    '/textures/env/ny.jpg',
    '/textures/env/pz.jpg',
    '/textures/env/nz.jpg'
  ])
  scene.environment = envMap
  scene.background = envMap

  // 添加光源
  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(1, 1, 1)
  scene.add(light)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)

  window.addEventListener('resize', onWindowResize)
}

function initGUI() {
  gui = new dat.GUI()
  
  gui.add(params, 'roughness', 0, 1).onChange(updateMaterial)
  gui.add(params, 'metalness', 0, 1).onChange(updateMaterial)
  gui.add(params, 'transmission', 0, 1).onChange(updateMaterial)
  gui.add(params, 'thickness', 0, 5).onChange(updateMaterial)
  gui.add(params, 'clearcoat', 0, 1).onChange(updateMaterial)
  gui.add(params, 'clearcoatRoughness', 0, 1).onChange(updateMaterial)
  gui.add(params, 'ior', 1, 2.333).onChange(updateMaterial)
}

function updateMaterial() {
  const material = scene.children.find(child => child instanceof THREE.Mesh).material
  Object.assign(material, params)
}

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
</script>

<style lang="scss" scoped>
.scene-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  
  canvas {
    width: 100% !important;
    height: 100% !important;
  }
}
</style> 