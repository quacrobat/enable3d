/**
 * @author       Yannick Deubel (https://github.com/yandeu)
 * @copyright    Copyright (c) 2020 Yannick Deubel; Project Url: https://github.com/yandeu/enable3d
 * @license      {@link https://github.com/yandeu/enable3d/blob/master/LICENSE|GNU GPLv3}
 */

import {
  SphereConfig,
  MaterialConfig,
  BoxConfig,
  GroundConfig,
  CylinderConfig,
  ExtendedObject3D,
  ExtrudeConfig,
  TorusConfig,
  AddExistingConfig
} from '../common/types'
import Factories from '../three/factories'

interface Shapes {}

class Shapes {
  public tmpTrans: Ammo.btTransform
  public physicsWorld: Ammo.btDiscreteDynamicsWorld
  protected objectsAmmo: { [ptr: number]: any } = {}
  protected addExisting: (object: ExtendedObject3D, config?: AddExistingConfig) => void
  protected factory: Factories

  protected addSphere(sphereConfig: SphereConfig = {}, materialConfig: MaterialConfig = {}) {
    const sphere = this.factory.addSphere(sphereConfig, materialConfig)
    this.addExisting(sphere, sphereConfig)
    return sphere
  }

  protected addBox(boxConfig: BoxConfig = {}, materialConfig: MaterialConfig = {}) {
    const box = this.factory.addBox(boxConfig, materialConfig)
    this.addExisting(box, boxConfig)
    return box
  }

  protected addGround(groundConfig: GroundConfig, materialConfig: MaterialConfig = {}) {
    const ground = this.factory.addGround(groundConfig, materialConfig)
    const config = { ...groundConfig, mass: 0, collisionFlags: 1 }
    this.addExisting(ground, config)
    return ground
  }

  protected addCylinder(cylinderConfig: CylinderConfig = {}, materialConfig: MaterialConfig = {}) {
    const cylinder = this.factory.addCylinder(cylinderConfig, materialConfig)
    this.addExisting(cylinder, cylinderConfig)
    return cylinder
  }

  protected addTorus(torusConfig: TorusConfig = {}, materialConfig: MaterialConfig = {}) {
    const torus = this.factory.addTorus(torusConfig, materialConfig)
    this.addExisting(torus, torusConfig)
    return torus
  }

  protected addExtrude(extrudeConfig: ExtrudeConfig, materialConfig: MaterialConfig = {}) {
    const object = this.factory.addExtrude(extrudeConfig, materialConfig)
    object.translateX(1)
    this.addExisting(object)
    return object
  }
}

export default Shapes
