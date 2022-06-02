import { useLayoutEffect, useRef } from "react"
import { Mesh } from "three"
import { VaporComponent, VaporComponentProps } from "../viewer/ComponentDeclarations"
import { TeleportTargetComponentProps, useTeleportEffect } from "./template_types.ts/TeleportTargetComponent"

export type TeleporterPlaneProps = VaporComponentProps & TeleportTargetComponentProps

export const TeleporterPlane: VaporComponent = ({teleportEffect, ...props}: TeleporterPlaneProps) => {
    const meshRef = useRef<Mesh>(null)
    useTeleportEffect(meshRef, teleportEffect)
    return (
        <mesh ref={meshRef} {...props}>
            <planeBufferGeometry attach="geometry" args={[1, 1]} />
            <meshBasicMaterial attach="material" color={[0, 0, 0]} wireframe={true}/>
        </mesh>
    )
}