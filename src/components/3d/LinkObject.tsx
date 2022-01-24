import { Text, Image, Billboard } from "@react-three/drei"
import { useRef, useLayoutEffect, useState, Suspense } from "react"
import { useTransition, config, animated, useSpring } from "react-spring"
import { a } from "@react-spring/three"
import { useFrame, useLoader } from "@react-three/fiber"
import { TextureLoader } from "three"
import LabelIconObject from "./LabelIconObject"

export default function LinkObject({url, ...props}) {
    return (
        <Billboard follow>
            <LabelIconObject scale={0.25} onClick={()=>{window.open(url, "_blank").focus()}} iconUrl="/static/viewport/link-icon.png"/>
        </Billboard>
    )
}