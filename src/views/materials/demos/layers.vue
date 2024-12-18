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
  baseColor: '#409EFF',
  overlayColor: '#67C23A',
  overlayOpacity: 0.5,
  overlayBlend: 'normal',
  rotationSpeed: 0.005,
  wireframe: false,
  showAxes: true,
  axesSize: 5
}

// 混合模式选项
const blendModes = {
  'normal': THREE.NormalBlending,
  'additive': THREE.AdditiveBlending,
  'subtract': THREE.SubtractiveBlending,
  'multiply': THREE.MultiplyBlending
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
  camera.position.set(4, 4, 4)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  // 创建基础几何体
  const geometry = new THREE.TorusKnotGeometry(1, 0.4, 100, 16)

  // 创建基础材质层
  const baseMaterial = new THREE.MeshPhongMaterial({
    color: params.baseColor,
    side: THREE.DoubleSide,
    wireframe: params.wireframe
  })

  // 创建叠加材质层
  const overlayMaterial = new THREE.MeshPhongMaterial({
    color: params.overlayColor,
    transparent: true,
    opacity: params.overlayOpacity,
    blending: blendModes[params.overlayBlend],
    side: THREE.DoubleSide,
    wireframe: params.wireframe
  })

  // 创建两个网格并稍微偏移
  const baseMesh = new THREE.Mesh(geometry, baseMaterial)
  const overlayMesh = new THREE.Mesh(geometry, overlayMaterial)
  overlayMesh.scale.multiplyScalar(1.01) // 稍微放大避免z-fighting

  scene.add(baseMesh)
  scene.add(overlayMesh)

  // 添加坐标轴辅助
  const axesHelper = new THREE.AxesHelper(params.axesSize)
  axesHelper.visible = params.showAxes
  scene.add(axesHelper)

  // 添加光源
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(2, 2, 2)
  scene.add(directionalLight)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)

  window.addEventListener('resize', onWindowResize)
}

function initGUI() {
  gui = new dat.GUI()

  const materialFolder = gui.addFolder('材质控制')
  materialFolder.addColor(params, 'baseColor').name('基础颜色').onChange(updateMaterials)
  materialFolder.addColor(params, 'overlayColor').name('叠加颜色').onChange(updateMaterials)
  materialFolder.add(params, 'overlayOpacity', 0, 1).name('叠加透明度').onChange(updateMaterials)
  materialFolder.add(params, 'overlayBlend', Object.keys(blendModes)).name('混合模式').onChange(updateMaterials)
  materialFolder.add(params, 'wireframe').name('线框模式').onChange(updateMaterials)
  materialFolder.open()

  const animationFolder = gui.addFolder('动画控制')
  animationFolder.add(params, 'rotationSpeed', 0, 0.02).name('旋转速度')
  animationFolder.open()

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

function updateMaterials() {
  const meshes = scene.children.filter(child => child instanceof THREE.Mesh)
  const baseMesh = meshes[0]
  const overlayMesh = meshes[1]

  baseMesh.material.color.set(params.baseColor)
  baseMesh.material.wireframe = params.wireframe

  overlayMesh.material.color.set(params.overlayColor)
  overlayMesh.material.opacity = params.overlayOpacity
  overlayMesh.material.blending = blendModes[params.overlayBlend]
  overlayMesh.material.wireframe = params.wireframe
}

function animate() {
  requestAnimationFrame(animate)
  controls.update()

  const meshes = scene.children.filter(child => child instanceof THREE.Mesh)
  meshes.forEach(mesh => {
    mesh.rotation.x += params.rotationSpeed
    mesh.rotation.y += params.rotationSpeed
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