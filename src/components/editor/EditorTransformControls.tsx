import { TransformControls } from "@react-three/drei";
import { useLayoutEffect, useRef, cloneElement } from "react";
import { transform } from "typescript";
import { Children } from "react";
// import { useThree } from "@react-three/fiber";
import { Object3D } from "three"

// function updatePartialSceneChildren(sceneChildren, updateChildren) {
//     // return new sceneChildren but with the children whose props.id is in updateChildren
//     return sceneChildren.map(child => {
//         if (updateChildren.includes(child.props.id)) {
//             return cloneElement(child, {
//                 children: updatePartialSceneChildren(child.props.children, updateChildren)
//             })
//         } else {
//             return child
//         }
//     })
// }

function updatePartialSceneChildren(sceneChildren, childrenToUpdate) {
    // return new sceneChildren but with the children whose props.id is in updateChildren
    const idsToBeUpdated = childrenToUpdate.map(child => child.props.id)
    return sceneChildren.map(child => {
        if (idsToBeUpdated.includes(child.props.id)) {
            return childrenToUpdate.find(item => item.props.id === child.props.id)
        } else {
            return child
        }
    })
}

function EditorTransformControls({setSceneChildren, children, ...props}) {
    // If children is a single element, wrap it in an array
    const childrenArray = Children.toArray(children);
    const transformControlsRef = useRef() 
    // Make TransformControls center to object(s) origin when first added to object
    useLayoutEffect(() => {
        if (transformControlsRef.current) {
            // Set gizmo position from average of children positions via child.props.position
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
    
    return (
        <TransformControls {...props} ref={transformControlsRef} onMouseUp={
            () => {
                
                // Make TransformControls apply its own transformation to child objects when moved, only using position rotation and scale properties and not the transformation matrix
                if (transformControlsRef.current) {
                    const newChildren = childrenArray.map(
                        child => {
                            const dummyObject = new Object3D()
                            dummyObject.position.set(...child.props.position)
                            dummyObject.rotation.set(...child.props.rotation)
                            dummyObject.scale.set(...child.props.scale)
                            dummyObject.updateMatrix()
                            dummyObject.applyMatrix4(transformControlsRef.current.object.matrixWorld)
                            return cloneElement(child, {
                                position: dummyObject.position.toArray(),
                                rotation: dummyObject.rotation.toArray(),
                                scale: dummyObject.scale.toArray()
                            })
                        }
                    )
                    transformControlsRef.current.object.position.set(0,0,0)
                    transformControlsRef.current.object.rotation.set(0,0,0)
                    transformControlsRef.current.object.scale.set(1,1,1)
                    setSceneChildren(updatePartialSceneChildren(childrenArray, newChildren))
                }
            }
        }>
            {childrenArray}
        </TransformControls>
    );
}

export default EditorTransformControls;