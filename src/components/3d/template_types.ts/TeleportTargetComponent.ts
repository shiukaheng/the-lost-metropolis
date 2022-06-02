import { RefObject, useLayoutEffect } from "react"
import { Object3D } from "three"
import { applyTeleportationTargetEffect } from "../../utilities/Controls"

export type TargetEffect = "target" | "blocker" | "bypass"

// "target" will allow the user to teleport to the target
// "blocker" will block the teleporter ray and display as an invalid target
// "bypass" will have no effect on the raycast, will lead to better performance as the raycast will not be performed

export type TeleportTargetComponentProps = {
    teleportEffect: TargetEffect
}

export const useTeleportEffect = (objectRef: RefObject<Object3D>, teleportEffect: TargetEffect) => {
    useLayoutEffect(()=>{
        if(objectRef.current){
            applyTeleportationTargetEffect(objectRef.current, teleportEffect)
        }
    }, [teleportEffect])
}