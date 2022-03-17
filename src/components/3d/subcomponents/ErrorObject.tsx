import LabelIconObject from "./LabelIconObject";
import { Text } from "@react-three/drei"
import errorIconUrl from "../../../../static/viewport/error-icon.png"

export default function ErrorObject({error, resetErrorBoundary=()=>{}, position, scale, objectID, onClick=()=>{}}) {
    return (
        <group position={position} scale={scale} onClick={onClick}>
            <LabelIconObject iconUrl={errorIconUrl} onClick={resetErrorBoundary} skirtHidden objectID={objectID} position={[0, 0.045, 0]}>
                <Text text={error} fontSize={0.05} color={"red"} position={[0,-0.09,0]}/>
            </LabelIconObject>
        </group>
    )
}