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
let darkMaterial, materials = {}

// 发光层配置
const ENTIRE_SCENE = 0, BLOOM_SCENE = 1
const bloomLayer = new THREE.Layers()
bloomLayer.set(BLOOM_SCENE)

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
      vec4 base = texture2D(baseTexture, vUv);
      vec4 bloom = texture2D(bloomTexture, vUv);
      gl_FragColor = base + bloom;
    }
  `
}

// GUI 控制参数
const params = {
  exposure: 1,
  bloomStrength: 1.5,
  bloomThreshold: 0,
  bloomRadius: 0,
  rotationSpeed: 0.005,
  showAxes: true,
  axesSize: 10,
  scene: 'Scene with Glow'
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
  camera.position.set(0, 0, 15)

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.toneMapping = THREE.ReinhardToneMapping

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  setupScene()

  // 添加坐标轴
  const axesHelper = new THREE.AxesHelper(params.axesSize)
  axesHelper.visible = params.showAxes
  scene.add(axesHelper)

  window.addEventListener('resize', onWindowResize)
}

function setupScene() {
  const geometry = new THREE.IcosahedronGeometry(1, 15)
  
  for (let i = 0; i < 10; i++) {
    const color = new THREE.Color()
    color.setHSL(i * 0.1, 0.8, 0.5)

    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.5,
      metalness: 0.5
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.x = Math.random() * 10 - 5
    mesh.position.y = Math.random() * 10 - 5
    mesh.position.z = Math.random() * 10 - 5
    mesh.rotation.x = Math.random() * 2 * Math.PI
    mesh.rotation.y = Math.random() * 2 * Math.PI
    mesh.rotation.z = Math.random() * 2 * Math.PI
    mesh.scale.setScalar(Math.random() * 0.5 + 0.5)

    // 随机设置是否发光
    if (Math.random() > 0.5) {
      mesh.layers.enable(BLOOM_SCENE)
    }

    scene.add(mesh)
  }

  // 添加光源
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(1, 1, 1)
  scene.add(directionalLight)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)
}

function initBloom() {
  darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' })

  const renderScene = new RenderPass(scene, camera)

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    params.bloomStrength,
    params.bloomRadius,
    params.bloomThreshold
  )

  bloomComposer = new EffectComposer(renderer)
  bloomComposer.addPass(renderScene)
  bloomComposer.addPass(bloomPass)

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

  finalShader.uniforms.bloomTexture.value = bloomComposer.renderTarget2.texture
}

function initGUI() {
  gui = new dat.GUI()

  const bloomFolder = gui.addFolder('发光设置')
  bloomFolder.add(params, 'exposure', 0.1, 2).name('曝光').onChange(value => {
    renderer.toneMappingExposure = Math.pow(value, 4.0)
  })
  bloomFolder.add(params, 'bloomStrength', 0.0, 3.0).name('发光强度').onChange(value => {
    bloomComposer.passes[1].strength = Number(value)
  })
  bloomFolder.add(params, 'bloomThreshold', 0.0, 1.0).name('发光阈值').onChange(value => {
    bloomComposer.passes[1].threshold = Number(value)
  })
  bloomFolder.add(params, 'bloomRadius', 0.0, 1.0).name('发光半径').onChange(value => {
    bloomComposer.passes[1].radius = Number(value)
  })
  bloomFolder.open()

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
  if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
    materials[obj.uuid] = obj.material
    obj.material = darkMaterial
  }
}

function restoreMaterial(obj) {
  if (materials[obj.uuid]) {
    obj.material = materials[obj.uuid]
    delete materials[obj.uuid]
  }
}

function animate() {
  requestAnimationFrame(animate)
  controls.update()

  // 旋转所有物体
  scene.traverse(obj => {
    if (obj.isMesh) {
      obj.rotation.x += params.rotationSpeed
      obj.rotation.y += params.rotationSpeed
    }
  })

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