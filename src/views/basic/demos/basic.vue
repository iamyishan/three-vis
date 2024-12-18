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
  rotationSpeed: 0.01,
  color: '#409EFF',
  wireframe: false
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
  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf5f5f5)

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.set(3, 3, 5)
  camera.lookAt(0, 0, 0)

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)

  // 创建控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  // 添加立方体
  const geometry = new THREE.BoxGeometry()
  const material = new THREE.MeshPhongMaterial({ 
    color: params.color,
    wireframe: params.wireframe
  })
  const cube = new THREE.Mesh(geometry, material)
  scene.add(cube)

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
  
  gui.add(params, 'rotationSpeed', 0, 0.1).name('旋转速度')
  gui.addColor(params, 'color').name('颜色').onChange((value) => {
    const mesh = scene.children.find(child => child instanceof THREE.Mesh)
    if (mesh) {
      mesh.material.color.set(value)
    }
  })
  gui.add(params, 'wireframe').name('线框模式').onChange((value) => {
    const mesh = scene.children.find(child => child instanceof THREE.Mesh)
    if (mesh) {
      mesh.material.wireframe = value
    }
  })
}

function animate() {
  requestAnimationFrame(animate)
  controls.update()

  // 更新场景
  const mesh = scene.children.find(child => child instanceof THREE.Mesh)
  if (mesh) {
    mesh.rotation.x += params.rotationSpeed
    mesh.rotation.y += params.rotationSpeed
  }

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