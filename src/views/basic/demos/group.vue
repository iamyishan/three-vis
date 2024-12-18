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
let scene, camera, renderer, controls, gui, group

// GUI 控制参数
const params = {
  groupRotationSpeed: 0.01,
  cubeRotationSpeed: 0.02,
  spacing: 2,
  scale: 1
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
  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf5f5f5)

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.z = 10

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)

  // 创建控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  // 创建组
  group = new THREE.Group()
  scene.add(group)

  // 创建多个立方体并添加到组中
  const colors = [0x409EFF, 0x67C23A, 0xE6A23C]
  const geometry = new THREE.BoxGeometry()

  for (let i = 0; i < 3; i++) {
    const material = new THREE.MeshPhongMaterial({ color: colors[i] })
    const cube = new THREE.Mesh(geometry, material)
    cube.position.x = (i - 1) * params.spacing
    group.add(cube)
  }

  // 添加光源
  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(1, 1, 1)
  scene.add(light)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)

  window.addEventListener('resize', onWindowResize)
}

function initGUI() {
  gui = new dat.GUI()
  
  const groupFolder = gui.addFolder('组控制')
  groupFolder.add(params, 'groupRotationSpeed', 0, 0.1).name('组旋转速度')
  groupFolder.add(params, 'spacing', 1, 4).name('间距').onChange(updateSpacing)
  groupFolder.add(params, 'scale', 0.5, 2).name('整体缩放').onChange(updateScale)
  groupFolder.open()

  const cubeFolder = gui.addFolder('立方体控制')
  cubeFolder.add(params, 'cubeRotationSpeed', 0, 0.1).name('立方体自转速度')
  cubeFolder.open()
}

function updateSpacing() {
  group.children.forEach((cube, index) => {
    cube.position.x = (index - 1) * params.spacing
  })
}

function updateScale() {
  group.scale.set(params.scale, params.scale, params.scale)
}

function animate() {
  requestAnimationFrame(animate)
  controls.update()

  // 更新组的旋转
  group.rotation.y += params.groupRotationSpeed

  // 更新每个立方体的自转
  group.children.forEach(cube => {
    cube.rotation.x += params.cubeRotationSpeed
    cube.rotation.z += params.cubeRotationSpeed
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