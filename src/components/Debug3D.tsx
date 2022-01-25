import DebugPlane from './3d/DebugPlane';
import DebugViewport from './DebugViewport';
import {useRef, Suspense} from 'react';
import TestObject from './3d/TestObject';
import { DepthKitObject } from './3d/DepthKitObject';
import InfoObject from './3d/InfoObject';
import LinkObject from './3d/LinkObject';
import ButtonObject from './3d/ButtonObject';

function Debug3D() {
    return ( 
    <DebugViewport className="bg-black absolute h-full w-full">
        <DebugPlane rotation={[Math.PI/2, 0, 0]}/>
        {/* <InfoObject text={"Hello there! This is an exhibit."}/> */}
        {/* <LinkObject url={"https://google.com"}/> */}
        <ButtonObject/>
    </DebugViewport>
    );
}

export default Debug3D