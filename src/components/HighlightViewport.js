import { Canvas, useFrame } from "@react-three/fiber"
import { useRef } from "react"
import * as THREE from 'three'

// Function that creates an array of random 3d positions of length n, normally distriubted around the origin
function randomPositions(n, scale=1) {
      const positions = []
  for (let i = 0; i < n; i++) {
    positions.push(new THREE.Vector3(
      (Math.random() - 0.5)*scale,
      (Math.random() - 0.5)*scale,
      (Math.random() - 0.5)*scale
    ))
  }
  return positions
}

const positions = randomPositions(20, 5)

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
        <div {...props}>
            <Canvas>
            <RigFollowsMouse rigRef={rigRef}/>
            <group ref={rigRef}>
                {
                    positions.map((position, i) => (
                        <TestCube key={i} position={position}/>
                    ))
                }
            </group>
            </Canvas>
        </div>
    );
}

export default HighlightViewport;