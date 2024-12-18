<template>
  <div class="scenes-container">
    <BackButton />
    <div class="scenes-grid">
      <div v-for="(scene, index) in scenes" :key="index" class="scene-item">
        <canvas :ref="el => canvasRefs[index] = el"></canvas>
        <div class="scene-controls">
          <div class="scene-title">场景 {{ index + 1 }} - {{ scene.name }}</div>
          <div class="control-buttons">
            <el-button-group>
              <el-button 
                type="primary" 
                size="small"
                @click="toggleAnimation(index)"
              >
                {{ scene.isAnimating ? '暂停' : '播放' }}
              </el-button>
              <el-button 
                type="warning" 
                size="small"
                @click="resetScene(index)"
              >
                重置
              </el-button>
            </el-button-group>
          </div>
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

const canvasRefs = ref([])
const scenes = ref([
  { name: '立方体', isAnimating: true },
  { name: '球体', isAnimating: true },
  { name: '环面', isAnimating: true },
  { name: '节点', isAnimating: true }
])

let renderers = []
let sceneObjects = []
let cameras = []
let controls = []
let meshes = []
let gui

// GUI 控制参数
const params = {
  globalRotationSpeed: 0.01,
  wireframe: false,
  autoRotateCamera: false,
  cameraSpeed: 1
}

onMounted(() => {
  initScenes()
  initGUI()
  animate()
})

onBeforeUnmount(() => {
  renderers.forEach(renderer => {
    if (renderer) {
      renderer.dispose()
    }
  })
  if (gui) {
    gui.destroy()
  }
  window.removeEventListener('resize', onWindowResize)
})

function initScenes() {
  // 创建四种不同的几何体
  const geometries = [
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.SphereGeometry(1.5, 32, 32),
    new THREE.TorusGeometry(1, 0.4, 16, 100),
    createNodeGeometry()
  ]

  const materials = [
    new THREE.MeshPhongMaterial({ color: 0x409EFF }),
    new THREE.MeshPhongMaterial({ color: 0x67C23A }),
    new THREE.MeshPhongMaterial({ color: 0xE6A23C }),
    new THREE.MeshPhongMaterial({ color: 0xF56C6C })
  ]

  // 初始化每个场景
  scenes.value.forEach((_, index) => {
    // 创建场景
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf5f5f5)
    sceneObjects.push(scene)

    // 创建相机
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / 2 / (window.innerHeight / 2),
      0.1,
      1000
    )
    camera.position.set(3, 3, 3)
    cameras.push(camera)

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRefs.value[index],
      antialias: true
    })
    renderer.setSize(window.innerWidth / 2, window.innerHeight / 2)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderers.push(renderer)

    // 创建控制器
    const control = new OrbitControls(camera, renderer.domElement)
    control.enableDamping = true
    controls.push(control)

    // 创建物体
    const mesh = new THREE.Mesh(geometries[index], materials[index])
    meshes.push(mesh)
    scene.add(mesh)

    // 添加光源
    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(1, 1, 1)
    scene.add(light)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)
  })

  window.addEventListener('resize', onWindowResize)
}

function createNodeGeometry() {
  const geometry = new THREE.BufferGeometry()
  const vertices = []
  const connections = []

  // 创建节点
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * 4 - 2
    const y = Math.random() * 4 - 2
    const z = Math.random() * 4 - 2
    vertices.push(x, y, z)
  }

  // 创建连接
  for (let i = 0; i < vertices.length / 3; i++) {
    for (let j = i + 1; j < vertices.length / 3; j++) {
      const distance = Math.sqrt(
        Math.pow(vertices[i * 3] - vertices[j * 3], 2) +
        Math.pow(vertices[i * 3 + 1] - vertices[j * 3 + 1], 2) +
        Math.pow(vertices[i * 3 + 2] - vertices[j * 3 + 2], 2)
      )
      if (distance < 1.5) {
        connections.push(i * 3, j * 3)
      }
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setIndex(connections)

  return geometry
}

function initGUI() {
  gui = new dat.GUI()

  const globalFolder = gui.addFolder('全局控制')
  globalFolder.add(params, 'globalRotationSpeed', 0, 0.1).name('旋转速度')
  globalFolder.add(params, 'wireframe').name('线框模式').onChange(updateMaterials)
  globalFolder.open()

  const cameraFolder = gui.addFolder('相机控制')
  cameraFolder.add(params, 'autoRotateCamera').name('自动旋转')
  cameraFolder.add(params, 'cameraSpeed', 0.1, 2).name('旋转速度')
  cameraFolder.open()
}

function updateMaterials() {
  meshes.forEach(mesh => {
    if (mesh.material) {
      mesh.material.wireframe = params.wireframe
    }
  })
}

function toggleAnimation(index) {
  scenes.value[index].isAnimating = !scenes.value[index].isAnimating
}

function resetScene(index) {
  if (meshes[index]) {
    meshes[index].rotation.set(0, 0, 0)
  }
  if (cameras[index]) {
    cameras[index].position.set(3, 3, 3)
    cameras[index].lookAt(0, 0, 0)
  }
}

function animate() {
  requestAnimationFrame(animate)

  scenes.value.forEach((scene, index) => {
    if (scene.isAnimating) {
      meshes[index].rotation.x += params.globalRotationSpeed
      meshes[index].rotation.y += params.globalRotationSpeed
    }

    if (params.autoRotateCamera) {
      const time = Date.now() * 0.001 * params.cameraSpeed
      const radius = 5
      cameras[index].position.x = Math.cos(time) * radius
      cameras[index].position.z = Math.sin(time) * radius
      cameras[index].lookAt(0, 0, 0)
    }

    controls[index].update()
    renderers[index].render(sceneObjects[index], cameras[index])
  })
}

function onWindowResize() {
  scenes.value.forEach((_, index) => {
    if (cameras[index] && renderers[index]) {
      cameras[index].aspect = window.innerWidth / 2 / (window.innerHeight / 2)
      cameras[index].updateProjectionMatrix()
      renderers[index].setSize(window.innerWidth / 2, window.innerHeight / 2)
    }
  })
}
</script>

<style lang="scss" scoped>
.scenes-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  padding: 20px;
  box-sizing: border-box;
  
  .scenes-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 20px;
    height: 100%;
    
    .scene-item {
      position: relative;
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      
      canvas {
        width: 100% !important;
        height: 100% !important;
      }

      .scene-controls {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        padding: 10px;
        background: rgba(0, 0, 0, 0.5);
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .scene-title {
          font-size: 14px;
          font-weight: bold;
        }

        .control-buttons {
          display: flex;
          gap: 10px;
        }
      }
    }
  }
}
</style> 