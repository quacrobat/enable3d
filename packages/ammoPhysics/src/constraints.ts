/**
 * @author       Yannick Deubel (https://github.com/yandeu)
 * @copyright    Copyright (c) 2020 Yannick Deubel; Project Url: https://github.com/yandeu/enable3d
 * @license      {@link https://github.com/yandeu/enable3d/blob/master/LICENSE|GNU GPLv3}
 */

// Inspired by https://github.com/donmccurdy/aframe-physics-system/blob/master/src/components/ammo-constraint.js

import PhysicsBody from './physicsBody'
import { XYZ } from '@enable3d/common/dist/types'
import Physics from './physics'

export default class Constraints {
  public tmpTrans: Ammo.btTransform
  public physicsWorld: Ammo.btDiscreteDynamicsWorld

  constructor() {}

  private toAmmoV3(v?: XYZ, d: number = 0) {
    return new Ammo.btVector3(
      typeof v?.x !== 'undefined' ? v.x : d,
      typeof v?.y !== 'undefined' ? v.y : d,
      typeof v?.z !== 'undefined' ? v.z : d
    )
  }

  protected get addConstraints() {
    return {
      lock: (body: PhysicsBody, targetBody: PhysicsBody) => this.lock(body, targetBody),
      fixed: (body: PhysicsBody, targetBody: PhysicsBody) => this.fixed(body, targetBody),
      spring: (
        body: PhysicsBody,
        targetBody: PhysicsBody,
        config?: {
          stiffness?: number
          damping?: number
          angularLock?: boolean
        }
      ) => this.spring(body, targetBody, config),
      slider: (body: PhysicsBody, targetBody: PhysicsBody) => this.slider(body, targetBody),
      hinge: (
        body: PhysicsBody,
        targetBody: PhysicsBody,
        config: {
          pivotA?: XYZ
          pivotB?: XYZ
          axisA?: XYZ
          axisB?: XYZ
        }
      ) => this.hinge(body, targetBody, config),
      coneTwist: (bodyA: PhysicsBody, bodyB: PhysicsBody, pivotA: XYZ = {}, pivotB: XYZ = {}) =>
        this.coneTwist(bodyA, bodyB, pivotA, pivotB),
      pointToPoint: (
        body: PhysicsBody,
        targetBody: PhysicsBody,
        config: {
          pivotA?: XYZ
          pivotB?: XYZ
        }
      ) => this.pointToPoint(body, targetBody, config),
      dof: (
        bodyA: PhysicsBody,
        bodyB: PhysicsBody,
        config?: {
          linearLowerLimit?: XYZ
          linearUpperLimit?: XYZ
          angularLowerLimit?: XYZ
          angularUpperLimit?: XYZ
          center?: boolean
          offset?: XYZ
        }
      ) => this.dof(bodyA, bodyB, config)
    }
  }

