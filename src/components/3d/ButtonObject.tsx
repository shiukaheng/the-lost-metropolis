import { extend } from '@react-three/fiber';
import RoundedRectangleGeometry from './geometries/RoundedRectangleGeometry';
import { Text } from "@react-three/drei"
import { DoubleSide, Color } from 'three';
import { useRef, useLayoutEffect, useState, Suspense, useContext } from "react"
import { useTransition, config, animated, useSpring } from "react-spring"
import { a } from "@react-spring/three"
import UnifiedInteractive from "./UnifiedInteractive"
import { EditorContext, wrapOnClick } from '../editor/Editor';

extend({ RoundedRectangleGeometry })

type ButtonObjectProps = JSX.IntrinsicElements['mesh'] & {
    width?: number
    height?: number
    text?: string
    foregroundColor?: Color
    backgroundColor?: Color
    backgroundOpacity?: number
    fontSize?: number
    font?: string
    onClick?: () => void
    radius?: number
}

function ButtonObject({width=0.5, height=0.25, text="Button", foregroundColor="white", backgroundColor="#282828", backgroundOpacity=0.8, fontSize=0.1, font=undefined, onClick=()=>{}, radius=0.05, ...props}:ButtonObjectProps) {
    const editorContext = useContext(EditorContext)
    const [clicked, setClicked] = useState(false)
    const [hovered, setHovered] = useState(false)
    const { buttonHoverScale } = useSpring({
        buttonHoverScale: (hovered && !clicked) ? 1.05 : 1,
        config: config.gentle
    })
    return (
        <UnifiedInteractive onSelect={onClick} onHover={()=>{setHovered(true)}} onBlur={()=>{setHovered(false)}}>
            <Text text={text} maxWidth={width} position={[0, 0, 0.01]} fontSize={fontSize} font={font} color={foregroundColor}/>
            <a.mesh scale={buttonHoverScale}>
                <roundedRectangleGeometry attach="geometry" width={width} height={height} radius={radius}/>
                <meshBasicMaterial attach="material" color={backgroundColor} transparent opacity={backgroundOpacity} side={DoubleSide}/>
            </a.mesh>
       </UnifiedInteractive>
    );
}

export default ButtonObject;