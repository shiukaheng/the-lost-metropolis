import { Text, Image, Billboard } from "@react-three/drei"
import { useRef, useLayoutEffect, useState, Suspense } from "react"
import { useTransition, config, animated } from "react-spring"
import { a } from "@react-spring/three"
import { useFrame } from "@react-three/fiber"
import { DREIImage } from "./DREIImage"

function TransparentImage({opacity=1, ...props}) {
    const ref = useRef()
    useLayoutEffect(()=>{
        if (ref.current) {
            ref.current.material.transparent = true
        }
    }, [])
    useFrame(()=>{
        if (ref.current) {
            ref.current.material.opacity = opacity
        }
    })
    return (<DREIImage ref={ref} {...props}/>);
}

function SuspendedTransparentImage({...props}) {
    return (<Suspense fallback={null}><TransparentImage {...props}/></Suspense>);
}

function LabelObject({...props}) {
    const [expanded, setExpanded] = useState(true)
    const transitions = useTransition(expanded, {
        from: {opacity: 0, scale: [0.3, 0.3, 0.3]},
        enter: {opacity: 1, scale: [0.5, 0.5, 0.5]},
        leave: {opacity: 0, scale: [0.3, 0.3, 0.3]},
        delay: 200,
        config: config.molasses
    })
    return transitions(({opacity, scale}, item) => (
        
            item
            ?
            <a.group scale={scale}><SuspendedTransparentImage opacity={0.5} url="/static/viewport/info-icon.png"/></a.group>
            :
            <a.group scale={scale}/>
        
    )
);
}
export default LabelObject;