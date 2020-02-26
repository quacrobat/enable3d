/**
 * @author       Yannick Deubel (https://github.com/yandeu)
 * @copyright    Copyright (c) 2020 Yannick Deubel; Project Url: https://github.com/yandeu/enable3d
 * @license      {@link https://github.com/yandeu/enable3d/blob/master/LICENSE|GNU GPLv3}
 */

import { ThreeGraphics } from './index'
import { Clock } from '@enable3d/three-wrapper/src/index'

class Scene3D extends ThreeGraphics {
  clock: Clock
  init: () => void
  preload: () => void
  create: () => void
  update: (time: number, delta: number) => void

  constructor(config = {}) {
    super(config)
    this._init()
    this._preload()
    this._create()
    this._update()
  }

  private _init() {
    this.clock = new Clock()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(this.renderer.domElement)
    this.init()
  }

  private _preload() {
    this.preload()
  }

  private _create() {
    this.create()
    this._update()
  }

  private _update() {
    requestAnimationFrame(this._update.bind(this))

    const time = this.clock.getElapsedTime()
    const delta = this.clock.getDelta()

    this.update(time, delta)

    this.physics?.update?.(delta * 1000)
    this.renderer.render(this.scene, this.camera)
  }
}
