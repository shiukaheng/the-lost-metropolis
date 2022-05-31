// adapted from https://github.com/nytimes/three-loader-3dtiles/blob/dev/examples/r3f/src/loader-3dtiles-r3f.tsx
import { VaporComponent, VaporComponentProps } from '../viewer/ComponentDeclarations';
import { Suspense } from 'react';
import { genericInputs } from '../viewer/genericInputs';
import { NumberType, StringType } from '../viewer/ArgumentTypes';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorObject from './subcomponents/ErrorObject';
import { ProtoTilesObject } from './subcomponents/ProtoTilesObject';

export type TilesObjectProps = {
  url: string;
  dracoDecoderUrl?: string;
  // TilesRenderer props
  fetchOptions?: object;
  errorTarget?: number;
  errorThreshold?: number;
  maxDepth?: number;
  loadSiblings?: boolean,
  displayActiveTiles?: boolean,
  autoDisableRendererCulling?: boolean,
  optimizeRaycast?: boolean,
  onPreprocessURL?: null | ((url: string) => string),
  isTeleportTarget?: boolean,
} & VaporComponentProps

// // By default uses sRGB encoding

export const TilesObject: VaporComponent = ({...props}: TilesObjectProps) => {
  return (
    <ErrorBoundary fallbackRender={({error, resetErrorBoundary}) => (
      <ErrorObject error={error} position={props.position} scale={props.scale} onClick={resetErrorBoundary} objectID={props.objectID}/>
    )}>
      <Suspense fallback={null}>
        <ProtoTilesObject {...props} />
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
  },
  maxDepth: {
    type: NumberType,
    default: 3
  }
}