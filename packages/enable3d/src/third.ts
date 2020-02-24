/**
 * @author       Yannick Deubel (https://github.com/yandeu)
 * @copyright    Copyright (c) 2020 Yannick Deubel; Project Url: https://github.com/yandeu/enable3d
 * @license      {@link https://github.com/yandeu/enable3d/blob/master/LICENSE|GNU GPLv3}
 */

import ThreeGraphics from '@enable3d/three/src/index'
import { Phaser3DConfig } from '@enable3d/common/src/types'
import { Scene3D } from '.'
import { WebGLRenderer, Object3D } from '@enable3d/threejs'
import { FirstPersonControlsConfig, FirstPersonControls } from './misc/firstPersonControls'
import { ThirdPersonControlsConfig, ThirdPersonControls } from './misc/thirdPersonControls'
import JoyStick from './misc/joystick'

/**
 * The phaser wrapper for ThreeGraphics, which is a separate module
 */
class Third extends ThreeGraphics {
  public scene3D: Scene3D

  /**
   * Start Phaser3D
   * @param scene Add the current Phaser Scene
   * @param config Phaser3D Config
   */
  constructor(scene3D: Scene3D, config: Phaser3DConfig = {}) {
    // add a custom renderer to ThreeGraphics
    config.renderer = new WebGLRenderer({
      canvas: scene3D.sys.game.canvas as HTMLCanvasElement,
      context: scene3D.sys.game.context as WebGLRenderingContext
    })

    super(config)

    this.scene3D = scene3D

    // xr renderer
    if (this.isXrEnabled) {
      let lastTime = 0
      this.renderer.setAnimationLoop((time: number) => {
        if (this.renderer.xr.isPresenting) {
          const delta = time - lastTime
          lastTime = time
          scene3D.updateLoopXR(time, delta)
          this.renderer.state.reset()
          this.renderer.render(this.scene, this.camera)
        }
      })
    }

    if (!this.isXrEnabled) {
      scene3D.events.on('update', (_time: number, delta: number) => {
        this.mixers.update(delta)
      })
    }

    const view: any = scene3D.add.extern()
    // phaser renderer
    view.render = (_renderer: WebGLRenderer) => {
      if (!this.renderer.xr.isPresenting) {
        scene3D.updateLoopXR(scene3D.sys.game.loop.time, scene3D.sys.game.loop.delta)
        this.renderer.state.reset()
        this.renderer.render(this.scene, this.camera)
      }
    }

    // remove the update event which is used by ThreeGraphics.ts and AmmoPhysics.ts
    scene3D.events.once('shutdown', () => {
      scene3D.events.removeListener('update')
    })
  }

  get controls() {
    return {
      add: this.addControls
    }
  }

  private get addControls() {
    return {
      firstPerson: (target: Object3D, config: FirstPersonControlsConfig) =>
        new FirstPersonControls(this.scene3D, target, config),
      thirdPerson: (target: Object3D, config: ThirdPersonControlsConfig) =>
        new ThirdPersonControls(this.scene3D, target, config),
      joystick: () => new JoyStick()
    }
  }
}

export default Third
