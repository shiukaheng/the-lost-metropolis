// adapted from https://github.com/nytimes/three-loader-3dtiles/blob/dev/examples/r3f/src/loader-3dtiles-r3f.tsx

import { Loader3DTiles, LoaderProps, LoaderOptions } from 'three-loader-3dtiles'
import { useLoader, useThree, useFrame } from '@react-three/fiber'
import { Loader } from 'three'

class Loader3DTilesBridge extends Loader {
  props: LoaderProps;

  load(url, onLoad, onProgress, onError) {
    const loadTileset = async () => {
      try {
        const result = await Loader3DTiles.load({
           url,
           ...this.props,
          onProgress
         })
         onLoad(result);
      }
      catch(e) {
        console.log("Error loading 3d tiles!", e);
        onError(e);
      }
    }
    loadTileset();
  }
  setProps(props) {
    this.props = props;
  }
};

export function TilesObject(props: LoaderOptions) {
  const threeState = useThree();
  const loaderProps = {
    renderer: threeState.gl,
    options: {
      ...props
    }
  }

  // TODO: Getting type error
  // @ts-ignore
  const { model, runtime } = useLoader(Loader3DTilesBridge, props.url, (loader:Loader3DTilesBridge) => {
    loader.setProps(loaderProps);    
  })

  useFrame(({ gl, camera }, dt) => {
    runtime.update(dt, gl, camera);
  });

  return (
    <group {...props} dispose={runtime.dispose}>
      <primitive object={model} />
    </group>
  )
}