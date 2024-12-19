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
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass'
import * as dat from 'dat.gui'
import BackButton from '@/components/common/BackButton.vue'

const canvasRef = ref(null)
let scene, camera, renderer, controls, composer, gui
let meshes = []

// GUI 控制参数
const params = {
  exposure: 1,
  bloomStrength: 1.5,
  bloomThreshold: 0,
  bloomRadius: 0.5,
  rotationSpeed: 0.005,
  showAxes: true,
  axesSize: 10
}

// 发光材质配置
const materials = [
  {
    color: '#ff0000',
    emissive: '#ff0000',
    emissiveIntensity: 2
  },
  {
    color: '#00ff00',
    emissive: '#00ff00',
    emissiveIntensity: 2
  },
  {
    color: '#0000ff',
    emissive: '#0000ff',
    emissiveIntensity: 2
  }
]

onMounted(() => {
  initScene()
  initPostprocessing()
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
  renderer.toneMapping = THREE.ReinhardToneMapping

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
  const geometries = [
    new THREE.TorusKnotGeometry(1, 0.3, 100, 16),
    new THREE.IcosahedronGeometry(1, 1),
    new THREE.TorusGeometry(1.5, 0.4, 16, 100)
  ]

  materials.forEach((config, i) => {
    const material = new THREE.MeshStandardMaterial({
      color: config.color,
      emissive: config.emissive,
      emissiveIntensity: config.emissiveIntensity,
      metalness: 0.5,
      roughness: 0.5
    })

    const mesh = new THREE.Mesh(geometries[i], material)
    mesh.position.x = (i - 1) * 4
    mesh.userData.basePosition = mesh.position.clone()
    meshes.push(mesh)
    scene.add(mesh)
  })

  // 添加光源
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(1, 1, 1)
  scene.add(directionalLight)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)
}

function initPostprocessing() {
  composer = new EffectComposer(renderer)

  const renderPass = new RenderPass(scene, camera)
  composer.addPass(renderPass)

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    params.bloomStrength,
    params.bloomRadius,
    params.bloomThreshold
  )
  composer.addPass(bloomPass)

  const outputPass = new OutputPass()
  composer.addPass(outputPass)
}

function initGUI() {
  gui = new dat.GUI()

  const bloomFolder = gui.addFolder('发光设置')
  bloomFolder.add(params, 'exposure', 0.1, 2).name('曝光').onChange(value => {
    renderer.toneMappingExposure = Math.pow(value, 4.0)
  })
  bloomFolder.add(params, 'bloomStrength', 0.0, 3.0).name('发光强度').onChange(value => {
    composer.passes[1].strength = Number(value)
  })
  bloomFolder.add(params, 'bloomThreshold', 0.0, 1.0).name('发光阈值').onChange(value => {
    composer.passes[1].threshold = Number(value)
  })
  bloomFolder.add(params, 'bloomRadius', 0.0, 1.0).name('发光半径').onChange(value => {
    composer.passes[1].radius = Number(value)
  })
  bloomFolder.open()

  const animationFolder = gui.addFolder('动画设置')
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

  const time = Date.now() * 0.001

  meshes.forEach((mesh, i) => {
    // 旋转动画
    mesh.rotation.x += params.rotationSpeed
    mesh.rotation.y += params.rotationSpeed

    // 上下浮动动画
    mesh.position.y = mesh.userData.basePosition.y + Math.sin(time + i * Math.PI * 0.5) * 0.5
  })

  composer.render()
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  composer.setSize(window.innerWidth, window.innerHeight)
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