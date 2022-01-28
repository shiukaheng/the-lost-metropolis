import { Text, Image, Billboard } from "@react-three/drei"
import { useRef, useLayoutEffect, useState, Suspense } from "react"
import { useTransition, config, animated, useSpring } from "react-spring"
import { a } from "@react-spring/three"
import { useFrame, useLoader } from "@react-three/fiber"
import { TextureLoader } from "three"
import OptionalInteractive from "./OptionalInteractive"

type LabelIconObjectProps = JSX.IntrinsicElements["group"] & {
    onClick?: () => void
    iconUrl: string
    iconScale?: number
    iconOpacity?: number
    skirtHidden?: boolean
}

export default function LabelIconObject({onClick=()=>{}, iconUrl="", iconScale=1, iconOpacity=1, skirtHidden=false, ...props}:LabelIconObjectProps) {
    const texture = useLoader(TextureLoader, iconUrl)
    const [hovered, setHovered] = useState(false)
    const { iconExtHoverScale, iconExtHoverOpacity } = useSpring({
        iconExtHoverScale: (hovered && (!skirtHidden)) ? 2 : 1,
        iconExtHoverOpacity: (hovered && (!skirtHidden)) ? 0.2 : 0,
        config: config.gentle
    })
    return (
        <OptionalInteractive onSelect={onClick} onHover={()=>{setHovered(true)}} onBlur={()=>{setHovered(false)}}>
            <group onPointerEnter={()=>{setHovered(true)}} onPointerLeave={()=>{setHovered(false)}} {...props}>
                <mesh scale={iconScale} onClick={onClick}>
                    <planeGeometry attach="geometry" args={[1, 1]}/>
                    <meshBasicMaterial attach="material" transparent opacity={iconOpacity} color="white" map={texture}/>
                </mesh>
                <a.mesh scale={iconExtHoverScale}>
                    <circleGeometry args={[0.2, 30]}/>
                    <a.meshBasicMaterial transparent opacity={iconExtHoverOpacity}/>
                </a.mesh>
            </group>
        </OptionalInteractive>
    )
}