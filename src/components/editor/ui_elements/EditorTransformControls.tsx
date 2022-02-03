import { TransformControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useRef, cloneElement, Fragment, useContext } from "react";
import { Children } from "react";
import { Object3D } from "three"
import { ViewerContext } from "../../viewer/ViewerContext";
import { EditorContext } from "../EditorContext";

// Todo: support multi-selection transform grouping

function EditorTransformControls({enabled, children, ...props}) {
    const { updateSceneChildren } = useContext(ViewerContext)
    const { transformMode, transformSpace } = useContext(EditorContext)
    const transformControlsRef = useRef(null) 
    // If children is a single element, wrap it in an array
    const childrenArray = Children.toArray(children);
    useFrame((state, delta) => {
        // Copy child local transformation to transform object
        if (transformControlsRef.current) {
            if (!transformControlsRef.current.dragging) {
                transformControlsRef.current.object.position.set(...childrenArray[0].props.position)
                transformControlsRef.current.object.scale.set(...childrenArray[0].props.scale)
                transformControlsRef.current.object.rotation.set(...childrenArray[0].props.rotation)
            } else {
                // Copy transform object transformation to object
                updateSceneChildren(
                    childrenArray.map(child => cloneElement(
                        child,
                        {
                            position: transformControlsRef.current.object.position.toArray(),
                            rotation: transformControlsRef.current.object.rotation.toArray(),
                            scale: transformControlsRef.current.object.scale.toArray()
                        }
                    ))
                )
            }
        }
    })
    
    return (
        <Fragment>
            {enabled ? <TransformControls ref={transformControlsRef} mode={transformMode} space={transformSpace} /> : null}
            {children}
        </Fragment>
    );
}

export default EditorTransformControls