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
let clippingPlanes = []

// GUI 控制参数
const params = {
  planeX: { constant: 0, enabled: true },
  planeY: { constant: 0, enabled: true },
  planeZ: { constant: 0, enabled: true },
  showHelpers: true,
  opacity: 0.5,
  wireframe: false,
  rotationSpeed: 0.005,
  color: '#409EFF',
  showAxes: true,
  axesSize: 5
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
  renderer.localClippingEnabled = true

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  // 创建裁剪平面
  clippingPlanes = [
    new THREE.Plane(new THREE.Vector3(-1, 0, 0), params.planeX.constant),
    new THREE.Plane(new THREE.Vector3(0, -1, 0), params.planeY.constant),
    new THREE.Plane(new THREE.Vector3(0, 0, -1), params.planeZ.constant)
  ]

  // 创建材质
  const material = new THREE.MeshPhongMaterial({
    color: params.color,
    opacity: params.opacity,
    transparent: true,
    wireframe: params.wireframe,
    side: THREE.DoubleSide,
    clippingPlanes: clippingPlanes
  })

  // 创建几何体
  const geometry = new THREE.TorusKnotGeometry(2, 0.6, 128, 32)
  const torusKnot = new THREE.Mesh(geometry, material)
  scene.add(torusKnot)

  // 添加坐标轴辅助
  const axesHelper = new THREE.AxesHelper(params.axesSize * 1.5)
  axesHelper.visible = params.showAxes
  axesHelper.setColors(
    new THREE.Color(0xff0000),
    new THREE.Color(0x00ff00),
    new THREE.Color(0x0000ff)
  )
  scene.add(axesHelper)

  // 添加裁剪平面辅助
  const helpers = clippingPlanes.map(plane => {
    const helper = new THREE.PlaneHelper(plane, 4, 0xff0000)
    helper.visible = params.showHelpers
    return helper
  })
  helpers.forEach(helper => scene.add(helper))

  // 添加光源
  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(2, 2, 2)
  scene.add(light)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)

  window.addEventListener('resize', onWindowResize)
}

function initGUI() {
  gui = new dat.GUI()

  const planeFolder = gui.addFolder('裁剪平面')
  planeFolder.add(params.planeX, 'constant', -3, 3).name('X轴裁剪').onChange(updateClipping)
  planeFolder.add(params.planeY, 'constant', -3, 3).name('Y轴裁剪').onChange(updateClipping)
  planeFolder.add(params.planeZ, 'constant', -3, 3).name('Z轴裁剪').onChange(updateClipping)
  planeFolder.add(params.planeX, 'enabled').name('启用X轴').onChange(updateClipping)
  planeFolder.add(params.planeY, 'enabled').name('启用Y轴').onChange(updateClipping)
  planeFolder.add(params.planeZ, 'enabled').name('启用Z轴').onChange(updateClipping)
  planeFolder.add(params, 'showHelpers').name('显示辅助线').onChange(updateHelpers)
  planeFolder.open()

  const materialFolder = gui.addFolder('材质控制')
  materialFolder.addColor(params, 'color').name('颜色').onChange(updateMaterial)
  materialFolder.add(params, 'opacity', 0, 1).name('透明度').onChange(updateMaterial)
  materialFolder.add(params, 'wireframe').name('线框模式').onChange(updateMaterial)
  materialFolder.open()

  const animationFolder = gui.addFolder('动画控制')
  animationFolder.add(params, 'rotationSpeed', 0, 0.02).name('旋转速度')
  animationFolder.open()

  const visualFolder = gui.addFolder('视觉效果')
  visualFolder.add(params, 'showHelpers').name('显示裁剪面').onChange(updateHelpers)
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

function updateClipping() {
  clippingPlanes[0].constant = params.planeX.constant
  clippingPlanes[1].constant = params.planeY.constant
  clippingPlanes[2].constant = params.planeZ.constant

  const mesh = scene.children.find(child => child instanceof THREE.Mesh)
  mesh.material.clippingPlanes = [
    params.planeX.enabled ? clippingPlanes[0] : null,
    params.planeY.enabled ? clippingPlanes[1] : null,
    params.planeZ.enabled ? clippingPlanes[2] : null
  ].filter(Boolean)
}

function updateHelpers() {
  scene.children
    .filter(child => child instanceof THREE.PlaneHelper)
    .forEach(helper => {
      helper.visible = params.showHelpers
    })
}

function updateMaterial() {
  const material = scene.children.find(child => child instanceof THREE.Mesh).material
  material.color.set(params.color)
  material.opacity = params.opacity
  material.wireframe = params.wireframe
}

function animate() {
  requestAnimationFrame(animate)
  controls.update()

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

function addAxisLabels() {
  const labelStyle = {
    fontSize: '12px',
    fontFamily: 'Arial',
    padding: '2px 4px',
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: 'white',
    borderRadius: '2px'
  }

  const labels = ['X', 'Y', 'Z']
  const positions = [
    new THREE.Vector3(params.axesSize + 0.2, 0, 0),
    new THREE.Vector3(0, params.axesSize + 0.2, 0),
    new THREE.Vector3(0, 0, params.axesSize + 0.2)
  ]
  const colors = ['#ff0000', '#00ff00', '#0000ff']

  labels.forEach((text, i) => {
    const div = document.createElement('div')
    Object.assign(div.style, labelStyle)
    div.style.color = colors[i]
    div.textContent = text
    
    const label = new CSS2DObject(div)
    label.position.copy(positions[i])
    scene.add(label)
  })
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