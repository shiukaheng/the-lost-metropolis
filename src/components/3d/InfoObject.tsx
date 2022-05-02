import { Text, Billboard } from "@react-three/drei"
import { useState } from "react"
import { useTransition, config } from "react-spring"
import { a } from "@react-spring/three"
import LabelIconObject from "./subcomponents/LabelIconObject"
import UnifiedInteractive from "./subcomponents/UnifiedInteractive"
import { VaporComponent, VaporComponentProps } from "../viewer/ComponentDeclarations"
import { genericInputs } from "../viewer/genericInputs"
import { BooleanType, MagicStringType, NumberType, StringType } from "../viewer/ArgumentTypes"
import { createEmptyMultilangString, useMagicString } from "../../utilities"
import { MagicString } from "../../../api/types/MagicString"

type InfoObjectProps = VaporComponentProps & {
    text?: MagicString
    iconScale?: number
}

export const InfoObject: VaporComponent = ({text=createEmptyMultilangString(), iconSize=0.1, fontSize=0.1, textMaxWidth=10, wrapText=false, ...props}:InfoObjectProps) => {
    const [expanded, setExpanded] = useState(true)
    
    const transitions = useTransition(expanded, {
        from: {opacity: 0, scale: [0.6, 0.6, 0.6]},
        enter: {opacity: 1, scale: [1, 1, 1]},
        leave: {opacity: 0, scale: [0.6, 0.6, 0.6]},
        exitBeforeEnter: true,
        config: config.default
    })
    
    const AnimatedText = a(Text)
    const AnimatedLabelIcon = a(LabelIconObject)

    const displayText = useMagicString(text)
    return (
        transitions(
            ({opacity, scale}, item) => (
                item 
                ?
                <AnimatedLabelIcon iconUrl="/static/viewport/info-icon.png" onClick={()=>{setExpanded(!expanded)}} iconScale={scale} iconOpacity={opacity} skirtHidden={!expanded} scale={iconSize} objectID={props.objectID} position={props.position}/>
                :
                <UnifiedInteractive {...props} onClick={()=>{setExpanded(!expanded)}} parentObjectID={props.objectID}>
                    <AnimatedText scale={scale} gpuAccelerateSDF={true} fillOpacity={opacity} text={displayText} maxWidth={wrapText ? textMaxWidth : Infinity} fontSize={fontSize} renderOrder={1} font="https://fonts.gstatic.com/s/notoseriftc/v20/XLYgIZb5bJNDGYxLBibeHZ0BhnQ.woff"/>
                </UnifiedInteractive>
            )
        )
    );
}

InfoObject.displayName = "Info object"
InfoObject.componentType = "InfoObject"
InfoObject.inputs = {
    ...genericInputs,
    text: {
        type: MagicStringType,
        default: "Info",
    },
    iconSize: {
        type: NumberType,
        default: 0.1
    },
    fontSize: {
        type: NumberType,
        default: 0.1
    },
    textMaxWidth: {
        type: NumberType,
        default: 10
    },
    wrapText: {
        type: BooleanType,
        default: false
    }
}

export default InfoObject;