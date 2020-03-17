import { Scene3D, Object3D, ExtendedObject3D } from '@enable3d/phaser-extension'

export default class MainScene extends Scene3D {
  box: ExtendedObject3D
  box2: ExtendedObject3D

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

    let i = 2

    const changeMode = () => {
      let mode = i % 3 === 0 ? 1 + 2048 : i % 3 === 1 ? 1 + 4096 : 1 + 2048 + 4096
      this.third.physics.debug.mode(mode)
      i++
    }
    changeMode()

    this.time.addEvent({
      loop: true,
      delay: 4000,
      callback: changeMode
    })

    let mat1 = this.third.add.material({ lambert: { color: 'yellow', transparent: true, opacity: 0.5 } })
    let mat2 = this.third.add.material({ lambert: { color: 'blue', transparent: true, opacity: 0.5 } })
    let mat3 = this.third.add.material({ lambert: { color: 'green', transparent: true, opacity: 0.5 } })

    const pointToPoint = (x: number) => {
      let box1 = this.third.physics.add.box({ y: 2, x, mass: 0 }, { custom: mat1 })
      let box2 = this.third.physics.add.box({ y: 2, x: x + 2, z: 0.5 }, { custom: mat2 })
      this.third.physics.add.constraints.pointToPoint(box1.body, box2.body, {
        // the offset from the center of each object
        pivotA: { x: 1.5 },
        pivotB: { x: -1.5 }
      })
    }

    const dof = (x: number) => {
      let box1 = this.third.physics.add.box({ y: 2, x: x, collisionFlags: 2, mass: 100 }, { custom: mat1 })
      this.box2 = box1
      let box2 = this.third.physics.add.box({ y: 0, x: x, z: 0 }, { custom: mat2 })
      this.third.physics.add.constraints.dof(box1.body, box2.body, { center: true })
    }

    const hinge = (x: number) => {
      let box1 = this.third.physics.add.box({ depth: 0.25, y: 2, x: x, mass: 0 }, { custom: mat1 })
      let box2 = this.third.physics.add.box({ depth: 0.25, y: 2, x: x + 1.25 }, { custom: mat2 })
      let box3 = this.third.physics.add.box({ depth: 0.25, y: 2, x: x + 1.25 }, { custom: mat3 })

      this.third.physics.add.constraints.hinge(box1.body, box2.body, {
        pivotA: { y: -0.65 },
        pivotB: { y: 0.65 },
        axisA: { x: 1 },
        axisB: { x: 1 }
      })
      this.third.physics.add.constraints.hinge(box2.body, box3.body, {
        pivotA: { y: -0.65 },
        pivotB: { y: 0.65 },
        axisA: { x: 1 },
        axisB: { x: 1 }
      })
    }

    const spring = (x: number) => {
      let box1 = this.third.physics.add.box({ y: 2, x: x, z: 0, mass: 0 }, { custom: mat1 })
      let box2 = this.third.physics.add.box({ y: 1, x: x, z: 0, mass: 2 }, { custom: mat2 })
      let box3 = this.third.physics.add.box({ y: 0, x: x, z: 0, mass: 8 }, { custom: mat3 })
      this.third.physics.add.constraints.spring(box1.body, box2.body, { damping: 250 })
      this.third.physics.add.constraints.spring(box2.body, box3.body, { damping: 20 })
    }

    const slider = (x: number) => {
      let box1 = this.third.physics.add.cylinder(
        { height: 6, y: 2, x: x, radiusTop: 0.6, radiusBottom: 0.6, collisionFlags: 6, mass: 100 },
        { custom: mat1 }
      )
      this.box = box1
      // this.box.rotateY(Math.PI / 2 - 0.1)
      let box2 = this.third.physics.add.cylinder(
        { height: 4, y: 2, x: x, radiusTop: 0.4, radiusBottom: 0.4, collisionFlags: 4, mass: 1 },
        { custom: mat2 }
      )

      this.third.physics.add.constraints.slider(box1.body, box2.body)
    }

    pointToPoint(-8)
    dof(8)
    hinge(4)
    spring(0)
    slider(-4)
  }

  update() {
    this.box.rotation.x += 0.01
    this.box.body.needUpdate = true

    this.box2.rotation.x += 0.01
    this.box2.body.needUpdate = true
  }
}
