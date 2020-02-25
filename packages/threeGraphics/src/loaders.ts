/**
 * @author       Yannick Deubel (https://github.com/yandeu)
 * @copyright    Copyright (c) 2020 Yannick Deubel; Project Url: https://github.com/yandeu/enable3d
 * @license      {@link https://github.com/yandeu/enable3d/blob/master/LICENSE|GNU GPLv3}
 */

import { GLTFLoader } from '@enable3d/three-wrapper/src/examples'
import { FBXLoader } from '@enable3d/three-wrapper/src/examples'

export default class Loaders {
  constructor() {}

  protected loadGLTF(_key: string, _cb: Function) {
    console.log('temporarily disabled')
    // const loader = new GLTFLoader()
    // const data = this.root.cache.binary.get(key)
    // loader.parse(data, '', object => cb(object))
  }

  protected loadFBX(path: string, cb: (object: any) => void) {
    const loader = new FBXLoader()
    loader.load(path, (object: any) => {
      cb(object)
    })
  }
}
