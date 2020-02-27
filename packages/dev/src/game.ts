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
  }

  update() {
    // this is how you update a kinematic body
    this.box.body.transform()
    const rot = this.box.body.getRotation()
    this.box.body.setRotation(rot.x + 0.01, rot.y, rot.z)
    this.box.body.refresh()
  }
}
PhysicsLoader('/lib', () => new MainScene())
