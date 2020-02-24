/**
 * @author       Yannick Deubel (https://github.com/yandeu)
 * @copyright    Copyright (c) 2020 Yannick Deubel; Project Url: https://github.com/yandeu/enable3d
 * @license      {@link https://github.com/yandeu/enable3d/blob/master/LICENSE|GNU GPLv3}
 */

import ThreeGraphics from './three'
import { Phaser3DConfig } from '@enable3d/common/src/types'
import { Scene3D } from '.'
import { WebGLRenderer } from '@enable3d/threejs'

/**
 * The phaser wrapper for ThreeGraphics, which is a separate module
 */
class Third extends ThreeGraphics {
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

    super(scene3D, config)

    const view: any = scene3D.add.extern()
    // phaser renderer
    view.render = (_renderer: WebGLRenderer) => {
      if (!this.renderer.xr.isPresenting) {
        this.root.updateLoopXR(this.root.sys.game.loop.time, this.root.sys.game.loop.delta)
        this.renderer.state.reset()
        this.renderer.render(this.scene, this.camera)
      }
    }

    // remove the update event which is used by ThreeGraphics.ts and AmmoPhysics.ts
    scene3D.events.once('shutdown', () => {
      scene3D.events.removeListener('update')
    })
  }
}

export default Third
