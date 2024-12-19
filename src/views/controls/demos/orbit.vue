<template>
  <div class="scene-container">
    <BackButton />
    <canvas ref="canvasRef"></canvas>
    <div class="control-panel">
      <el-button-group>
        <el-button 
          type="primary" 
          size="small"
          @click="resetCamera"
        >
          重置视角
        </el-button>
        <el-button 
          type="warning" 
          size="small"
          @click="toggleAutoRotate"
        >
          {{ params.autoRotate ? '停止旋转' : '开始旋转' }}
        </el-button>
      </el-button-group>
    </div>
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
  // 基础控制
  enableDamping: true,
  dampingFactor: 0.05,
  enableZoom: true,
  zoomSpeed: 1.0,
  enableRotate: true,
  rotateSpeed: 1.0,
  enablePan: true,
  panSpeed: 1.0,
  
  // 自动旋转
  autoRotate: false,
  autoRotateSpeed: 2.0,
  
  // 限制
  minDistance: 5,
  maxDistance: 20,
  minPolarAngle: 0,
  maxPolarAngle: Math.PI,
  minAzimuthAngle: -Infinity,
  maxAzimuthAngle: Infinity,
  
  // 视觉效果
  showAxes: true,
  axesSize: 5,
  showGrid: true,
  gridSize: 10
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
  camera.position.set(10, 5, 10)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)

  // 初始化控制器
  controls = new OrbitControls(camera, renderer.domElement)
  updateControlParams()

  // 创建参考物体
  createReferenceObjects()

  window.addEventListener('resize', onWindowResize)
}

function createReferenceObjects() {
  // 添加网格地面
  if (params.showGrid) {
    const gridHelper = new THREE.GridHelper(params.gridSize, 10)
    scene.add(gridHelper)
  }

  // 添加坐标轴
  const axesHelper = new THREE.AxesHelper(params.axesSize)
  axesHelper.visible = params.showAxes
  scene.add(axesHelper)

  // 创建一些几何体
  const geometries = [
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.ConeGeometry(1, 2, 32),
    new THREE.TorusGeometry(1, 0.4, 16, 100)
  ]

  const materials = [
    new THREE.MeshPhongMaterial({ color: 0x409EFF }),
    new THREE.MeshPhongMaterial({ color: 0x67C23A }),
    new THREE.MeshPhongMaterial({ color: 0xE6A23C }),
    new THREE.MeshPhongMaterial({ color: 0xF56C6C })
  ]

  const positions = [
    new THREE.Vector3(-2, 1, -2),
    new THREE.Vector3(2, 1, -2),
    new THREE.Vector3(-2, 1, 2),
    new THREE.Vector3(2, 1, 2)
  ]

  geometries.forEach((geometry, i) => {
    const mesh = new THREE.Mesh(geometry, materials[i])
    mesh.position.copy(positions[i])
    scene.add(mesh)
  })

  // 添加光源
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(5, 5, 5)
  scene.add(directionalLight)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)
}

function initGUI() {
  gui = new dat.GUI()

  const basicFolder = gui.addFolder('基础控制')
  basicFolder.add(params, 'enableDamping').name('启用阻尼').onChange(updateControlParams)
  basicFolder.add(params, 'dampingFactor', 0.01, 0.1).name('阻尼系数').onChange(updateControlParams)
  basicFolder.add(params, 'enableZoom').name('启用缩放').onChange(updateControlParams)
  basicFolder.add(params, 'zoomSpeed', 0.1, 3).name('缩放速度').onChange(updateControlParams)
  basicFolder.add(params, 'enableRotate').name('启用旋转').onChange(updateControlParams)
  basicFolder.add(params, 'rotateSpeed', 0.1, 3).name('旋转速度').onChange(updateControlParams)
  basicFolder.add(params, 'enablePan').name('启用平移').onChange(updateControlParams)
  basicFolder.add(params, 'panSpeed', 0.1, 3).name('平移速度').onChange(updateControlParams)
  basicFolder.open()

  const autoRotateFolder = gui.addFolder('自动旋转')
  autoRotateFolder.add(params, 'autoRotate').name('启用自动旋转').onChange(updateControlParams)
  autoRotateFolder.add(params, 'autoRotateSpeed', 0.1, 5).name('旋转速度').onChange(updateControlParams)
  autoRotateFolder.open()

  const limitFolder = gui.addFolder('限制设置')
  limitFolder.add(params, 'minDistance', 1, 10).name('最小距离').onChange(updateControlParams)
  limitFolder.add(params, 'maxDistance', 10, 50).name('最大距离').onChange(updateControlParams)
  limitFolder.add(params, 'minPolarAngle', 0, Math.PI).name('最小极角').onChange(updateControlParams)
  limitFolder.add(params, 'maxPolarAngle', 0, Math.PI).name('最大极角').onChange(updateControlParams)
  limitFolder.open()

  const visualFolder = gui.addFolder('视觉效果')
  visualFolder.add(params, 'showAxes').name('显示坐标轴').onChange(value => {
    const axesHelper = scene.children.find(child => child instanceof THREE.AxesHelper)
    if (axesHelper) {
      axesHelper.visible = value
    }
  })
  visualFolder.add(params, 'axesSize', 1, 10).name('坐标轴大小').onChange(value => {
    const axesHelper = scene.children.find(child => child instanceof THREE.AxesHelper)
    if (axesHelper) {
      axesHelper.scale.set(value / 5, value / 5, value / 5)
    }
  })
  visualFolder.open()
}

function updateControlParams() {
  if (!controls) return

  controls.enableDamping = params.enableDamping
  controls.dampingFactor = params.dampingFactor
  controls.enableZoom = params.enableZoom
  controls.zoomSpeed = params.zoomSpeed
  controls.enableRotate = params.enableRotate
  controls.rotateSpeed = params.rotateSpeed
  controls.enablePan = params.enablePan
  controls.panSpeed = params.panSpeed
  
  controls.autoRotate = params.autoRotate
  controls.autoRotateSpeed = params.autoRotateSpeed
  
  controls.minDistance = params.minDistance
  controls.maxDistance = params.maxDistance
  controls.minPolarAngle = params.minPolarAngle
  controls.maxPolarAngle = params.maxPolarAngle
  controls.minAzimuthAngle = params.minAzimuthAngle
  controls.maxAzimuthAngle = params.maxAzimuthAngle
}

function resetCamera() {
  camera.position.set(10, 5, 10)
  camera.lookAt(0, 0, 0)
  controls.target.set(0, 0, 0)
  controls.update()
}

function toggleAutoRotate() {
  params.autoRotate = !params.autoRotate
  controls.autoRotate = params.autoRotate
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