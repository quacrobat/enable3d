import Phaser from 'phaser'
// import MainScene from './scenes/mainScene'
import PreloadScene from './scenes/preloadScene'
import enable3d, { Canvas, ExtendedObject3D } from '@enable3d/phaser-extension'

import { ThreeScene, PhysicsLoader, THREE } from '@enable3d/phaser-extension/node_modules/@enable3d/three-graphics'

// const config: Phaser.Types.Core.GameConfig = {
//   type: Phaser.WEBGL,
//   backgroundColor: '#ffffff',
//   scale: {
//     mode: Phaser.Scale.FIT,
//     autoCenter: Phaser.Scale.CENTER_BOTH,
//     width: window.innerWidth, // * window.devicePixelRatio,
//     height: window.innerHeight // * window.devicePixelRatio
//   },
//   scene: [PreloadScene, MainScene],
//   ...Canvas({ antialias: false })
// }

// window.addEventListener('load', () => {
//   enable3d(() => new Phaser.Game(config)).withPhysics('/lib')
// })

class MainScene extends ThreeScene {
  box: ExtendedObject3D

  async init() {
    console.log('init')
  }

  create() {
    console.log('create')
    this.warpSpeed()
    this.box = this.add.box({ y: 2 })
    this.physics.add.box({ y: 10 })
    this.physics.debug.enable()

    // green sphere
    const geometry = new THREE.SphereBufferGeometry()
    const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 })
    const cube = new THREE.Mesh(geometry, material) as any
    cube.position.set(0, 10, 0)
    this.scene.add(cube)
    this.physics.add.existing(cube)
  }

  update() {
    this.box.rotation.x += 0.01
    this.box.rotation.y += 0.01
  }
}
PhysicsLoader('/lib', () => new MainScene())
