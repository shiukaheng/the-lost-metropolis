import { Text, Image, Billboard } from "@react-three/drei"
import { useRef, useLayoutEffect, useState, Suspense } from "react"
import { useTransition, config, animated } from "react-spring"
import { a } from "@react-spring/three"
import { useFrame, useLoader } from "@react-three/fiber"
import { TextureLoader } from "three"

// Todo: Rewrite Text element to be compatible with react-spring

function LabelObject({...props}) {
    const [expanded, setExpanded] = useState(true)
    const texture = useLoader(TextureLoader, "/static/viewport/info-icon.png")
    const transitions = useTransition(expanded, {
        from: {opacity: 0, scale: [0.3, 0.3, 0.3]},
        enter: {opacity: 1, scale: [0.5, 0.5, 0.5]},
        leave: {opacity: 0, scale: [0.3, 0.3, 0.3]},
        delay: 200,
        config: config.gentle
    })
    return transitions(({opacity, scale}, item) => (
        item 
        ?
        <Billboard follow>
            <a.mesh scale={scale} onClick={()=>{setExpanded(!expanded)}}>
                <a.planeGeometry attach="geometry" args={[1, 1]} />
                <a.meshBasicMaterial attach="material" transparent opacity={opacity} color="white" map={texture}/>
            </a.mesh>
        </Billboard>
        :
        <Billboard follow>
            <Text onClick={()=>{setExpanded(!expanded)}}>Hello world!</Text>
        </Billboard>
    )
);
}

export default LabelObject;