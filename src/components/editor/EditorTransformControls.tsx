import { TransformControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useRef, cloneElement, Fragment } from "react";
import { Children } from "react";
import { Object3D } from "three"

// Todo: support multi-selection transform grouping

function EditorTransformControls({updatePartialSceneChildren, children, ...props}) {
    const transformControlsRef = useRef(null) 
    // If children is a single element, wrap it in an array
    const childrenArray = Children.toArray(children);
    useFrame((state, delta) => {
        // Copy child local transformation to transform object
        if (!transformControlsRef.current.dragging) {
            transformControlsRef.current.object.position.set(...childrenArray[0].props.position)
            transformControlsRef.current.object.scale.set(...childrenArray[0].props.scale)
            transformControlsRef.current.object.rotation.set(...childrenArray[0].props.rotation)
        } else {
            // Copy transform object transformation to object
            updatePartialSceneChildren(
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
    })
    
    return (
        <Fragment>
            <TransformControls ref={transformControlsRef} {...props}/>
            {children}
        </Fragment>
    );
}

export default EditorTransformControls