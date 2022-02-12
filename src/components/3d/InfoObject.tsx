import { Text, Billboard } from "@react-three/drei"
import { useState } from "react"
import { useTransition, config } from "react-spring"
import { a } from "@react-spring/three"
import LabelIconObject from "./subcomponents/LabelIconObject"
import UnifiedInteractive from "./subcomponents/UnifiedInteractive"

type InfoObjectProps = JSX.IntrinsicElements["group"] & {
    text?: string
    iconScale?: number
}

function InfoObject({text="", iconSize=0.1, fontSize=0.1, textMaxWidth=10, wrapText=false, ...props}:InfoObjectProps) {
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
    return (
        transitions(
            ({opacity, scale}, item) => (
                item 
                ?
                <AnimatedLabelIcon iconUrl="/static/viewport/info-icon.png" onClick={()=>{setExpanded(!expanded)}} iconScale={scale} iconOpacity={opacity} skirtHidden={!expanded} scale={iconSize} id={props.id} position={props.position}/>
                :
                <UnifiedInteractive {...props} onClick={()=>{setExpanded(!expanded)}} parentID={props.id}>
                    <AnimatedText scale={scale} gpuAccelerateSDF={true} fillOpacity={opacity} text={text} maxWidth={wrapText ? textMaxWidth : Infinity} fontSize={fontSize} renderOrder={1}/>
                </UnifiedInteractive>
            )
        )
    );
}

export default InfoObject;