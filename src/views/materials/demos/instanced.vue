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
let instancedMesh, baseMaterial

// GUI 控制参数
const params = {
  count: 1000,
  size: 0.1,
  spread: 10,
  baseColor: '#409EFF',
  rotationSpeed: 0.001,
  showAxes: true,
  axesSize: 10,
  animationSpeed: 1.0
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
  camera.position.set(15, 15, 15)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  // 创建基础材质
  baseMaterial = new THREE.MeshPhongMaterial({
    color: params.baseColor,
    shininess: 30
  })

  // 创建实例化网格
  createInstancedMesh()

  // 添加坐标轴辅助
  const axesHelper = new THREE.AxesHelper(params.axesSize)
  axesHelper.visible = params.showAxes
  scene.add(axesHelper)

  // 添加光源
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(5, 5, 5)
  scene.add(directionalLight)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)

  window.addEventListener('resize', onWindowResize)
}

function createInstancedMesh() {
  // 移除现有的实例化网格
  if (instancedMesh) {
    scene.remove(instancedMesh)
  }

  // 创建几何体
  const geometry = new THREE.IcosahedronGeometry(params.size, 1)

  // 创建实例化网格
  instancedMesh = new THREE.InstancedMesh(
    geometry,
    baseMaterial,
    params.count
  )

  // 设置每个实例的变换矩阵
  const matrix = new THREE.Matrix4()
  const position = new THREE.Vector3()
  const rotation = new THREE.Euler()
  const quaternion = new THREE.Quaternion()
  const scale = new THREE.Vector3()

  for (let i = 0; i < params.count; i++) {
    position.x = (Math.random() - 0.5) * params.spread
    position.y = (Math.random() - 0.5) * params.spread
    position.z = (Math.random() - 0.5) * params.spread

    rotation.x = Math.random() * Math.PI
    rotation.y = Math.random() * Math.PI
    rotation.z = Math.random() * Math.PI
    quaternion.setFromEuler(rotation)

    scale.x = scale.y = scale.z = Math.random() * 0.5 + 0.5

    matrix.compose(position, quaternion, scale)
    instancedMesh.setMatrixAt(i, matrix)
  }

  scene.add(instancedMesh)
}

function initGUI() {
  gui = new dat.GUI()

  const instanceFolder = gui.addFolder('实例化控制')
  instanceFolder.add(params, 'count', 100, 5000, 100).name('实例数量').onChange(createInstancedMesh)
  instanceFolder.add(params, 'size', 0.05, 0.5).name('物体大小').onChange(createInstancedMesh)
  instanceFolder.add(params, 'spread', 5, 20).name('分布范围').onChange(createInstancedMesh)
  instanceFolder.addColor(params, 'baseColor').name('基础颜色').onChange(updateMaterial)
  instanceFolder.open()

  const animationFolder = gui.addFolder('动画控制')
  animationFolder.add(params, 'rotationSpeed', 0, 0.005).name('旋转速度')
  animationFolder.add(params, 'animationSpeed', 0.1, 2).name('动画速度')
  animationFolder.open()

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

function updateMaterial() {
  baseMaterial.color.set(params.baseColor)
}

function animate() {
  requestAnimationFrame(animate)
  controls.update()

  if (instancedMesh) {
    const time = Date.now() * params.animationSpeed * 0.001
    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const rotation = new THREE.Euler()
    const quaternion = new THREE.Quaternion()
    const scale = new THREE.Vector3()

    for (let i = 0; i < params.count; i++) {
      instancedMesh.getMatrixAt(i, matrix)
      matrix.decompose(position, quaternion, scale)

      // 添加波浪运动
      position.y += Math.sin(time + position.x) * 0.01
      rotation.setFromQuaternion(quaternion)
      rotation.y += params.rotationSpeed
      quaternion.setFromEuler(rotation)

      matrix.compose(position, quaternion, scale)
      instancedMesh.setMatrixAt(i, matrix)
    }

    instancedMesh.instanceMatrix.needsUpdate = true
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