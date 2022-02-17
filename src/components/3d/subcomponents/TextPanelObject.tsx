import { Color, extend } from '@react-three/fiber';
import { Text } from "@react-three/drei"
import { DoubleSide } from 'three';
import RoundedRectangleGeometry from '../geometries/RoundedRectangleGeometry';

type TextPanelObjectProps = JSX.IntrinsicElements["group"] & {
    width?: number
    height?: number
    text?: string
    foregroundColor?: Color
    backgroundColor?: Color
    backgroundOpacity?: number
    fontSize?: number
    font?: string
    radius?: number
}

extend(RoundedRectangleGeometry)

function TextPanelObject({width=1.5, height=1, text="Button", foregroundColor="white", backgroundColor="#282828", backgroundOpacity=0.8, fontSize=0.1, font="https://fonts.gstatic.com/s/notoseriftc/v20/XLYgIZb5bJNDGYxLBibeHZ0BhnQ.woff", radius=0.05, ...props}:TextPanelObjectProps) {
    return (
        <group {...props}>
            <Text text={text} maxWidth={width} position={[0, 0, 0.01]} fontSize={fontSize} font={font} color={foregroundColor}/>
            <mesh>
                <roundedRectangleGeometry attach="geometry" width={width} height={height} radius={radius}/>
                <meshBasicMaterial attach="material" color={backgroundColor} transparent opacity={backgroundOpacity} side={DoubleSide}/>
            </mesh>
        </group>
    );
}

export default TextPanelObject;