import { Billboard } from "@react-three/drei"
import LabelIconObject from "./subcomponents/LabelIconObject"
import { VaporComponent, VaporComponentProps } from "../viewer/ComponentDeclarations"
import { genericInputs } from "../viewer/genericInputs"
import { StringType } from "../viewer/ArgumentTypes"

type LinkObjectProps = VaporComponentProps & {
    url: string
}

export const LinkObject: VaporComponent = ({url, ...props}:LinkObjectProps) => {
    return (
        <Billboard follow>
            <LabelIconObject scale={0.25} onClick={()=>{window.open(url, "_blank").focus()}} iconUrl="/static/viewport/link-icon.png"/>
        </Billboard>
    )
}

LinkObject.displayName = "Link object"
LinkObject.componentType = "LinkObject"
LinkObject.inputs = {
    ...genericInputs,
    url: {
        type: StringType,
        default: "https://www.google.com"
    }
}