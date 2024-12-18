<template>
  <div class="scene-container">
    <BackButton />
    <canvas ref="canvasRef"></canvas>
    <div class="control-panel">
      <el-radio-group v-model="currentMode" @change="switchControlMode">
        <el-radio-button label="orbit">轨道控制</el-radio-button>
        <el-radio-button label="fly">飞行控制</el-radio-button>
        <el-radio-button label="first">第一人称</el-radio-button>
      </el-radio-group>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FlyControls } from 'three/examples/jsm/controls/FlyControls'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls'
import * as dat from 'dat.gui'
import BackButton from '@/components/common/BackButton.vue'

const canvasRef = ref(null)
const currentMode = ref('orbit')
let scene, camera, renderer, controls, gui
let currentControls = null

// GUI 控制参数
const params = {
  moveSpeed: 1.0,
  lookSpeed: 0.1,
  autoRotate: false,
  showAxes: true,
  axesSize: 10
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
  camera.position.set(5, 5, 5)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)

  // 创建参考物体
  createReferenceObjects()

  // 初始化控制器
  initControls()

  window.addEventListener('resize', onWindowResize)
}

function createReferenceObjects() {
  // 添加地面网格
  const gridHelper = new THREE.GridHelper(20, 20)
  scene.add(gridHelper)

  // 添加坐标轴
  const axesHelper = new THREE.AxesHelper(params.axesSize)
  axesHelper.visible = params.showAxes
  scene.add(axesHelper)

  // 添加一些立方体作为参考物
  const geometry = new THREE.BoxGeometry()
  const materials = [
    new THREE.MeshPhongMaterial({ color: 0x409EFF }),
    new THREE.MeshPhongMaterial({ color: 0x67C23A }),
    new THREE.MeshPhongMaterial({ color: 0xE6A23C })
  ]

  for (let i = 0; i < 10; i++) {
    const material = materials[i % materials.length]
    const cube = new THREE.Mesh(geometry, material)
    cube.position.set(
      (Math.random() - 0.5) * 10,
      Math.random() * 3,
      (Math.random() - 0.5) * 10
    )
    cube.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    )
    scene.add(cube)
  }

  // 添加光源
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(5, 5, 5)
  scene.add(directionalLight)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)
}

function initControls() {
  if (currentControls) {
    currentControls.dispose()
  }

  switch (currentMode.value) {
    case 'orbit':
      currentControls = new OrbitControls(camera, renderer.domElement)
      currentControls.enableDamping = true
      currentControls.autoRotate = params.autoRotate
      break
    
    case 'fly':
      currentControls = new FlyControls(camera, renderer.domElement)
      currentControls.movementSpeed = params.moveSpeed * 10
      currentControls.rollSpeed = params.lookSpeed
      currentControls.dragToLook = true
      break
    
    case 'first':
      currentControls = new FirstPersonControls(camera, renderer.domElement)
      currentControls.movementSpeed = params.moveSpeed * 5
      currentControls.lookSpeed = params.lookSpeed
      break
  }
}

function switchControlMode(mode) {
  currentMode.value = mode
  initControls()
}

function initGUI() {
  gui = new dat.GUI()

  const controlFolder = gui.addFolder('控制参数')
  controlFolder.add(params, 'moveSpeed', 0.1, 5).name('移动速度').onChange(updateControlParams)
  controlFolder.add(params, 'lookSpeed', 0.01, 0.5).name('视角速度').onChange(updateControlParams)
  controlFolder.add(params, 'autoRotate').name('自动旋转').onChange(updateControlParams)
  controlFolder.open()

  const visualFolder = gui.addFolder('视觉效果')
  visualFolder.add(params, 'showAxes').name('显示坐标轴').onChange(value => {
    const axesHelper = scene.children.find(child => child instanceof THREE.AxesHelper)
    if (axesHelper) {
      axesHelper.visible = value
    }
  })
  visualFolder.add(params, 'axesSize', 5, 20).name('坐标轴大小').onChange(value => {
    const axesHelper = scene.children.find(child => child instanceof THREE.AxesHelper)
    if (axesHelper) {
      axesHelper.scale.set(value / 10, value / 10, value / 10)
    }
  })
  visualFolder.open()
}

function updateControlParams() {
  if (!currentControls) return

  switch (currentMode.value) {
    case 'orbit':
      currentControls.autoRotate = params.autoRotate
      break
    case 'fly':
      currentControls.movementSpeed = params.moveSpeed * 10
      currentControls.rollSpeed = params.lookSpeed
      break
    case 'first':
      currentControls.movementSpeed = params.moveSpeed * 5
      currentControls.lookSpeed = params.lookSpeed
      break
  }
}

function animate() {
  requestAnimationFrame(animate)
  
  if (currentControls) {
    if (currentMode.value === 'orbit') {
      currentControls.update()
    } else {
      currentControls.update(0.1)
    }
  }

  renderer.render(scene, camera)
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)

  if (currentMode.value === 'first') {
    currentControls.handleResize()
  }
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

  .control-panel {
    position: fixed;
    top: 80px;
    left: calc(var(--menu-width) + 20px);
    z-index: 1000;
    background: rgba(255, 255, 255, 0.9);
    padding: 10px;
    border-radius: 4px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(8px);
  }
}
</style> 