import { Billboard } from "@react-three/drei";
import LabelIconObject from "./LabelIconObject";

export default function ErrorObject({error, resetErrorBoundary, position, rotation, scale}) {
    return (
        <Billboard follow>
            <group position={position} rotation={rotation} scale={scale}>
            <LabelIconObject scale={0.25} iconUrl="/static/viewport/error-icon.png" onClick={resetErrorBoundary} skirtHidden/>
        </Billboard>
    )
}