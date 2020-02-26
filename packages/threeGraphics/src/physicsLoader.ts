import loadAmmoModule from '@enable3d/common/src/wasmLoader'

const PhysicsLoader = (path: string, callback: Function) => {
  window.__loadPhysics = true
  loadAmmoModule(path, () => {
    Ammo().then(() => {
      callback()
    })
  })
}

export { PhysicsLoader }
