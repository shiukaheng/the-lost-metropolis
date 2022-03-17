import { Canvas, useFrame } from "@react-three/fiber"
import { useRef, useContext, useEffect, useLayoutEffect } from "react"
import * as THREE from 'three'
import { PotreeManager } from "../../3d/managers/PotreeManager"
import { useContextBridge } from "@react-three/drei"
import { useFollowMouse } from "../../../utilities"

function FollowMouse({object, posOffsetIntensity=[1, 1], rotOffsetIntensity=[0, 0], lambda=2, captureMode="window"}) {
    const mousePosRef = useFollowMouse()
    return useFrame((state, delta) => {
        const {mouse} = state
        const rig = object.current
        if (!rig) return
        var [x, y] = [0, 0]
        if (captureMode === "canvas") {
            [x, y] = [mouse.x, mouse.y]
        } else if (captureMode === "window") {
            [x, y] = [mousePosRef.current[0], mousePosRef.current[1]]
        }
        rig.position.set(THREE.MathUtils.damp(rig.position.x, x*posOffsetIntensity[0], lambda, delta), THREE.MathUtils.damp(rig.position.y, y*posOffsetIntensity[1], lambda, delta), 0)
        rig.rotation.set(THREE.MathUtils.damp(rig.rotation.x, -y*rotOffsetIntensity[0], lambda, delta), THREE.MathUtils.damp(rig.rotation.y, -x*rotOffsetIntensity[1], lambda, delta), 0)
    })
}

function HighlightViewport({children, posOffsetIntensity=[1, 1], rotOffsetIntensity=[0, 0], lambda=2, captureMode="window", ...props}) {
    const rigRef = useRef(null)
    return (
        <div {...props}>
            {/* Todo: Need to replace this with something derived with ViewerManager */}
            <Canvas>
                <PotreeManager>
                    <FollowMouse object={rigRef} posOffsetIntensity={posOffsetIntensity} rotOffsetIntensity={rotOffsetIntensity} lambda={lambda} captureMode={captureMode}/>
                    <group ref={rigRef}>
                        {children}
                    </group>
                </PotreeManager>
            </Canvas>
        </div>
    );
}

export default HighlightViewport;