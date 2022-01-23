import DebugPlane from './3d/DebugPlane';
import DebugViewport from './DebugViewport';
import {useRef, Suspense} from 'react';
import TestObject from './3d/TestObject';
import { DepthKitObject } from './3d/DepthKitObject';
import LabelObject from './3d/LabelObject';

function Debug3D() {
    return ( 
    <DebugViewport className="bg-black absolute h-full w-full">
        <DebugPlane rotation={[Math.PI/2, 0, 0]}/>
        <LabelObject></LabelObject>
    </DebugViewport>
    );
}

export default Debug3D