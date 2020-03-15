import { Scene3D, Object3D, ExtendedObject3D } from '@enable3d/phaser-extension'

export default class MainScene extends Scene3D {
  constructor() {
    super({ key: 'MainScene' })
  }

  init() {
    this.requestThirdDimension()
  }

  create() {
    this.accessThirdDimension()
    this.third.warpSpeed('-ground')

    this.third.camera.position.set(0, 2, 20)
    this.third.camera.lookAt(0, 0, 0)

    this.third.physics.debug.enable()
    this.third.physics.debug.mode(0xffffff)

    let mat1 = this.third.add.material({ lambert: { color: 'yellow', transparent: true, opacity: 0.5 } })
    let mat2 = this.third.add.material({ lambert: { color: 'blue', transparent: true, opacity: 0.5 } })

    const pointToPoint = (x: number) => {
      let box1 = this.third.physics.add.box({ y: 2, x }, { custom: mat1 })
      let box2 = this.third.physics.add.box({ y: 2, x: x + 2, z: 0.5, mass: 0 }, { custom: mat2 })
      this.third.physics.add.constraints.pointToPoint(box1.body, box2.body, {
        // the offset from the center of each object
        pivotA: { x: 1.25 / 2, y: -0.5 },
        pivotB: { x: -1.25 / 2, y: -0.5 }
      })
    }

    const dof = (x: number) => {
      let box1 = this.third.physics.add.box({ y: 2, x: x }, { custom: mat1 })
      let box2 = this.third.physics.add.box({ y: 2, x: x + 1.25, z: 0, mass: 0 }, { custom: mat2 })
      this.third.physics.add.constraints.dof(box1.body, box2.body)
    }

    pointToPoint(-4)
    dof(0)
  }

  update() {}
}
