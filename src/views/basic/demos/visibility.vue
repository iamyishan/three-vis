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
let objects = []

// GUI 控制参数
const params = {
  showCube: true,
  showSphere: true,
  showCone: true,
  rotationSpeed: 0.01,
  opacity: 1.0
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
  camera.position.z = 10

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  // 创建几何体
  const geometries = [
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.ConeGeometry(1, 2, 32)
  ]

  const materials = [
    new THREE.MeshPhongMaterial({ 
      color: 0x409EFF,
      transparent: true,
      opacity: params.opacity
    }),
    new THREE.MeshPhongMaterial({ 
      color: 0x67C23A,
      transparent: true,
      opacity: params.opacity
    }),
    new THREE.MeshPhongMaterial({ 
      color: 0xE6A23C,
      transparent: true,
      opacity: params.opacity
    })
  ]

  // 创建并定位物体
  const positions = [
    new THREE.Vector3(-3, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(3, 0, 0)
  ]

  geometries.forEach((geometry, i) => {
    const mesh = new THREE.Mesh(geometry, materials[i])
    mesh.position.copy(positions[i])
    mesh.name = ['立方体', '球体', '圆锥体'][i]
    objects.push(mesh)
    scene.add(mesh)
  })

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

  const visibilityFolder = gui.addFolder('显隐控制')
  visibilityFolder.add(params, 'showCube').name('显示立方体').onChange(updateVisibility)
  visibilityFolder.add(params, 'showSphere').name('显示球体').onChange(updateVisibility)
  visibilityFolder.add(params, 'showCone').name('显示圆锥体').onChange(updateVisibility)
  visibilityFolder.open()

  const effectFolder = gui.addFolder('效果控制')
  effectFolder.add(params, 'rotationSpeed', 0, 0.1).name('旋转速度')
  effectFolder.add(params, 'opacity', 0, 1).name('透明度').onChange(updateOpacity)
  effectFolder.open()
}

function updateVisibility() {
  objects[0].visible = params.showCube
  objects[1].visible = params.showSphere
  objects[2].visible = params.showCone
}

function updateOpacity() {
  objects.forEach(obj => {
    obj.material.opacity = params.opacity
  })
}

function animate() {
  requestAnimationFrame(animate)
  controls.update()

  objects.forEach(obj => {
    if (obj.visible) {
      obj.rotation.y += params.rotationSpeed
    }
  })

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