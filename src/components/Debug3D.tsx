import DebugPlane from './3d/DebugPlane';
import DebugViewport from './DebugViewport';
import {useRef, Suspense} from 'react';
import TestObject from './3d/TestObject';
import { DepthKitObject } from './3d/DepthKitObject';

function Debug3D() {
    return ( 
    <DebugViewport className="bg-black absolute h-full w-full">
        <DebugPlane rotation={[Math.PI/2, 0, 0]}/>
        <Suspense fallback={<TestObject/>}>
            <DepthKitObject loop={true} position={[0.25, 1.1, 1.85]} scale={[0.001, 0.001, 0.001]} videoUrl={process.env.PUBLIC_URL + "/depthkit/Chae_Demo_Upres.webm"} metaUrl={process.env.PUBLIC_URL + '/depthkit/Chae_Demo_Upres.txt'} posterUrl={process.env.PUBLIC_URL + '/depthkit/Chae_Demo_Upres.png'}/>
        </Suspense>
    </DebugViewport>
    );
}

export default Debug3D