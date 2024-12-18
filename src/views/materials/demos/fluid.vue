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
  waveHeight: 0.2,
  waveFrequency: 3.0,
  colorA: '#00ffff',  // 亮青色
  colorB: '#0066ff',  // 亮蓝色
  wireframe: false,
  showGrid: true,
  gridSize: 4,
  gridDivisions: 10
}

// 顶点着色器
const vertexShader = `
  uniform float uTime;
  uniform float uWaveHeight;
  uniform float uWaveFrequency;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    float elevation = sin(modelPosition.x * uWaveFrequency + uTime) * 
                     cos(modelPosition.z * uWaveFrequency + uTime) * 
                     uWaveHeight;
    
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
  uniform float uWaveHeight;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    float mixStrength = smoothstep(-uWaveHeight, uWaveHeight, vElevation);
    vec3 color = mix(uColorA, uColorB, mixStrength);
    
    float edgeStrength = 1.0 - abs(vElevation) / uWaveHeight;
    color += vec3(edgeStrength * 0.3);
    
    gl_FragColor = vec4(color, 0.8);
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
  camera.position.set(2, 4, 4)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setClearColor(0xf5f5f5)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  clock = new THREE.Clock()

  // 创建着色器材质
  const shaderMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uWaveHeight: { value: params.waveHeight },
      uWaveFrequency: { value: params.waveFrequency },
      uColorA: { value: new THREE.Color(params.colorA) },
      uColorB: { value: new THREE.Color(params.colorB) }
    },
    wireframe: params.wireframe,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false
  })

  // 创建平面
  const geometry = new THREE.PlaneGeometry(4, 4, 128, 128)
  const plane = new THREE.Mesh(geometry, shaderMaterial)
  plane.rotation.x = -Math.PI / 2
  scene.add(plane)

  // 添加网格辅助
  const gridHelper = new THREE.GridHelper(
    params.gridSize,
    params.gridDivisions,
    0x666666,   // 中心线颜色，深灰色
    0x999999    // 网格线颜色，中灰色
  )
  gridHelper.visible = params.showGrid
  scene.add(gridHelper)

  // 添加光源
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(2, 4, 2)
  scene.add(directionalLight)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  // 添加半球光
  const hemiLight = new THREE.HemisphereLight(0x00ffff, 0xffffff, 0.3)
  scene.add(hemiLight)

  window.addEventListener('resize', onWindowResize)
}

function initGUI() {
  gui = new dat.GUI()

  const waveFolder = gui.addFolder('波浪控制')
  waveFolder.add(params, 'waveSpeed', 0.1, 3).name('波浪速度')
  waveFolder.add(params, 'waveHeight', 0, 1).name('波浪高度').onChange(updateUniforms)
  waveFolder.add(params, 'waveFrequency', 1, 8).name('波浪频率').onChange(updateUniforms)
  waveFolder.open()

  const colorFolder = gui.addFolder('颜色控制')
  colorFolder.addColor(params, 'colorA').name('颜色A').onChange(updateUniforms)
  colorFolder.addColor(params, 'colorB').name('颜色B').onChange(updateUniforms)
  colorFolder.open()

  const materialFolder = gui.addFolder('材质控制')
  materialFolder.add(params, 'wireframe').name('线框模式').onChange(updateMaterial)
  materialFolder.add(params, 'showGrid').name('显示网格').onChange(value => {
    const gridHelper = scene.children.find(child => child instanceof THREE.GridHelper)
    if (gridHelper) {
      gridHelper.visible = value
    }
  })
  materialFolder.open()
}

function updateUniforms() {
  const material = scene.children.find(child => child instanceof THREE.Mesh).material
  material.uniforms.uWaveHeight.value = params.waveHeight
  material.uniforms.uWaveFrequency.value = params.waveFrequency
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
  material.uniforms.uTime.value = elapsedTime * params.waveSpeed * 0.5

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