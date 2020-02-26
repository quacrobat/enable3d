import { Object3D, Scene3D, ExtendedObject3D } from '../../../phaser/src/index'

export default class MainScene extends Scene3D {
  sphere: Object3D
  hero: ExtendedObject3D
  robot: ExtendedObject3D
  keys: any
  gameOver: boolean
  playerCanJump: boolean

  constructor() {
    super({ key: 'MainScene' })
  }

  init() {
    this.requestThirdDimension()
    delete this.hero
    delete this.robot
    this.gameOver = false
    this.playerCanJump = true
  }

  create() {
    this.accessThirdDimension()
    this.third.warpSpeed()
    this.third.haveSomeFun(50)
  }

  update(delta, time) {
    this.third.physics.update(delta)
    this.third.physics.updateDebugger()
  }
}
