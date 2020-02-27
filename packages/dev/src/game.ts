import Phaser from 'phaser'
// import MainScene from './scenes/mainScene'
import PreloadScene from './scenes/preloadScene'
import enable3d, { Canvas, ExtendedObject3D } from '@enable3d/phaser-extension'

import { ThreeScene, PhysicsLoader, THREE } from '@enable3d/phaser-extension/node_modules/@enable3d/three-graphics'
// import { Texture } from '../../threeWrapper/src'

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
  heroModel: any

  side: any
  top: any

  async init() {
    const DPR = window.devicePixelRatio
    this.renderer.setPixelRatio(Math.min(2, DPR))
  }

  async preload() {
    this.side = await this.load.async.texture('/assets/grass.jpg')
    this.top = await this.load.async.texture('/assets/heightmap-simple.png')
    this.heroModel = await this.load.async.gltf('/assets/hero.glb')
  }

  create() {
    console.log('create')
    this.warpSpeed()

    // collisionFlags 2 means this will be a kinematic body
    this.box = this.physics.add.box({ y: 2, collisionFlags: 2 })

    this.physics.add.box({ y: 10 })
    this.physics.debug.enable()

    // texture cube
    const textureCube = this.texture.cube([this.side, this.side, this.top, this.top, this.side, this.side])
    textureCube.texture.front.repeat.set(4, 1)
    textureCube.texture.back.repeat.set(4, 1)
    this.physics.add.box({ y: 2, width: 4 }, { custom: textureCube.materials })

    // add hero
    const hero = this.heroModel.scene as ExtendedObject3D
    hero.scale.set(0.1, 0.1, 0.1)
    hero.position.set(2, 0, 2)
    this.scene.add(this.heroModel.scene)

    // green sphere
    const geometry = new THREE.SphereBufferGeometry()
    const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 })
    const cube = new THREE.Mesh(geometry, material) as any
    cube.position.set(0, 10, 0)
    this.scene.add(cube)
    this.physics.add.existing(cube)

    // merge children to compound shape
    const body = this.add.box({ z: 5, height: 0.8, y: 1, width: 0.4, depth: 0.4 }, { lambert: { color: 0xffff00 } })
    const head = this.add.sphere({ z: 0, radius: 0.25, y: -0.8 }, { lambert: { color: 0xffff00 } })
    body.add(head, cube.clone())
    body.position.set(5, 5, 5)
    body.rotation.set(0, 0.4, 0.2)
    this.physics.add.existing(body)
  }

  update() {
    // this works only on kinematic objects
    this.box.rotation.x += 0.01
    this.box.rotation.y += 0.01
    this.box.body.needUpdate = true
  }
}
PhysicsLoader('/lib', () => new MainScene())
