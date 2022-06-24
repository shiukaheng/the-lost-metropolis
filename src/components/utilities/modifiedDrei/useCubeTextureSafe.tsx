import { CubeTextureLoader, CubeTexture } from 'three'
import { useLoader } from '@react-three/fiber'

type Options = {
  path: string
}

export function useCubeTextureSafe(files: string[], { path }: Options={path: ""}): CubeTexture | undefined {
  // @ts-ignore
  var cubeTexture: CubeTexture | undefined
  try {
    // @ts-ignore
    [cubeTexture] = useLoader(
      // @ts-ignore
      CubeTextureLoader,
      [files],
      (loader: CubeTextureLoader) => loader.setPath(path)
    )
  } catch(e) {
    if (e instanceof Promise) {
      cubeTexture = undefined
      throw e
    }
    else {
      console.warn(e)
    }
  }
  return cubeTexture
}

useCubeTextureSafe.preload = (files: string[], { path }: Options) =>
  useLoader.preload(
    // @ts-ignore
    CubeTextureLoader,
    [files],
    (loader: CubeTextureLoader) => loader.setPath(path)
  )