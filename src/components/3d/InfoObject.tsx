import { Text, Billboard } from "@react-three/drei"
import { useState } from "react"
import { useTransition, config } from "react-spring"
import { a } from "@react-spring/three"
import LabelIconObject from "./LabelIconObject"

function InfoObject({text="", iconScale=0.1, ...props}) {
    const [expanded, setExpanded] = useState(true)
    
    const transitions = useTransition(expanded, {
        from: {opacity: 0, scale: [0.3, 0.3 , 0.3]},
        enter: {opacity: 1, scale: [0.5, 0.5, 0.5]},
        leave: {opacity: 0, scale: [0.3, 0.3, 0.3]},
        exitBeforeEnter: true,
        config: config.default
    })
    
    const AnimatedText = a(Text)
    const AnimatedLabelIcon = a(LabelIconObject)
    return transitions(({opacity, scale}, item) => (
        item 
        ?
        <Billboard follow>
            <AnimatedLabelIcon iconUrl="/static/viewport/info-icon.png" scale={0.25} onClick={()=>{setExpanded(!expanded)}} iconScale={scale} iconOpacity={opacity} skirtHidden={!expanded}/>
        </Billboard>
        :
        <AnimatedText scale={scale} gpuAccelerateSDF={true} fillOpacity={opacity} onClick={()=>{setExpanded(!expanded)}} text={text}/>
    )
);
}

export default InfoObject;