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
let baseMesh, glowMesh

// GUI 控制参数
const params = {
  baseColor: '#409EFF',
  glowColor: '#00ffff',
  glowScale: 1.1,
  opacity: 0.5,
  subdivisions: 2,
  pulseSpeed: 1.0,
  pulseMin: 1.05,
  pulseMax: 1.15,
  rotationSpeed: 0.005,
  wireframe: false,
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
  scene.background = new THREE.Color(0x000000)

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.set(0, 0, 10)

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  createMeshes()

  // 添加坐标轴
  const axesHelper = new THREE.AxesHelper(params.axesSize)
  axesHelper.visible = params.showAxes
  scene.add(axesHelper)

  window.addEventListener('resize', onWindowResize)
}

function createMeshes() {
  // 基础几何体
  const geometry = new THREE.IcosahedronGeometry(2, params.subdivisions)
  const material = new THREE.MeshPhongMaterial({
    color: params.baseColor,
    wireframe: params.wireframe
  })
  baseMesh = new THREE.Mesh(geometry, material)
  scene.add(baseMesh)

  // 发光层
  const glowMaterial = new THREE.MeshPhongMaterial({
    color: params.glowColor,
    transparent: true,
    opacity: params.opacity,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    wireframe: params.wireframe
  })

  glowMesh = new THREE.Mesh(geometry, glowMaterial)
  glowMesh.scale.multiplyScalar(params.glowScale)
  scene.add(glowMesh)

  // 添加光源
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(1, 1, 1)
  scene.add(directionalLight)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)
}

function updateGeometry() {
  const newGeometry = new THREE.IcosahedronGeometry(2, params.subdivisions)
  baseMesh.geometry.dispose()
  glowMesh.geometry.dispose()
  baseMesh.geometry = newGeometry
  glowMesh.geometry = newGeometry.clone()
}

function initGUI() {
  gui = new dat.GUI()

  const materialFolder = gui.addFolder('材质设置')
  materialFolder.addColor(params, 'baseColor').name('基础颜色').onChange(value => {
    baseMesh.material.color.set(value)
  })
  materialFolder.addColor(params, 'glowColor').name('发光颜色').onChange(value => {
    glowMesh.material.color.set(value)
  })
  materialFolder.add(params, 'opacity', 0, 1).name('不透明度').onChange(value => {
    glowMesh.material.opacity = value
  })
  materialFolder.add(params, 'wireframe').name('线框模式').onChange(value => {
    baseMesh.material.wireframe = value
    glowMesh.material.wireframe = value
  })
  materialFolder.open()

  const geometryFolder = gui.addFolder('几何设置')
  geometryFolder.add(params, 'subdivisions', 0, 4, 1).name('细分等级').onChange(updateGeometry)
  geometryFolder.add(params, 'glowScale', 1, 2).name('发光缩放').onChange(value => {
    glowMesh.scale.setScalar(value)
  })
  geometryFolder.open()

  const animationFolder = gui.addFolder('动画设置')
  animationFolder.add(params, 'pulseSpeed', 0, 2).name('脉冲速度')
  animationFolder.add(params, 'pulseMin', 1, 1.5).name('最小缩放')
  animationFolder.add(params, 'pulseMax', 1, 2).name('最大缩放')
  animationFolder.add(params, 'rotationSpeed', 0, 0.02).name('旋转速度')
  animationFolder.open()

  const visualFolder = gui.addFolder('视觉效果')
  visualFolder.add(params, 'showAxes').name('显示坐标轴').onChange(value => {
    const axesHelper = scene.children.find(child => child instanceof THREE.AxesHelper)
    if (axesHelper) {
      axesHelper.visible = value
    }
  })
  visualFolder.add(params, 'axesSize', 1, 20).name('坐标轴大小').onChange(value => {
    const axesHelper = scene.children.find(child => child instanceof THREE.AxesHelper)
    if (axesHelper) {
      axesHelper.scale.set(value / 10, value / 10, value / 10)
    }
  })
  visualFolder.open()
}

function animate() {
  requestAnimationFrame(animate)
  controls.update()

  if (baseMesh && glowMesh) {
    // 旋转动画
    baseMesh.rotation.x += params.rotationSpeed
    baseMesh.rotation.y += params.rotationSpeed
    glowMesh.rotation.copy(baseMesh.rotation)

    // 脉冲动画
    const time = Date.now() * 0.001
    const scale = params.pulseMin + (Math.sin(time * params.pulseSpeed) + 1) * 0.5 * (params.pulseMax - params.pulseMin)
    glowMesh.scale.setScalar(scale)
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