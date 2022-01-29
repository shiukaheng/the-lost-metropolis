import { TransformControls } from "@react-three/drei";
import { useLayoutEffect, useRef } from "react";
import { transform } from "typescript";
import { Children } from "react";



function EditorTransformControls({updateSceneChildren, children, ...props}) {
    // If children is a single element, wrap it in an array
    const childrenArray = Children.toArray(children);
    const transformControlsRef = useRef() 
    // Make TransformControls center to object(s) origin when first added to object
    useLayoutEffect(() => {
        if (transformControlsRef.current) {
            // Set gizmo position from average of children positions via child.props.position
            console.log(childrenArray)
            const meanChildPosition = childrenArray.reduce((acc, child) => {
                return [
                    acc[0] + child.props.position[0],
                    acc[1] + child.props.position[1],
                    acc[2] + child.props.position[2]
                ]
            }, [0, 0, 0])
            // Divide by number of children
            const meanChildPositionDivided = [
                meanChildPosition[0] / childrenArray.length,
                meanChildPosition[1] / childrenArray.length,
                meanChildPosition[2] / childrenArray.length
            ]
            transformControlsRef.current.gizmo.position.set(...meanChildPositionDivided)
            // Set gizmo rotation and scale from scale and rotation of child via child.props.scale and child.props.rotation if there's only one child, otherwise use default values
            if (childrenArray.length === 1) {
                transformControlsRef.current.gizmo.scale.set(...childrenArray[0].props.scale)
                transformControlsRef.current.gizmo.rotation.set(...childrenArray[0].props.rotation)
            } else {
                transformControlsRef.current.gizmo.scale.set(1, 1, 1)
                transformControlsRef.current.gizmo.rotation.set(0, 0, 0)
            }
        }
    }, [childrenArray])
    // Todo: Make TransformControls apply its own transformation to child objects when moved
    
    return (<TransformControls ref={transformControlsRef} onMouseUp={
        () => {
            console.log(transformControlsRef.current)
        }
    }{...props}>{childrenArray}</TransformControls>);
}
export default EditorTransformControls;