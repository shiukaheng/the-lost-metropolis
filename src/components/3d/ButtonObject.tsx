import { extend } from '@react-three/fiber';
import RoundedRectangleGeometry from './geometries/RoundedRectangleGeometry';

extend({ RoundedRectangleGeometry })

function ButtonObject({...props}) {
    return (
        <mesh {...props}>
            <roundedRectangleGeometry attach="geometry"/>
            <meshBasicMaterial attach="material" color="white"/>
        </mesh>
    );
}

export default ButtonObject;