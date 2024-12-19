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
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import * as dat from 'dat.gui'
import BackButton from '@/components/common/BackButton.vue'

const canvasRef = ref(null)
let scene, camera, renderer, controls, gui
let bloomComposer, finalComposer
let cube, sphere

// 发光层
const BLOOM_LAYER = 1
const bloomLayer = new THREE.Layers()
bloomLayer.set(BLOOM_LAYER)

// 自定义着色器
const finalShader = {
  uniforms: {
    baseTexture: { value: null },
    bloomTexture: { value: null }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D baseTexture;
    uniform sampler2D bloomTexture;
    varying vec2 vUv;
    void main() {
      gl_FragColor = texture2D(baseTexture, vUv) + 
                    vec4(1.0, 1.0, 1.0, 1.0) * texture2D(bloomTexture, vUv);
    }
  `
}

// GUI 控制参数
const params = {
  exposure: 1,
  bloomStrength: 3,
  bloomThreshold: 0,
  bloomRadius: 0.5,
  rotationSpeed: 0.005,
  showAxes: true,
  axesSize: 10,
  toggleCubeGlow: true,
  toggleSphereGlow: false
}

onMounted(() => {
  initScene()
  initBloom()
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

  createObjects()

  // 添加坐标轴
  const axesHelper = new THREE.AxesHelper(params.axesSize)
  axesHelper.visible = params.showAxes
  scene.add(axesHelper)

  window.addEventListener('resize', onWindowResize)
}

function createObjects() {
  // 创建立方体
  const cubeGeometry = new THREE.BoxGeometry(3, 3, 3)
  const cubeMaterial = new THREE.MeshStandardMaterial({
    color: 0x409EFF,
    metalness: 0.5,
    roughness: 0.5
  })
  cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
  cube.position.x = -2
  cube.layers.enable(BLOOM_LAYER)
  scene.add(cube)

  // 创建球体
  const sphereGeometry = new THREE.SphereGeometry(2, 32, 32)
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0xFF4500,
    metalness: 0.5,
    roughness: 0.5
  })
  sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  sphere.position.x = 2
  scene.add(sphere)

  // 添加光源
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(1, 1, 1)
  scene.add(directionalLight)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)
}

function initBloom() {
  const renderScene = new RenderPass(scene, camera)

  // 发光通道
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    params.bloomStrength,
    params.bloomRadius,
    params.bloomThreshold
  )

  // 发光合成器
  bloomComposer = new EffectComposer(renderer)
  bloomComposer.addPass(renderScene)
  bloomComposer.addPass(bloomPass)

  // 最终合成器
  const finalPass = new ShaderPass(
    new THREE.ShaderMaterial({
      uniforms: finalShader.uniforms,
      vertexShader: finalShader.vertexShader,
      fragmentShader: finalShader.fragmentShader
    })
  )
  finalPass.needsSwap = true

  finalComposer = new EffectComposer(renderer)
  finalComposer.addPass(renderScene)
  finalComposer.addPass(finalPass)

  // 设置纹理
  finalShader.uniforms.bloomTexture.value = bloomComposer.renderTarget2.texture
}

function initGUI() {
  gui = new dat.GUI()

  const bloomFolder = gui.addFolder('发光设置')
  bloomFolder.add(params, 'exposure', 0.1, 2).name('曝光').onChange(value => {
    renderer.toneMappingExposure = Math.pow(value, 4.0)
  })
  bloomFolder.add(params, 'bloomStrength', 0.0, 5.0).name('发光强度').onChange(value => {
    bloomComposer.passes[1].strength = Number(value)
  })
  bloomFolder.add(params, 'bloomThreshold', 0.0, 1.0).name('发光阈值').onChange(value => {
    bloomComposer.passes[1].threshold = Number(value)
  })
  bloomFolder.add(params, 'bloomRadius', 0.0, 1.0).name('发光半径').onChange(value => {
    bloomComposer.passes[1].radius = Number(value)
  })
  bloomFolder.open()

  const objectsFolder = gui.addFolder('物体控制')
  objectsFolder.add(params, 'toggleCubeGlow').name('立方体发光').onChange(value => {
    if (value) {
      cube.layers.enable(BLOOM_LAYER)
    } else {
      cube.layers.disable(BLOOM_LAYER)
    }
  })
  objectsFolder.add(params, 'toggleSphereGlow').name('球体发光').onChange(value => {
    if (value) {
      sphere.layers.enable(BLOOM_LAYER)
    } else {
      sphere.layers.disable(BLOOM_LAYER)
    }
  })
  objectsFolder.open()

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

function darkenNonBloomed(obj) {
  if (obj.isMesh && !obj.layers.test(bloomLayer)) {
    obj.material.color.multiplyScalar(0.1)
  }
}

function restoreMaterial(obj) {
  if (obj.isMesh && !obj.layers.test(bloomLayer)) {
    obj.material.color.multiplyScalar(10)
  }
}

function animate() {
  requestAnimationFrame(animate)
  controls.update()

  if (cube && sphere) {
    cube.rotation.x += params.rotationSpeed
    cube.rotation.y += params.rotationSpeed
    sphere.rotation.x += params.rotationSpeed
    sphere.rotation.y += params.rotationSpeed
  }

  // 渲染发光通道
  scene.traverse(darkenNonBloomed)
  bloomComposer.render()
  scene.traverse(restoreMaterial)

  // 最终渲染
  finalComposer.render()
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  bloomComposer.setSize(window.innerWidth, window.innerHeight)
  finalComposer.setSize(window.innerWidth, window.innerHeight)
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