import * as Phaser from 'phaser'
import MainScene from './scenes/mainScene'
import PreloadScene from './scenes/preloadScene'
import enable3d, { Canvas, ExtendedObject3D } from '@enable3d/phaser-extension'

const startPhaserGame = () => {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    backgroundColor: '#ffffff',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: window.innerWidth, // * window.devicePixelRatio,
      height: window.innerHeight // * window.devicePixelRatio
    },
    scene: [PreloadScene, MainScene],
    ...Canvas()
  }

  window.addEventListener('load', () => {
    enable3d(() => new Phaser.Game(config)).withPhysics('/lib')
  })
}

export default startPhaserGame
