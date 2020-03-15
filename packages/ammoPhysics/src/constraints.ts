/**
 * @author       Yannick Deubel (https://github.com/yandeu)
 * @copyright    Copyright (c) 2020 Yannick Deubel; Project Url: https://github.com/yandeu/enable3d
 * @license      {@link https://github.com/yandeu/enable3d/blob/master/LICENSE|GNU GPLv3}
 */

// Inspired by https://github.com/donmccurdy/aframe-physics-system/blob/master/src/components/ammo-constraint.js

import PhysicsBody from './physicsBody'
import { XYZ } from '@enable3d/common/dist/types'

export default class Constraints {
  public tmpTrans: Ammo.btTransform
  public physicsWorld: Ammo.btDiscreteDynamicsWorld

  constructor() {}
  protected get addConstraints() {
    return {
      lock: (body: PhysicsBody, targetBody: PhysicsBody) => this.lock(body, targetBody),
      fixed: (body: PhysicsBody, targetBody: PhysicsBody) => this.fixed(body, targetBody),
      spring: (
        body: PhysicsBody,
        targetBody: PhysicsBody,
        config: {
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
          pivot?: XYZ
          targetPivot?: XYZ
          axis?: XYZ
          targetAxis?: XYZ
        }
      ) => this.hinge(body, targetBody, config),
      coneTwist: (body: PhysicsBody, targetPivot: XYZ) => this.coneTwist(body, targetPivot),
      pointToPoint: (
        body: PhysicsBody,
        targetBody: PhysicsBody,
        config: {
          pivot?: XYZ
          targetPivot?: XYZ
        }
      ) => this.pointToPoint(body, targetBody, config),
      dof: (bodyA: PhysicsBody, bodyB: PhysicsBody, config: any = {}) => this.dof(bodyA, bodyB, config)
    }
  }

  private getTransform(
    bodyA: Ammo.btRigidBody,
    bodyB: Ammo.btRigidBody,
    offset: { x: number; y: number; z: number } = { x: 0, y: -0.5, z: 0 },
    center: boolean = true
  ) {
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
    config: { linearLowerLimit?: XYZ; linearUpperLimit?: XYZ; angularLowerLimit?: XYZ; angularUpperLimit?: XYZ } = {}
  ) {
    const transform = this.getTransform(bodyA.ammo, bodyB.ammo)

    const constraint = new Ammo.btGeneric6DofConstraint(
      bodyA.ammo,
      bodyB.ammo,
      transform.transformA,
      transform.transformB,
      true
    )

    const { linearLowerLimit, linearUpperLimit, angularLowerLimit, angularUpperLimit } = config

    const toAmmoV3 = (v?: XYZ, d: number = 0) => {
      return new Ammo.btVector3(
        typeof v?.x !== 'undefined' ? v.x : d,
        typeof v?.y !== 'undefined' ? v.y : d,
        typeof v?.z !== 'undefined' ? v.z : d
      )
    }

    const lll = toAmmoV3(linearLowerLimit)
    const lul = toAmmoV3(linearUpperLimit)
    const all = toAmmoV3(angularLowerLimit, -Math.PI)
    const aul = toAmmoV3(angularUpperLimit, Math.PI)
    // const all = toAmmoV3(angularLowerLimit, -Math.PI / 8)
    // const aul = toAmmoV3(angularUpperLimit, Math.PI / 8)

    console.log(all.x())

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

  private slider(body: PhysicsBody, targetBody: PhysicsBody) {
    const transform = this.getTransform(body.ammo, targetBody.ammo)
    //TODO: support setting linear and angular limits
    const constraint = new Ammo.btSliderConstraint(
      body.ammo,
      targetBody.ammo,
      transform.transformA,
      transform.transformB,
      true
    )
    constraint.setLowerLinLimit(-1)
    constraint.setUpperLinLimit(1)
    // constraint.setLowerAngLimit();
    // constraint.setUpperAngLimit();
    this.physicsWorld.addConstraint(constraint)
  }

  private hinge(
    body: PhysicsBody,
    targetBody: PhysicsBody,
    config: {
      pivotA?: XYZ
      pivotB?: XYZ
      axis?: XYZ
      targetAxis?: XYZ
    } = {}
  ) {
    const { pivotA, pivotB, axis, targetAxis } = config
    const pivotV3 = new Ammo.btVector3(pivotA?.x || 0, pivotA?.y || 0, pivotA?.z || 0)
    const targetPivotV3 = new Ammo.btVector3(pivotB?.x || 0, pivotB?.y || 0, pivotB?.z || 0)
    const axisV3 = new Ammo.btVector3(axis?.x || 0, axis?.y || 0, axis?.z || 1)
    const targetAxisV3 = new Ammo.btVector3(targetAxis?.x || 0, targetAxis?.y || 0, targetAxis?.z || 1)
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

  private coneTwist(body: PhysicsBody, targetPivot: XYZ = {}) {
    const pivotTransform = new Ammo.btTransform()
    pivotTransform.setIdentity()
    pivotTransform.getOrigin().setValue(targetPivot?.x || 0, targetPivot?.y || 0, targetPivot?.z || 0)
    const constraint = new Ammo.btConeTwistConstraint(body.ammo, pivotTransform)
    this.physicsWorld.addConstraint(constraint)
  }

  private pointToPoint(
    body: PhysicsBody,
    targetBody: PhysicsBody,
    config: {
      pivot?: XYZ
      targetPivot?: XYZ
    } = {}
  ) {
    const { pivot, targetPivot } = config
    const pivotV3 = new Ammo.btVector3(pivot?.x || 0, pivot?.y || 0, pivot?.z || 0)
    const targetPivotV3 = new Ammo.btVector3(targetPivot?.x || 0, targetPivot?.y || 0, targetPivot?.z || 0)
    const constraint = new Ammo.btPoint2PointConstraint(body.ammo, targetBody.ammo, pivotV3, targetPivotV3)
    this.physicsWorld.addConstraint(constraint)
  }
}
