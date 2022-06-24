// Based on useTexture hook from drei, but allows invalid urls to return undefined, instead of throwing an error.

import { Texture, TextureLoader } from 'three'
import { useLoader, useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { useLayoutEffect } from 'react'

export const IsObject = (url: any): url is Record<string, string> =>
  url === Object(url) && !Array.isArray(url) && typeof url !== 'function'

export function useTextureSafe<Url extends string[] | string | Record<string, string>>(
  input: Url,
  onLoad?: (texture: Texture | Texture[]) => void
): (Url extends any[] ? Texture[] : Url extends object ? { [key in keyof Url]: Texture } : Texture) | undefined {
  const gl = useThree((state) => state.gl)
  var textures: Texture | Texture[] | undefined
  try {
    textures = useLoader(TextureLoader, IsObject(input) ? Object.values(input) : (input as any))
  } catch(e) {
    if (e instanceof Promise) {
      textures = undefined
      throw e
    } else {
      console.warn(e)
    }
  }
  
  useLayoutEffect(() => {
    if (textures) {
      if (onLoad) {
        onLoad(textures)
      }
    }
  }, [onLoad])

  // https://github.com/mrdoob/three.js/issues/22696
  // Upload the texture to the GPU immediately instead of waiting for the first render
  useEffect(() => {
    if (textures) {
        const array = Array.isArray(textures) ? textures : [textures]
        array.forEach(gl.initTexture)
    }
  }, [gl, textures])

  if ((textures!==undefined) && IsObject(input)) {
    const keys = Object.keys(input)
    const keyed = {} as any
    keys.forEach((key) => Object.assign(keyed, { [key]: textures[keys.indexOf(key)] }))
    return keyed
  } else {
    return textures as any
  }
}

useTextureSafe.preload = (url: string extends any[] ? string[] : string) => useLoader.preload(TextureLoader, url)
useTextureSafe.clear = (input: string | string[]) => useLoader.clear(TextureLoader, input)
