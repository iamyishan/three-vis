<template>
  <div class="scene-container">
    <BackButton />
    <canvas ref="canvasRef"></canvas>
    <div class="info-panel">
      <h3>穿透选择结果</h3>
      <div class="selected-list">
        <div v-for="(obj, index) in selectedObjects" :key="index" class="selected-item">
          <span class="item-name">{{ obj.name }}</span>
          <span class="item-distance">距离: {{ obj.distance.toFixed(2) }}</span>
        </div>
      </div>
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
const selectedObjects = ref([])

let scene, camera, renderer, controls, gui, raycaster, mouse
let objects = []

// GUI 控制参数
const params = {
  maxDistance: 20,
  maxIntersections: 5,
  opacity: 0.5,
  showWireframe: false,
  rotationSpeed: 0.005,
  enableRotation: true
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
  renderer?.domElement.removeEventListener('click', onClick)
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
  camera.position.z = 15

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  // 创建多个半透明平面
  const planeGeometry = new THREE.PlaneGeometry(4, 4)
  const colors = [0x409EFF, 0x67C23A, 0xE6A23C, 0xF56C6C, 0x909399]

  for (let i = 0; i < 5; i++) {
    const material = new THREE.MeshPhongMaterial({
      color: colors[i],
      transparent: true,
      opacity: params.opacity,
      side: THREE.DoubleSide,
      wireframe: params.showWireframe
    })

    const plane = new THREE.Mesh(planeGeometry, material)
    plane.position.z = i * -2
    plane.name = `平面 ${i + 1}`
    plane.userData.originalColor = colors[i]
    objects.push(plane)
    scene.add(plane)
  }

  // 添加光源
  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(1, 1, 1)
  scene.add(light)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)

  renderer.domElement.addEventListener('click', onClick)
  window.addEventListener('resize', onWindowResize)
}

function initGUI() {
  gui = new dat.GUI()

  const raycastFolder = gui.addFolder('射线检测')
  raycastFolder.add(params, 'maxDistance', 5, 50).name('最大检测距离')
  raycastFolder.add(params, 'maxIntersections', 1, 5, 1).name('最大检测数量')
  raycastFolder.open()

  const visualFolder = gui.addFolder('视觉效果')
  visualFolder.add(params, 'opacity', 0.1, 1).name('透明度').onChange(updateMaterials)
  visualFolder.add(params, 'showWireframe').name('线框模式').onChange(updateMaterials)
  visualFolder.open()

  const animationFolder = gui.addFolder('动画控制')
  animationFolder.add(params, 'enableRotation').name('启用旋转')
  animationFolder.add(params, 'rotationSpeed', 0, 0.02).name('旋转速度')
  animationFolder.open()
}

function updateMaterials() {
  objects.forEach(obj => {
    obj.material.opacity = params.opacity
    obj.material.wireframe = params.showWireframe
  })
}

function onClick(event) {
  event.preventDefault()

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(objects)
  
  // 重置所有物体的发光效果
  objects.forEach(obj => {
    obj.material.emissive.setHex(0x000000)
  })

  // 更新选中列表
  selectedObjects.value = intersects
    .slice(0, params.maxIntersections)
    .map(intersect => ({
      name: intersect.object.name,
      distance: intersect.distance
    }))

  // 为选中的物体添加发光效果
  intersects.forEach(intersect => {
    intersect.object.material.emissive.setHex(0x333333)
  })
}

function animate() {
  requestAnimationFrame(animate)
  controls.update()

  if (params.enableRotation) {
    objects.forEach((obj, index) => {
      obj.rotation.y = Math.sin(Date.now() * params.rotationSpeed + index) * 0.3
    })
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

  .info-panel {
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 15px;
    border-radius: 8px;
    min-width: 250px;

    h3 {
      margin: 0 0 15px 0;
      color: #409EFF;
    }

    .selected-list {
      .selected-item {
        display: flex;
        justify-content: space-between;
        margin: 8px 0;
        padding: 5px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;

        .item-name {
          color: #67C23A;
        }

        .item-distance {
          color: #E6A23C;
        }
      }
    }
  }
}
</style> 