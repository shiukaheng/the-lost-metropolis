import { Billboard } from "@react-three/drei";
import LabelIconObject from "./LabelIconObject";
import { Text } from "@react-three/drei"

export default function ErrorObject({error, resetErrorBoundary=()=>{}, position, scale, id}) {
    return (
        <group position={position} scale={scale}>
            <LabelIconObject iconUrl="/static/viewport/error-icon.png" onClick={resetErrorBoundary} skirtHidden id={id} position={[0, 0.045, 0]}>
                <Text text={error} fontSize={0.05} color={"red"} position={[0,-0.09,0]}/>
            </LabelIconObject>
        </group>
    )
}