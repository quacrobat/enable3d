import Phaser from 'phaser'
// import MainScene from './scenes/mainScene'
import PreloadScene from './scenes/preloadScene'
import enable3d, { Canvas } from '@enable3d/phaser-extension'

import { ThreeScene, PhysicsLoader } from '@enable3d/phaser-extension/node_modules/@enable3d/three-graphics'

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
  async init() {
    console.log('init')
  }

  create() {
    console.log('create')
    this.warpSpeed()
    this.add.box({ y: 0.5 })
    this.physics.add.box({ y: 10 })
    this.physics.debug.enable()
  }

  update() {
    // console.log('update')
  }
}
PhysicsLoader('/lib', () => new MainScene())
