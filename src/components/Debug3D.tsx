import DebugPlane from './3d/DebugPlane';
import DebugViewport from './DebugViewport';
import {useRef, Suspense, createContext, useContext} from 'react';
import TestObject from './3d/TestObject';
import { DepthKitObject } from './3d/DepthKitObject';
import InfoObject from './3d/InfoObject';
import LinkObject from './3d/LinkObject';
import ButtonObject from './3d/ButtonObject';
import TextPanelObject from './3d/TextPanelObject';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useContextBridge, Text } from '@react-three/drei';

function Debug3D() {
    return (
        <div className="absolute w-full h-full bg-black">
            <SceneWrapper>
                <Scene/>
            </SceneWrapper>
        </div>
    );
}

export default Debug3D