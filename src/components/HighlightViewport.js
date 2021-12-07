import { Canvas, useFrame } from "@react-three/fiber"
import { useRef } from "react"
import * as THREE from 'three'

function TestCube({...props}) {
    return (
        <mesh position={props.position} rotation={props.rotation} scale={props.scale}>
            <boxGeometry args={[1, 1, 1]}/>
            <meshBasicMaterial color="hotpink" wireframe={true}/>
        </mesh>
    );
}

function RigFollowsMouse({rigRef}) {
    return useFrame((state, delta) => {
        const {mouse} = state
        const rig = rigRef.current
        if (!rig) return
        rig.position.set(THREE.MathUtils.damp(rig.position.x, mouse.x, 2, delta), THREE.MathUtils.damp(rig.position.y, mouse.y, 2, delta), 0)
    })
}

function HighlightViewport({...props}) {
    const rigRef = useRef(null)
    return ( 
        <Canvas>
            <RigFollowsMouse rigRef={rigRef}/>
            <group ref={rigRef}>
                <TestCube/>
                <TestCube position={[1.5,1.5,1]}/>
                <TestCube position={[0,1.5,0]}/>
            </group>
        </Canvas>
    );
}

export default HighlightViewport;