<template>
  <div class="scene-container">
    <BackButton />
    <canvas ref="canvasRef"></canvas>
    <div class="event-info" v-if="selectedObject">
      <div class="info-content">
        <h3>{{ selectedObject.name }}</h3>
        <p>位置: {{ formatVector(selectedObject.position) }}</p>
        <p>旋转: {{ formatVector(selectedObject.rotation) }}</p>
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
const selectedObject = ref(null)

let scene, camera, renderer, controls, gui, raycaster, mouse
let objects = []

// GUI 控制参数
const params = {
  autoRotate: true,
  rotationSpeed: 0.01,
  highlightColor: '#ff0000',
  enableHover: true,
  clickMode: 'select' // 'select' or 'drag'
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
  renderer?.domElement.removeEventListener('mousemove', onMouseMove)
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
  camera.position.z = 10

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  // 初始化射线和鼠标
  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  // 创建不同的几何体
  const geometries = [
    new THREE.BoxGeometry(1.5, 1.5, 1.5),
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.ConeGeometry(1, 2, 32),
    new THREE.TorusGeometry(1, 0.4, 16, 100)
  ]

  const materials = [
    new THREE.MeshPhongMaterial({ color: 0x409EFF }),
    new THREE.MeshPhongMaterial({ color: 0x67C23A }),
    new THREE.MeshPhongMaterial({ color: 0xE6A23C }),
    new THREE.MeshPhongMaterial({ color: 0xF56C6C })
  ]

  // 创建并定位物体
  const positions = [
    new THREE.Vector3(-3, 1.5, 0),
    new THREE.Vector3(3, 1.5, 0),
    new THREE.Vector3(-3, -1.5, 0),
    new THREE.Vector3(3, -1.5, 0)
  ]

  geometries.forEach((geometry, i) => {
    const mesh = new THREE.Mesh(geometry, materials[i])
    mesh.position.copy(positions[i])
    mesh.name = ['立方体', '球体', '圆锥体', '圆环'][i]
    mesh.userData.originalColor = materials[i].color.getHex()
    objects.push(mesh)
    scene.add(mesh)
  })

  // 添加光源
  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(1, 1, 1)
  scene.add(light)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)

  // 添加事件监听
  renderer.domElement.addEventListener('mousemove', onMouseMove)
  renderer.domElement.addEventListener('click', onClick)
  window.addEventListener('resize', onWindowResize)
}

function initGUI() {
  gui = new dat.GUI()

  const eventFolder = gui.addFolder('事件控制')
  eventFolder.add(params, 'enableHover').name('启用悬停效果')
  eventFolder.add(params, 'clickMode', ['select', 'drag']).name('点击模式')
  eventFolder.addColor(params, 'highlightColor').name('高亮颜色')
  eventFolder.open()

  const animationFolder = gui.addFolder('动画控制')
  animationFolder.add(params, 'autoRotate').name('自动旋转')
  animationFolder.add(params, 'rotationSpeed', 0, 0.1).name('旋转速度')
  animationFolder.open()
}

function onMouseMove(event) {
  event.preventDefault()

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

  if (params.enableHover) {
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(objects)

    objects.forEach(obj => {
      if (obj !== selectedObject.value) {
        obj.material.color.setHex(obj.userData.originalColor)
      }
    })

    if (intersects.length > 0) {
      const object = intersects[0].object
      if (object !== selectedObject.value) {
        object.material.color.setHex(0xffff00)
      }
    }
  }
}

function onClick(event) {
  event.preventDefault()

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(objects)

  if (intersects.length > 0) {
    const object = intersects[0].object
    
    if (params.clickMode === 'select') {
      // 重置所有物体颜色
      objects.forEach(obj => {
        obj.material.color.setHex(obj.userData.originalColor)
      })
      
      // 设置选中物体颜色
      object.material.color.set(params.highlightColor)
      selectedObject.value = object
    }
  } else {
    if (params.clickMode === 'select') {
      // 点击空白处取消选择
      objects.forEach(obj => {
        obj.material.color.setHex(obj.userData.originalColor)
      })
      selectedObject.value = null
    }
  }
}

function formatVector(vector) {
  return `x: ${vector.x.toFixed(2)}, y: ${vector.y.toFixed(2)}, z: ${vector.z.toFixed(2)}`
}

function animate() {
  requestAnimationFrame(animate)
  controls.update()

  if (params.autoRotate) {
    objects.forEach(obj => {
      obj.rotation.y += params.rotationSpeed
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

  .event-info {
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 15px;
    border-radius: 8px;
    min-width: 200px;
    
    .info-content {
      h3 {
        margin: 0 0 10px 0;
        color: #409EFF;
      }
      
      p {
        margin: 5px 0;
        font-size: 14px;
      }
    }
  }
}
</style> 