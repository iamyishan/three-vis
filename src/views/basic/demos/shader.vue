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
let scene, camera, renderer, controls, gui, clock

// GUI 控制参数
const params = {
  waveSpeed: 1.0,
  waveFrequency: 5.0,
  waveAmplitude: 0.2,
  colorA: '#409EFF',
  colorB: '#42b883',
  wireframe: false
}

// 顶点着色器
const vertexShader = `
  uniform float uTime;
  uniform float uFrequency;
  uniform float uAmplitude;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    float elevation = sin(modelPosition.x * uFrequency + uTime) * 
                     sin(modelPosition.z * uFrequency + uTime) * 
                     uAmplitude;
    
    modelPosition.y += elevation;
    
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    
    gl_Position = projectedPosition;
    
    vUv = uv;
    vElevation = elevation;
  }
`

// 片元着色器
const fragmentShader = `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    float mixStrength = (vElevation + uColorA.r) * 0.5;
    vec3 color = mix(uColorA, uColorB, mixStrength);
    gl_FragColor = vec4(color, 1.0);
  }
`

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
  camera.position.set(2, 2, 2)

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  clock = new THREE.Clock()

  // 创建自定义着色器材质
  const shaderMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uFrequency: { value: params.waveFrequency },
      uAmplitude: { value: params.waveAmplitude },
      uColorA: { value: new THREE.Color(params.colorA) },
      uColorB: { value: new THREE.Color(params.colorB) }
    },
    wireframe: params.wireframe,
    side: THREE.DoubleSide
  })

  // 创建平面
  const geometry = new THREE.PlaneGeometry(3, 3, 128, 128)
  const plane = new THREE.Mesh(geometry, shaderMaterial)
  plane.rotation.x = -Math.PI / 2
  scene.add(plane)

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

  const waveFolder = gui.addFolder('波浪控制')
  waveFolder.add(params, 'waveSpeed', 0, 2).name('波浪速度')
  waveFolder.add(params, 'waveFrequency', 1, 10).name('波浪频率').onChange(updateUniforms)
  waveFolder.add(params, 'waveAmplitude', 0, 0.5).name('波浪高度').onChange(updateUniforms)
  waveFolder.open()

  const colorFolder = gui.addFolder('颜色控制')
  colorFolder.addColor(params, 'colorA').name('颜色A').onChange(updateUniforms)
  colorFolder.addColor(params, 'colorB').name('颜色B').onChange(updateUniforms)
  colorFolder.open()

  const materialFolder = gui.addFolder('材质控制')
  materialFolder.add(params, 'wireframe').name('线框模式').onChange(updateMaterial)
  materialFolder.open()
}

function updateUniforms() {
  const material = scene.children.find(child => child instanceof THREE.Mesh).material
  material.uniforms.uFrequency.value = params.waveFrequency
  material.uniforms.uAmplitude.value = params.waveAmplitude
  material.uniforms.uColorA.value.set(params.colorA)
  material.uniforms.uColorB.value.set(params.colorB)
}

function updateMaterial() {
  const material = scene.children.find(child => child instanceof THREE.Mesh).material
  material.wireframe = params.wireframe
}

function animate() {
  requestAnimationFrame(animate)
  controls.update()

  const elapsedTime = clock.getElapsedTime()
  const material = scene.children.find(child => child instanceof THREE.Mesh).material
  material.uniforms.uTime.value = elapsedTime * params.waveSpeed

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