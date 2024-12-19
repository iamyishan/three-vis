<template>
  <div class="scene-container">
    <BackButton />
    <canvas ref="canvasRef"></canvas>
    <div class="control-panel">
      <el-radio-group v-model="transformMode" @change="updateTransformMode">
        <el-radio-button label="translate">平移</el-radio-button>
        <el-radio-button label="rotate">旋转</el-radio-button>
        <el-radio-button label="scale">缩放</el-radio-button>
      </el-radio-group>
      <el-button-group class="space-mode">
        <el-button 
          type="primary" 
          size="small"
          :class="{ active: spaceMode === 'local' }"
          @click="toggleSpaceMode"
        >
          {{ spaceMode === 'local' ? '本地坐标' : '世界坐标' }}
        </el-button>
        <el-button
          type="warning"
          size="small"
          @click="resetSelectedObject"
        >
          重置状态
        </el-button>
      </el-button-group>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import * as dat from 'dat.gui'
import BackButton from '@/components/common/BackButton.vue'

const canvasRef = ref(null)
const transformMode = ref('translate')
const spaceMode = ref('local')

let scene, camera, renderer, orbitControls, transformControls, gui
let selectedObject = null

// GUI 控制参数
const params = {
  showAxes: true,
  axesSize: 5,
  showGrid: true,
  gridSize: 10,
  snapEnabled: false,
  translationSnap: 1,
  rotationSnap: Math.PI / 4,
  scaleSnap: 0.1
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

  // 初始化控制器
  orbitControls = new OrbitControls(camera, renderer.domElement)
  orbitControls.enableDamping = true

  transformControls = new TransformControls(camera, renderer.domElement)
  transformControls.addEventListener('dragging-changed', event => {
    orbitControls.enabled = !event.value
  })
  scene.add(transformControls)

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

  // 创建不同的几何体
  const geometries = [
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.SphereGeometry(0.5, 32, 32),
    new THREE.ConeGeometry(0.5, 1, 32),
    new THREE.TorusGeometry(0.5, 0.2, 16, 100)
  ]

  const materials = [
    new THREE.MeshPhongMaterial({ color: 0x409EFF }),
    new THREE.MeshPhongMaterial({ color: 0x67C23A }),
    new THREE.MeshPhongMaterial({ color: 0xE6A23C }),
    new THREE.MeshPhongMaterial({ color: 0xF56C6C })
  ]

  const positions = [
    new THREE.Vector3(-2, 0, -2),
    new THREE.Vector3(2, 0, -2),
    new THREE.Vector3(-2, 0, 2),
    new THREE.Vector3(2, 0, 2)
  ]

  geometries.forEach((geometry, i) => {
    const mesh = new THREE.Mesh(geometry, materials[i])
    mesh.position.copy(positions[i])
    mesh.name = ['立方体', '球体', '圆锥体', '圆环'][i]
    mesh.userData.originalPosition = positions[i].clone()
    mesh.userData.originalRotation = new THREE.Euler(0, 0, 0)
    mesh.userData.originalScale = new THREE.Vector3(1, 1, 1)
    scene.add(mesh)

    // 默认选中第一个物体
    if (i === 0) {
      selectedObject = mesh
      transformControls.attach(mesh)
    }
  })

  // 添加光源
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(5, 5, 5)
  scene.add(directionalLight)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)

  // 添加点击事件
  renderer.domElement.addEventListener('click', onObjectClick)
}

function onObjectClick(event) {
  const mouse = new THREE.Vector2()
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)

  const intersects = raycaster.intersectObjects(scene.children)
  
  if (intersects.length > 0) {
    const object = intersects[0].object
    if (object.isMesh) {
      selectedObject = object
      transformControls.attach(object)
    }
  }
}

function initGUI() {
  gui = new dat.GUI()

  const transformFolder = gui.addFolder('变换控制')
  transformFolder.add(params, 'snapEnabled').name('启用吸附').onChange(updateSnapping)
  transformFolder.add(params, 'translationSnap', 0.1, 2).name('平移吸���').onChange(updateSnapping)
  transformFolder.add(params, 'rotationSnap', 0.1, Math.PI / 2).name('旋转吸附').onChange(updateSnapping)
  transformFolder.add(params, 'scaleSnap', 0.05, 0.5).name('缩放吸附').onChange(updateSnapping)
  transformFolder.open()

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

function updateTransformMode(mode) {
  transformControls.setMode(mode)
}

function toggleSpaceMode() {
  spaceMode.value = spaceMode.value === 'local' ? 'world' : 'local'
  transformControls.setSpace(spaceMode.value)
}

function updateSnapping() {
  if (params.snapEnabled) {
    transformControls.setTranslationSnap(params.translationSnap)
    transformControls.setRotationSnap(params.rotationSnap)
    transformControls.setScaleSnap(params.scaleSnap)
  } else {
    transformControls.setTranslationSnap(null)
    transformControls.setRotationSnap(null)
    transformControls.setScaleSnap(null)
  }
}

function animate() {
  requestAnimationFrame(animate)
  orbitControls.update()
  renderer.render(scene, camera)
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function resetSelectedObject() {
  if (!selectedObject) return
  
  // 重置位置
  selectedObject.position.copy(selectedObject.userData.originalPosition)
  
  // 重置旋转
  selectedObject.rotation.copy(selectedObject.userData.originalRotation)
  
  // 重置缩放
  selectedObject.scale.copy(selectedObject.userData.originalScale)
  
  // 更新变换控制器
  transformControls.update()
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
    display: flex;
    gap: 10px;

    .space-mode {
      .el-button {
        &.active {
          background-color: var(--el-color-primary);
          border-color: var(--el-color-primary);
          color: white;
        }
        &[type="warning"] {
          margin-left: 8px;
        }
      }
    }
  }
}
</style> 