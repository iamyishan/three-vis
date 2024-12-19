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
          @click="toggleTopView"
        >
          {{ isTopView ? '恢复视角' : '切换俯视' }}
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
const isTopView = ref(false)

let scene, camera, renderer, controls, gui
let terrain = null

// GUI 控制参数
const params = {
  enableDamping: true,
  dampingFactor: 0.05,
  screenSpacePanning: true,
  minDistance: 5,
  maxDistance: 100,
  minPolarAngle: 0,
  maxPolarAngle: Math.PI / 2.1,
  enableRotate: true,
  showGrid: true,
  gridSize: 100,
  gridDivisions: 100,
  terrainHeight: 5,
  terrainDetail: 100
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
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.set(50, 50, 50)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)

  // 初始化地图控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = params.enableDamping
  controls.dampingFactor = params.dampingFactor
  controls.screenSpacePanning = true
  controls.minDistance = params.minDistance
  controls.maxDistance = params.maxDistance
  controls.minPolarAngle = params.minPolarAngle
  controls.maxPolarAngle = params.maxPolarAngle
  controls.enableRotate = params.enableRotate
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.PAN,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.ROTATE
  }

  // 创建场景内容
  createTerrain()
  createGrid()

  window.addEventListener('resize', onWindowResize)
}

function createTerrain() {
  const geometry = new THREE.PlaneGeometry(
    params.gridSize,
    params.gridSize,
    params.terrainDetail,
    params.terrainDetail
  )

  // 生成随机地形
  const vertices = geometry.attributes.position.array
  for (let i = 0; i < vertices.length; i += 3) {
    vertices[i + 1] = Math.random() * params.terrainHeight
  }

  const material = new THREE.MeshPhongMaterial({
    color: 0x409EFF,
    wireframe: false,
    side: THREE.DoubleSide,
    flatShading: true
  })

  terrain = new THREE.Mesh(geometry, material)
  terrain.rotation.x = -Math.PI / 2
  scene.add(terrain)

  // 添加光源
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(1, 1, 1)
  scene.add(directionalLight)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)
}

function createGrid() {
  if (params.showGrid) {
    const gridHelper = new THREE.GridHelper(
      params.gridSize,
      params.gridDivisions,
      0x000000,
      0x888888
    )
    gridHelper.position.y = 0.1
    scene.add(gridHelper)
  }
}

function initGUI() {
  gui = new dat.GUI()

  const controlsFolder = gui.addFolder('控制器设置')
  controlsFolder.add(params, 'enableDamping').name('启用阻尼').onChange(updateControls)
  controlsFolder.add(params, 'dampingFactor', 0.01, 0.1).name('阻尼系数').onChange(updateControls)
  controlsFolder.add(params, 'screenSpacePanning').name('屏幕空间平移').onChange(updateControls)
  controlsFolder.add(params, 'enableRotate').name('启用旋转').onChange(updateControls)
  controlsFolder.open()

  const limitsFolder = gui.addFolder('限制设置')
  limitsFolder.add(params, 'minDistance', 1, 50).name('最小距离').onChange(updateControls)
  limitsFolder.add(params, 'maxDistance', 50, 200).name('最大距离').onChange(updateControls)
  limitsFolder.add(params, 'minPolarAngle', 0, Math.PI / 2).name('最小极角').onChange(updateControls)
  limitsFolder.add(params, 'maxPolarAngle', 0, Math.PI).name('最大极角').onChange(updateControls)
  limitsFolder.open()

  const terrainFolder = gui.addFolder('地形设置')
  terrainFolder.add(params, 'terrainHeight', 0, 20).name('地形高度').onChange(updateTerrain)
  terrainFolder.add(params, 'terrainDetail', 10, 200, 1).name('地形细节').onChange(updateTerrain)
  terrainFolder.open()
}

function updateControls() {
  controls.enableDamping = params.enableDamping
  controls.dampingFactor = params.dampingFactor
  controls.screenSpacePanning = params.screenSpacePanning
  controls.minDistance = params.minDistance
  controls.maxDistance = params.maxDistance
  controls.minPolarAngle = params.minPolarAngle
  controls.maxPolarAngle = params.maxPolarAngle
  controls.enableRotate = params.enableRotate
}

function updateTerrain() {
  if (!terrain) return

  scene.remove(terrain)
  createTerrain()
}

function resetCamera() {
  camera.position.set(50, 50, 50)
  camera.lookAt(0, 0, 0)
  controls.target.set(0, 0, 0)
  isTopView.value = false
}

function toggleTopView() {
  if (isTopView.value) {
    resetCamera()
  } else {
    camera.position.set(0, 100, 0)
    camera.lookAt(0, 0, 0)
    controls.target.set(0, 0, 0)
    isTopView.value = true
  }
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