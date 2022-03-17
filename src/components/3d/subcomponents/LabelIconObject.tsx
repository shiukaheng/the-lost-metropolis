import { Billboard } from "@react-three/drei"
import { useState } from "react"
import { config, useSpring } from "react-spring"
import { a } from "@react-spring/three"
import { useLoader } from "@react-three/fiber"
import { TextureLoader } from "three"
import UnifiedInteractive from "./UnifiedInteractive"
import { VaporComponentProps } from "../../viewer/ComponentDeclarations"
import infoIconUrl from "../../../../static/viewport/info-icon.png"

type LabelIconObjectProps = VaporComponentProps & {
    onClick?: () => void
    iconUrl: string
    iconScale?: number
    iconOpacity?: number
    skirtHidden?: boolean
}

export default function LabelIconObject({onClick=()=>{}, iconUrl=infoIconUrl, iconScale=0.1, iconOpacity=1, skirtHidden=false, ...props}:LabelIconObjectProps) {
    const texture = useLoader(TextureLoader, iconUrl)
    const [hovered, setHovered] = useState(false)
    const { iconExtHoverScale, iconExtHoverOpacity } = useSpring({
        iconExtHoverScale: (hovered && (!skirtHidden)) ? 1.5 : 1,
        iconExtHoverOpacity: (hovered && (!skirtHidden)) ? 0.4 : 0,
        config: config.gentle
    })
    return (
        <UnifiedInteractive onClick={onClick} onHover={()=>{setHovered(true)}} onBlur={()=>{setHovered(false)}} parentObjectID={props.objectID} position={props.position} scale={props.scale}>
            <Billboard>
                <mesh scale={iconScale} renderOrder={1}>
                    <planeGeometry attach="geometry" args={[1, 1]}/>
                    <meshBasicMaterial attach="material" transparent opacity={iconOpacity} color="white" map={texture}/>
                </mesh>
                <group scale={iconScale} renderOrder={1}>
                    <a.mesh scale={iconExtHoverScale}>
                        <circleGeometry args={[0.5, 30]}/>
                        <a.meshBasicMaterial transparent opacity={iconExtHoverOpacity}/>
                    </a.mesh>
                </group>
                {props.children}
            </Billboard>
        </UnifiedInteractive>
    )
}