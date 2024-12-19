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
let sprites = []

// GUI 控制参数
const params = {
  count: 100,
  size: 2,
  color: '#ffffff',
  opacity: 0.8,
  spread: 50,
  rotationSpeed: 0.001,
  pulseSpeed: 1.0,
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
  camera.position.set(0, 0, 100)

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  // 创建精灵贴图
  createSprites()

  // 添加坐标轴
  const axesHelper = new THREE.AxesHelper(params.axesSize)
  axesHelper.visible = params.showAxes
  scene.add(axesHelper)

  window.addEventListener('resize', onWindowResize)
}

function createSprites() {
  // 创建发光纹理
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
  gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.5)')
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 64, 64)

  const texture = new THREE.CanvasTexture(canvas)
  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    color: params.color,
    transparent: true,
    opacity: params.opacity,
    blending: THREE.AdditiveBlending
  })

  // 创建多个精灵
  for (let i = 0; i < params.count; i++) {
    const sprite = new THREE.Sprite(spriteMaterial.clone())
    sprite.scale.set(params.size, params.size, 1)
    
    // 随机位置
    sprite.position.set(
      (Math.random() - 0.5) * params.spread,
      (Math.random() - 0.5) * params.spread,
      (Math.random() - 0.5) * params.spread
    )
    
    // 保存初始位置用于动画
    sprite.userData.initialPosition = sprite.position.clone()
    sprite.userData.phase = Math.random() * Math.PI * 2

    sprites.push(sprite)
    scene.add(sprite)
  }
}

function initGUI() {
  gui = new dat.GUI()

  const spriteFolder = gui.addFolder('精灵设置')
  spriteFolder.add(params, 'count', 10, 500).name('数量').onChange(updateSprites)
  spriteFolder.add(params, 'size', 0.1, 5).name('大小').onChange(updateSprites)
  spriteFolder.addColor(params, 'color').name('颜色').onChange(updateSprites)
  spriteFolder.add(params, 'opacity', 0, 1).name('不透明度').onChange(updateSprites)
  spriteFolder.add(params, 'spread', 10, 100).name('分布范围').onChange(updateSprites)
  spriteFolder.open()

  const animationFolder = gui.addFolder('动画设置')
  animationFolder.add(params, 'rotationSpeed', 0, 0.01).name('旋转速度')
  animationFolder.add(params, 'pulseSpeed', 0, 2).name('脉冲速度')
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

function updateSprites() {
  // 清除现有精灵
  sprites.forEach(sprite => scene.remove(sprite))
  sprites = []
  
  // 重新创建精灵
  createSprites()
}

function animate() {
  requestAnimationFrame(animate)
  controls.update()

  const time = Date.now() * 0.001

  sprites.forEach(sprite => {
    // 旋转
    sprite.position.applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      params.rotationSpeed
    )

    // 脉冲动画
    const phase = sprite.userData.phase
    const pulseScale = 1 + Math.sin(time * params.pulseSpeed + phase) * 0.2
    sprite.scale.set(
      params.size * pulseScale,
      params.size * pulseScale,
      1
    )
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