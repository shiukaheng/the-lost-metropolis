// adapted from https://github.com/nytimes/three-loader-3dtiles/blob/dev/examples/r3f/src/loader-3dtiles-r3f.tsx

import { Loader3DTiles, LoaderProps, LoaderOptions } from 'three-loader-3dtiles'
import { useLoader, useThree, useFrame } from '@react-three/fiber'
import { Loader, MeshBasicMaterial } from 'three'
import { VaporComponent, VaporComponentProps } from '../viewer/ComponentDeclarations';
import { Suspense } from 'react';
import { genericInputs } from '../viewer/genericInputs';
import { StringType } from '../viewer/ArgumentTypes';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorObject from './subcomponents/ErrorObject';

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

type ProtoTilesObjectProps = {
  url: string;
} & LoaderOptions

export function ProtoTilesObject(props: ProtoTilesObjectProps) {
  const threeState = useThree();
  const loaderProps = {
    renderer: threeState.gl,
    options: {
      // material: new MeshBasicMaterial(),
      ...props
    }
  }

  // TODO: Getting type error
  // @ts-ignore
  const { model, runtime } = useLoader(Loader3DTilesBridge, props.url, (loader:Loader3DTilesBridge) => {
    loader.setProps(loaderProps);    
  })

  console.log(model)

  useFrame(({ gl, camera }, dt) => {
    runtime.update(dt, gl, camera);
  });

  return (
    <group {...props} dispose={runtime.dispose}>
      <primitive object={model} />
    </group>
  )
}

type TilesObjectProps = {
  url: string;
} & VaporComponentProps

// By default uses sRGB encoding

export const TilesObject: VaporComponent = ({url, ...props}: TilesObjectProps) => {
  return (
    <ErrorBoundary fallbackRender={({error, resetErrorBoundary}) => (
      <ErrorObject error={error} position={props.position} scale={props.scale} onClick={resetErrorBoundary} objectID={props.objectID}/>
    )}>
      <Suspense fallback={null}>
        <ProtoTilesObject url={url} dracoDecoderPath={"https://unpkg.com/three@0.137.0/examples/js/libs/draco"} basisTranscoderPath={"https://unpkg.com/three@0.137.0/examples/js/libs/basis"} {...props} />
      </Suspense>
    </ErrorBoundary>
  )
}

TilesObject.displayName = "3D Tiles"
TilesObject.componentType = "TilesObject"
TilesObject.inputs = {
  ...genericInputs,
  url: {
    type: StringType,
    default: ""
  }
}