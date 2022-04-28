import { ColorType, NumberType } from "../viewer/ArgumentTypes"
import { VaporComponent } from "../viewer/ComponentDeclarations"
import { genericInputs } from "../viewer/genericInputs"

export const AmbientLightObject:VaporComponent = (props) => {
    return (
        <ambientLight {...props}/>
    )
}

AmbientLightObject.displayName = "Ambient light"
AmbientLightObject.componentType = "AmbientLight"
AmbientLightObject.inputs = {
    ...genericInputs,
    "color": {
        "type": ColorType,
        "default": [1, 1, 1]
    },
    "intensity": {
        "type": NumberType,
        "default": 1
    }
}