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
let glowMesh, innerMesh

// 自定义着色器
const glowVertexShader = `
varying vec3 vNormal;
varying vec3 vPositionNormal;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const glowFragmentShader = `
uniform vec3 glowColor;
uniform float intensity;
uniform float power;
varying vec3 vNormal;
varying vec3 vPositionNormal;

void main() {
  float rim = pow(1.0 - abs(dot(vNormal, vPositionNormal)), power);
  gl_FragColor = vec4(glowColor * intensity * rim, rim);
}
`

// GUI 控制参数
const params = {
  innerColor: '#409EFF',
  glowColor: '#00ffff',
  intensity: 1.5,
  power: 2.0,
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

  createGlowMesh()

  // 添加坐标轴
  const axesHelper = new THREE.AxesHelper(params.axesSize)
  axesHelper.visible = params.showAxes
  scene.add(axesHelper)

  window.addEventListener('resize', onWindowResize)
}

function createGlowMesh() {
  // 内部物体
  const geometry = new THREE.IcosahedronGeometry(2, 1)
  const material = new THREE.MeshPhongMaterial({
    color: params.innerColor,
    wireframe: params.wireframe
  })
  innerMesh = new THREE.Mesh(geometry, material)
  scene.add(innerMesh)

  // 发光层
  const glowMaterial = new THREE.ShaderMaterial({
    uniforms: {
      glowColor: { value: new THREE.Color(params.glowColor) },
      intensity: { value: params.intensity },
      power: { value: params.power }
    },
    vertexShader: glowVertexShader,
    fragmentShader: glowFragmentShader,
    transparent: true,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending
  })

  const glowGeometry = new THREE.IcosahedronGeometry(2.2, 1)
  glowMesh = new THREE.Mesh(glowGeometry, glowMaterial)
  scene.add(glowMesh)

  // 添加光源
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(1, 1, 1)
  scene.add(directionalLight)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)
}

function initGUI() {
  gui = new dat.GUI()

  const materialFolder = gui.addFolder('材质设置')
  materialFolder.addColor(params, 'innerColor').name('内部颜色').onChange(value => {
    innerMesh.material.color.set(value)
  })
  materialFolder.addColor(params, 'glowColor').name('发光颜色').onChange(value => {
    glowMesh.material.uniforms.glowColor.value.set(value)
  })
  materialFolder.add(params, 'intensity', 0, 3).name('发光强度').onChange(value => {
    glowMesh.material.uniforms.intensity.value = value
  })
  materialFolder.add(params, 'power', 0, 10).name('发光衰减').onChange(value => {
    glowMesh.material.uniforms.power.value = value
  })
  materialFolder.add(params, 'wireframe').name('线框模式').onChange(value => {
    innerMesh.material.wireframe = value
  })
  materialFolder.open()

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

  if (innerMesh && glowMesh) {
    innerMesh.rotation.x += params.rotationSpeed
    innerMesh.rotation.y += params.rotationSpeed
    glowMesh.rotation.copy(innerMesh.rotation)
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