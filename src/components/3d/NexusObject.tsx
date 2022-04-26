import { useEffect, useRef } from "react";
import { VaporComponentProps } from "../viewer/ComponentDeclarations";
import { NexusObject as _NexusObject } from "../../lib/nexus/Nexus"
import { Group, Object3D } from "three";
import { useThree } from "@react-three/fiber";

type NexusObjectProps = VaporComponentProps & {
    url: string
}

export function NexusObject({url}: NexusObjectProps) {
    const group = useRef<Group>(null)
    const {gl} = useThree()
    const nexusRef = useRef(null)
    useEffect(() => {
        if (group.current) {
            nexusRef.current = new _NexusObject(url, ()=>{}, ()=>{}, gl)
            group.current.add(
                nexusRef.current
            )
        }
        return () => {
            if (group.current && nexusRef.current) {
                group.current.remove(
                    nexusRef.current
                )
            }
            // TODO: Dispose   
        }
    }, [])
    return (
        <group ref={group}/>
    )
}