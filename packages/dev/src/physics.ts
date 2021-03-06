import { THREE } from '@enable3d/phaser-extension'
import { AmmoPhysics, PhysicsLoader } from '@enable3d/phaser-extension/node_modules/@enable3d/ammo-physics'

const MainScene = () => {
  // scene
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0f0f0)

  // camera
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(10, 10, 20)
  camera.lookAt(0, 0, 0)

  // renderer
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  // dpr
  const DPR = window.devicePixelRatio
  renderer.setPixelRatio(Math.min(2, DPR))

  // orbit controls
  // const controls = new THREE.OrbitControls(camera, renderer.domElement)

  // light
  scene.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 1))
  scene.add(new THREE.AmbientLight(0x666666))
  const light = new THREE.DirectionalLight(0xdfebff, 1)
  light.position.set(50, 200, 100)
  light.position.multiplyScalar(1.3)

  // physics
  const physics = new AmmoPhysics(scene)
  physics.debug.enable()
  const { factory } = physics

  physics.add.ground({ width: 20, height: 20 })
  physics.add.sphere({ y: 5 })

  // clock
  const clock = new THREE.Clock()

  // loop
  const animate = () => {
    physics.update(clock.getDelta() * 1000)
    physics.updateDebugger()

    renderer.render(scene, camera)

    requestAnimationFrame(animate)
  }
  requestAnimationFrame(animate)
}

const startPhysics = () => {
  PhysicsLoader('/lib', () => MainScene())
}

export default startPhysics
