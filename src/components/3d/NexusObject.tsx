import { useEffect, useRef } from "react";
import { VaporComponent, VaporComponentProps } from "../viewer/ComponentDeclarations";
import { NexusObject as __NexusObject } from "../../lib/nexus/Nexus"
import { Group, Object3D } from "three";
import { useThree } from "@react-three/fiber";
import { genericInputs } from "../viewer/genericInputs";
import { URLType } from "../viewer/ArgumentTypes";
import { ErrorBoundary } from "react-error-boundary";
import ErrorObject from "./subcomponents/ErrorObject";

type NexusObjectProps = VaporComponentProps & {
    url: string
}

const _NexusObject = ({url}: NexusObjectProps) => {
    const group = useRef<Group>(null)
    const {gl} = useThree()
    const nexusRef = useRef(null)
    useEffect(() => {
        if (group.current && nexusRef.current) {
            group.current.remove(nexusRef.current)
            nexusRef.current.dispose()
        }
        if (group.current && url !== "") {
            nexusRef.current = new __NexusObject(url, ()=>{}, ()=>{}, gl)
            // console.log(nexusRef.current, group.current)
            group.current.add(
                nexusRef.current
            )
        }
        return () => {
            if (group.current && nexusRef.current) {
                group.current.remove(nexusRef.current)
                nexusRef.current.dispose()
            }
        }
    }, [url])
    return (
        <group ref={group}/>
    )
}

export const NexusObject: VaporComponent = (props: NexusObjectProps) => {
    return (
        <ErrorBoundary fallbackRender={({error, resetErrorBoundary}) => (
            <ErrorObject error={error} position={props.position} scale={props.scale} onClick={resetErrorBoundary} objectID={props.objectID}/>
          )}>
            <_NexusObject {...props} />
        </ErrorBoundary>
        );
}

NexusObject.displayName = "Nexus object"
NexusObject.componentType = "NexusObject"
NexusObject.inputs = {
    ...genericInputs,
    url: {
        type: URLType,
        default: ""
    }
}