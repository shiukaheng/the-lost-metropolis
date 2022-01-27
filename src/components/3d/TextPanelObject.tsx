import { extend } from '@react-three/fiber';
import RoundedRectangleGeometry from './geometries/RoundedRectangleGeometry';
import { Text } from "@react-three/drei"
import { DoubleSide } from 'three';

extend({ RoundedRectangleGeometry })

function TextPanelObject({width=1.5, height=1, text="Button", foregroundColor="white", backgroundColor="#282828", backgroundOpacity=0.8, fontSize=0.1, font=undefined, radius=0.05, ...props}) {
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