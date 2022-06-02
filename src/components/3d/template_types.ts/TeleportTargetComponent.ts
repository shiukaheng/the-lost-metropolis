import { RefObject, useCallback, useLayoutEffect } from "react"
import { Object3D } from "three"
import { applyTeleportationTargetEffect } from "../../utilities/Controls"
import { createStringOptionType } from "../../viewer/ArgumentTypes"

export type TargetEffect = "target" | "blocker" | "bypass"

// "target" will allow the user to teleport to the target
// "blocker" will block the teleporter ray and display as an invalid target
// "bypass" will have no effect on the raycast, will lead to better performance as the raycast will not be performed

export type TeleportTargetComponentProps = {
    teleportEffect: TargetEffect
}

/**
 * Applies the teleport effect to an Object3D of choosing
 * @param visible whether to add the object to layer 0
 * @param objectRef the Object3D to apply the teleporter effect to
 * @param teleportEffect the teleport effect to apply
 * @param recursive whether to apply the effect to all children of the Object3D
 * @param newRecursive whether to apply the effect recursively to new children of the Object3D, if undefined follows the recursive parameter
 * @returns a preprocessor function if the object will load in new children so we don't have to apply the effect to the whole object again
 */
export const useTeleportEffect = (visible: boolean, objectRef: RefObject<Object3D>, teleportEffect: TargetEffect, recursive: boolean=false, newRecursive?: boolean) => {
    useLayoutEffect(()=>{
        compoundApplyTeleportTargetEffect(visible, objectRef, recursive, teleportEffect)
    }, [teleportEffect])
    const onNewObject = useCallback((newNode)=>{
        compoundApplyTeleportTargetEffect(visible, newNode, ((newRecursive === undefined) ? recursive : newRecursive), teleportEffect)
    }, [teleportEffect, recursive, newRecursive])
    return onNewObject
}

function compoundApplyTeleportTargetEffect(visible, objectRef, recursive: boolean, teleportEffect: TargetEffect) {
    if (objectRef.current) {
        if (recursive) {
            objectRef.current.traverse(child => {
                applyTeleportationTargetEffect(child, teleportEffect)
                if (visible) {
                    child.layers.enable(0)
                } else {
                    child.layers.disable(0)
                }
            })
        } else {
            applyTeleportationTargetEffect(objectRef.current, teleportEffect)
            if (visible) {
                objectRef.current.layers.enable(0)
            } else {
                objectRef.current.layers.disable(0)
            }
        }
    }
}

export const teleportTargetComponentInputs = {
    teleportEffect: {
        type: createStringOptionType(["target", "blocker", "bypass"]),
        default: "target",
    }
}