  private getTransform(
    bodyA: Ammo.btRigidBody,
    bodyB: Ammo.btRigidBody,
    offset: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 },
    center: boolean = false
  ) {
    offset = { x: 0, y: 0, z: 0, ...offset }

    const centerVector = (v1: Ammo.btVector3, v2: Ammo.btVector3) => {
      var dx = (v1.x() - v2.x()) / 2 + offset.x
      var dy = (v1.y() - v2.y()) / 2 + offset.y
      var dz = (v1.z() - v2.z()) / 2 + offset.z
      return new Ammo.btVector3(dx, dy, dz)
    }

    const transformB = new Ammo.btTransform()
    transformB.setIdentity()

    if (!center) {
      // offset
      transformB.setOrigin(new Ammo.btVector3(offset.x, offset.y, offset.z))

      const transformA = bodyA
        .getCenterOfMassTransform()
        .inverse()
        .op_mul(bodyB.getWorldTransform())
        .op_mul(transformB)

      return { transformA: transformA, transformB: transformB }
    } else {
      const center = centerVector(bodyA.getWorldTransform().getOrigin(), bodyB.getWorldTransform().getOrigin())

      const transformB = new Ammo.btTransform()
      transformB.setIdentity()
      transformB.setOrigin(center)

      const transformA = bodyA
        .getCenterOfMassTransform()
        .inverse()
        .op_mul(bodyB.getWorldTransform())

      transformA.op_mul(transformB)

      console.log(transformA.getOrigin().x())
      console.log(transformB.getOrigin().x())

      return { transformA: transformA, transformB: transformB }
    }
  }

  private lock(bodyA: PhysicsBody, bodyB: PhysicsBody) {
    const zero = { x: 0, y: 0, z: 0 }
    return this.dof(bodyA, bodyB, { angularLowerLimit: zero, angularUpperLimit: zero })
  }

  private dof(
    bodyA: PhysicsBody,
    bodyB: PhysicsBody,
    config: {
      linearLowerLimit?: XYZ
      linearUpperLimit?: XYZ
      angularLowerLimit?: XYZ
      angularUpperLimit?: XYZ
      center?: boolean
      offset?: XYZ
    } = {}
  ) {
    const { offset, center = false } = config
    const off = { x: 0, y: 0, z: 0, ...offset }

    const transform = this.getTransform(bodyA.ammo, bodyB.ammo, off, center)

    const constraint = new Ammo.btGeneric6DofConstraint(
      bodyA.ammo,
      bodyB.ammo,
      transform.transformA,
      transform.transformB,
      true
    )

    const { linearLowerLimit, linearUpperLimit, angularLowerLimit, angularUpperLimit } = config

    const lll = this.toAmmoV3(linearLowerLimit)
    const lul = this.toAmmoV3(linearUpperLimit)
    const all = this.toAmmoV3(angularLowerLimit, -Math.PI)
    const aul = this.toAmmoV3(angularUpperLimit, Math.PI)

    constraint.setLinearLowerLimit(lll)
    constraint.setLinearUpperLimit(lul)
    constraint.setAngularLowerLimit(all)
    constraint.setAngularUpperLimit(aul)

    Ammo.destroy(lll)
    Ammo.destroy(lul)
    Ammo.destroy(all)
    Ammo.destroy(aul)

    this.physicsWorld.addConstraint(constraint, false)

    return constraint
  }

  private fixed(bodyA: PhysicsBody, bodyB: PhysicsBody) {
    const transform = this.getTransform(bodyA.ammo, bodyB.ammo)
    transform.transformA.setRotation(bodyA.ammo.getWorldTransform().getRotation())
    transform.transformB.setRotation(bodyB.ammo.getWorldTransform().getRotation())
    const constraint = new Ammo.btFixedConstraint(bodyA.ammo, bodyB.ammo, transform.transformA, transform.transformB)
    this.physicsWorld.addConstraint(constraint)
  }

  private spring(
    body: PhysicsBody,
    targetBody: PhysicsBody,
    config: {
      stiffness?: number
      damping?: number
      angularLock?: boolean
    } = {}
  ) {
    const { stiffness = 50, damping = 0.01, angularLock = false } = config

    const transform = this.getTransform(body.ammo, targetBody.ammo)
    const constraint = new Ammo.btGeneric6DofSpringConstraint(
      body.ammo,
      targetBody.ammo,
      transform.transformA,
      transform.transformB,
      true
    )

    constraint.setLinearLowerLimit(new Ammo.btVector3(-100, -100, -100))
    constraint.setLinearUpperLimit(new Ammo.btVector3(100, 100, 100))

    if (angularLock) {
      constraint.setAngularLowerLimit(new Ammo.btVector3(0, 0, 0))
      constraint.setAngularUpperLimit(new Ammo.btVector3(0, 0, 0))
    }

    for (let i = 0; i < 3; i++) {
      constraint.enableSpring(i, true)
      constraint.setStiffness(i, stiffness)
      constraint.setDamping(i, damping)
    }
    // I have no idea what setEquilibriumPoint does :/
    // constraint.setEquilibriumPoint()
    this.physicsWorld.addConstraint(constraint)
  }

  // https://pybullet.org/Bullet/phpBB3/viewtopic.php?f=9&t=12690&p=42152&hilit=btSliderConstraint#p42152
  private slider(bodyA: PhysicsBody, bodyB: PhysicsBody) {
    const transform = this.getTransform(bodyA.ammo, bodyB.ammo)

    // var rotation = transform.transformA.getRotation()
    // rotation.setEulerZYX(1, 1, 1)
    // transform.transformA.setRotation(rotation)

    // var rotation = transform.transformB.getRotation()
    // rotation.setEulerZYX(1, 1, 1)
    // transform.transformB.setRotation(rotation)

    // const pi = Math.PI / 8
    // transform.transformA.setRotation(new Ammo.btQuaternion(pi, pi, pi, 1))
    // transform.transformB.setRotation(new Ammo.btQuaternion(pi, pi, pi, 1))
    // const bla1 = new Ammo.btTransform()
    // bla1.setIdentity()
    // var rotation = bla1.getRotation()
    // // rotation.setEulerZYX(1, 1, 1)

    // const bla2 = new Ammo.btTransform()
    // bla2.setIdentity()
    const rotation = transform.transformA.getRotation()
    rotation.setEulerZYX(Math.PI / 2, 0, 0)
    transform.transformA.setRotation(rotation)

    transform.transformB.setRotation(rotation)

    //TODO: support setting linear and angular limits
    const constraint = new Ammo.btSliderConstraint(
      bodyA.ammo,
      bodyB.ammo,
      transform.transformA,
      transform.transformB,
      true
    )

    constraint.setLowerLinLimit(-5)
    constraint.setUpperLinLimit(5)
    constraint.setLowerAngLimit(0)
    constraint.setUpperAngLimit(0)

    this.physicsWorld.addConstraint(constraint)
  }

  private hinge(
    body: PhysicsBody,
    targetBody: PhysicsBody,
    config: {
      pivotA?: XYZ
      pivotB?: XYZ
      axisA?: XYZ
      axisB?: XYZ
    } = {}
  ) {
    const { pivotA, pivotB, axisA, axisB } = config
    const pivotV3 = new Ammo.btVector3(pivotA?.x || 0, pivotA?.y || 0, pivotA?.z || 0)
    const targetPivotV3 = new Ammo.btVector3(pivotB?.x || 0, pivotB?.y || 0, pivotB?.z || 0)
    const axisV3 = new Ammo.btVector3(axisA?.x || 0, axisA?.y || 0, axisA?.z || 0)
    const targetAxisV3 = new Ammo.btVector3(axisB?.x || 0, axisB?.y || 0, axisB?.z || 0)
    const constraint = new Ammo.btHingeConstraint(
      body.ammo,
      targetBody.ammo,
      pivotV3,
      targetPivotV3,
      axisV3,
      targetAxisV3,
      true
    )
    this.physicsWorld.addConstraint(constraint)
  }

  private coneTwist(bodyA: PhysicsBody, bodyB: PhysicsBody, pivotA: XYZ = {}, pivotB: XYZ = {}) {
    const frameA = new Ammo.btTransform()
    frameA.setIdentity()
    frameA.getOrigin().setValue(pivotA?.x || 0, pivotA?.y || 0, pivotA?.z || 0)

    const frameB = new Ammo.btTransform()
    frameB.setIdentity()
    frameB.getOrigin().setValue(pivotB?.x || 0, pivotB?.y || 0, pivotB?.z || 0)

    const t = this.getTransform(bodyA.ammo, bodyB.ammo)

    const constraint = new Ammo.btConeTwistConstraint(bodyB.ammo, bodyA.ammo, frameA, frameB)
    // @ts-ignore
    constraint.setLimit(1, 1, Math.PI / 8)

    constraint.setAngularOnly(true)

    this.physicsWorld.addConstraint(constraint)
  }

  private pointToPoint(
    body: PhysicsBody,
    targetBody: PhysicsBody,
    config: {
      pivotA?: XYZ
      pivotB?: XYZ
    } = {}
  ) {
    const { pivotA, pivotB } = config
    const pivotV3 = new Ammo.btVector3(pivotA?.x || 0, pivotA?.y || 0, pivotA?.z || 0)
    const targetPivotV3 = new Ammo.btVector3(pivotB?.x || 0, pivotB?.y || 0, pivotB?.z || 0)
    const constraint = new Ammo.btPoint2PointConstraint(body.ammo, targetBody.ammo, pivotV3, targetPivotV3)
    this.physicsWorld.addConstraint(constraint)
  }
}
