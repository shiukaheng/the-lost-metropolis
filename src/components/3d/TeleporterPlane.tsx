import { useLayoutEffect, useRef, useState } from "react"
import { Mesh } from "three"
import { VaporComponent, VaporComponentProps } from "../viewer/ComponentDeclarations"
import { genericInputs } from "../viewer/genericInputs"
import { teleportTargetComponentInputs, TeleportTargetComponentProps, useTeleportEffect } from "./template_types.ts/TeleportTargetComponent"

export type TeleporterPlaneProps = VaporComponentProps & TeleportTargetComponentProps

export const TeleporterPlane: VaporComponent = ({teleportEffect, ...props}: TeleporterPlaneProps) => {
    const meshRef = useRef<Mesh>(null)
    useTeleportEffect(false, meshRef, teleportEffect)
    const [color, setColor] = useState("white")
    useLayoutEffect(() => {
        // Determine plane color by the teleportEffect
        if (teleportEffect === "target") {
            setColor("green")
        } else if (teleportEffect === "blocker") {
            setColor("red")
        } else if (teleportEffect === "bypass") {
            setColor("white")
        }
    }, [teleportEffect])

    return (
        <group {...props}>
            <mesh ref={meshRef} rotation={[-Math.PI/2, 0, 0]}>
                <planeBufferGeometry attach="geometry" args={[1, 1, 10, 10]} />
                <meshBasicMaterial attach="material" color={color} wireframe={true}/>
            </mesh>
        </group>
    )
}

TeleporterPlane.displayName = "Teleporter plane"
TeleporterPlane.componentType = "TeleporterPlane"
TeleporterPlane.inputs = {
    ...genericInputs,
    ...teleportTargetComponentInputs,
}