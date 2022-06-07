// All use*Controls must be used in components within a provider of ViewerContext, i.e. Viewer
// Some extra info on raycasting is in development.md
import { useFrame, useThree } from "@react-three/fiber";
import { useXR, useXREvent, XRController } from "@react-three/xr";
import { Fragment, RefObject, useCallback, useContext, useEffect, useRef } from "react";
import { BufferAttribute, BufferGeometry, Group, Intersection, Layers, Line, LineBasicMaterial, Material, MathUtils, Mesh, Object3D, Ray, Raycaster, Scene, Vector2, Vector3 } from "three";
import { useXRGestures, useXRGesturesB } from "./controls/useXRGestures";

import { ViewerContext } from "../viewer/ViewerContext";
import { DefaultXRControllers } from "./controls/DefaultXRControllers";
import { TargetEffect } from "../3d/template_types.ts/TeleportTargetComponent";
import { useRefContext, useThreeEventListener } from "../../utilities";

type TeleportDestination = {
    valid: boolean,
    position: Vector3 | null, // could be null if no destination is found at all
    normal: Vector3 | null, // could be null if the destination is not a plane or if there is no destination found at all
}

type TeleportableDestination = {
    valid: true,
    position: Vector3,
    normal: Vector3 | null
}

/**
 * THE function to determine what is a valid destination or not
 * @param intersections the list of intersections from raycaster
 * @param upVector the up vector to use for determining the validity of the teleport destination
 * @param maxDeg the maximum angle between the up vector and the normal of the teleport destination for it to be considered valid
 * @returns a TeleportDestination object
 */
function processIntersections(intersections: Intersection<Object3D>[], upVector=new Vector3(0, 1, 0), maxDeg=10): TeleportDestination {
    for (const intersection of intersections) {
        if (intersection.object.userData.teleportEffect !== undefined) {
            switch (intersection.object.userData.teleportEffect) {
                case "target":
                    // Check if the intersection has the right normal
                    if (validNormal(intersection?.face?.normal, upVector, maxDeg)) {
                        return {
                            valid: true,
                            position: intersection.point,
                            normal: intersection?.face?.normal || null
                        };
                    } else {
                        return {
                            valid: false,
                            position: intersection.point,
                            normal: intersection?.face?.normal || null
                        }
                    }
                case "blocker":
                    return {
                        valid: false,
                        position: intersection.point,
                        normal: intersection?.face?.normal || null
                    }
                default:
                    throw new Error(`Unknown teleport effect type: ${intersection.object.userData.teleportEffect}`);
            }
        }
    }
    // If nothing comes up as a teleport destination, return a non-valid destination
    return {
        valid: false,
        position: null,
        normal: null,
    }
}

const zero = new Vector2(0,0)

export function useARControls(onTeleport: (TeleportableDestination)=>void) {
    const {scene, gl, camera: normalCamera} = useThree();
    // const { xrMode } = useContext(ViewerContext);
    const viewerContextRef = useRefContext(ViewerContext)
    const raycasterRef = useRef<null | Raycaster>();
    useEffect(()=>{
        raycasterRef.current = new Raycaster();
        raycasterRef.current.layers.set(3);
    }, [])
    const attemptTeleport = useCallback((pv, dv)=>{
        // console.log(raycasterRef.current)
        if (raycasterRef.current) {
            // Raycast from AR camera and check if it hits a teleportable object
            // raycasterRef.current.setFromCamera(zero, normalCamera);
            raycasterRef.current.set(pv, dv);
            const intersects = raycasterRef.current.intersectObjects(scene.children, true);
            // console.log(normalCamera, scene.children, raycasterRef.current, intersects)
            const destination = processIntersections(intersects)
            if (destination.valid) {
                onTeleport(destination)
            }
        }
    }, [])
    const doubleTapHandler = useCallback((pv, dv)=>{
        if (viewerContextRef.current?.xrMode === "immersive-ar") {
            // console.log("Double tap")
            attemptTeleport(pv, dv)
        }
    }, [attemptTeleport])
    useXRGesturesB(
        undefined,
        doubleTapHandler,
    )
    // useEffect(()=>{
    //     // Debug: log controllers and events
    //     useThreeEventListener("")
    // }, [gl])
}

/**
 * Decompose a vector into horizontal and vertical components given a vector and a up vector
 * @param vector 
 * @param up 
 */
function decomposeVector(vector: Vector3, up: Vector3=new Vector3(0,1,0)): [Vector3, Vector3] {
    const horizontal = vector.clone().projectOnPlane(up)
    const vertical = vector.clone().sub(horizontal)
    return [horizontal, vertical]
}

type ParabolicRaycastFrame = {
    path: Vector3[],
    up: Vector3,
    destination: TeleportDestination
} | null


/**
 * @param scene the scene to raycast from
 * @param raycaster the raycaster to use for raycasting
 * @param origin the starting point of the path
 * @param direction the starting direction of the path
 * @param maxDistance the maximum distance to travel assuming the floor is flat
 * @param maxSegments the maximum number of segments to calculate
 * @param hSegmentLength the horizontal length of each segment
 * @returns a ParabolicRaycastFrame object
 */
function parabolicRaycast(scene: Scene, raycaster: Raycaster, origin: Vector3, direction: Vector3, maxDistance: number, maxSegments=20, hSegmentLength=0.1, up=new Vector3(0,1,0)): ParabolicRaycastFrame {
    const normalizedDirection = direction.clone().normalize()
    const normalizedUp = up.clone().normalize()
    // We determine the throw velocity by the maximum horizontal distance we can travel
    const gravity = -9.81
    const throwVel = Math.sqrt(-gravity * maxDistance) // the initial absolute velocity that will lead to the defined maxDistance given on a flat floor, derived from suvat
    const [hv, vv] = decomposeVector(normalizedDirection.clone().multiplyScalar(throwVel), up) // initial horizontal and vertical velocity vectors
    // DEBUG: Check if the decomposition is correct
    // console.log(hv.clone().add(vv).normalize(), normalizedDirection)
    const dt = hSegmentLength / hv.length() // Find what is the delta t given horizontal length
    // console.log(hv, vv, dt)

    const path = [origin.clone()] // the path of the raycast

    // Now we iterate over the segments and calculate the position of each segment
    for (let i=1; i<=maxSegments; i++) {
        const newOrigin = path[i-1].clone().add(hv.clone().multiplyScalar(dt)).add(vv.clone().multiplyScalar(dt)) // Calculate the next position using 
        path.push(newOrigin.clone())
        const deltaOrigin = newOrigin.sub(path[i-1])
        // Interpret as raycaster parameters
        raycaster.set(path[i-1], deltaOrigin)
        raycaster.far = deltaOrigin.length()
        // Try and raycast
        const destination = processIntersections(raycaster.intersectObjects(scene.children.filter(
            x => !(x.userData.bypassTeleportRaycaster)
        )))
        if (destination.position !== null) { // Return if there are any hits in the current segment
            path.push(destination.position)
            return {
                path,
                up: normalizedUp,
                destination: destination,
            }
        }
        // Update for next iteration by updating the "old origin" variable and adding influence of gravity on vertical component of velocity
        vv.add(normalizedUp.clone().multiplyScalar(dt * gravity))
    }

    // If we get here, then we did not find any hits in the max segments
    return {
        path,
        up: normalizedUp,
        destination: {
            valid: false,
            position: null,
            normal: null,
        }
    }
}

type ControllersObject = {
    left: null | XRController,
    right: null | XRController,
}

/**
 * Binds VR controller controls to trigger teleportation, and also provide a reference to the path of the raycast
 * @param onTeleport the callback to call when a teleport is triggered
 * @param hSegmentLength the length of each segment of the path
 * @returns a reference of a ParabolicRaycastFrame object
 */
export function useVRControls(onTeleport: (TeleportableDestination)=>void, maxSegments=20, hSegmentLength=0.1, maxDistance=3): RefObject<ParabolicRaycastFrame> {
    // References for each controller
    const scene = useThree(gl => gl.scene)
    const raycasterRef = useRef<Raycaster>(new Raycaster())
    const directionRef = useRef<Vector3>(new Vector3())
    const positionRef = useRef<Vector3>(new Vector3())
    useEffect(()=>{
        raycasterRef.current.layers.set(3);
    }, [])
    const controllersRef = useRef<ControllersObject>({
        left: null,
        right: null,
    })
    const targetTraceRef = useRef<null | ParabolicRaycastFrame>(null)
    const lastTargetTraceRef = useRef<null | ParabolicRaycastFrame>(null)
    const attemptTeleport = useCallback(()=>{
        if (lastTargetTraceRef.current?.destination.valid) {
            onTeleport(lastTargetTraceRef.current.destination)
        }
    }, [onTeleport])
    // Create callback for controller trigger
    useXREvent("selectstart", (e)=>{
        if (e.controller.inputSource.handedness === "left") {
            controllersRef.current.right = null
            controllersRef.current.left = e.controller
        }
        if (e.controller.inputSource.handedness === "right") {
            controllersRef.current.left = null
            controllersRef.current.right = e.controller
        }
    })
    useXREvent("selectend", (e)=>{
        if (e.controller.inputSource.handedness === "left" && controllersRef.current.left !== null) {
            controllersRef.current.left = null
            // Trigger teleport
            attemptTeleport()
        }
        if (e.controller.inputSource.handedness === "right" && controllersRef.current.right !== null) {
            controllersRef.current.right = null
            // Trigger teleport
            attemptTeleport()
        }
    })
    // Start parabolic raycast from controller, for each segment call processIntersections until a destination, valid or not, is found
    useFrame(()=>{
        // Get active controller
        const controller = controllersRef.current.left || controllersRef.current.right
        if (controller) {
            // Get grip pose in terms of world coordinates
            controller.controller.getWorldDirection(directionRef.current)
            directionRef.current.multiplyScalar(-1)
            controller.controller.getWorldPosition(positionRef.current)
            // Calculate parabolic raycast
            // console.log(positionRef.current, directionRef.current)
            targetTraceRef.current = parabolicRaycast(
                scene,
                raycasterRef.current,
                positionRef.current,
                directionRef.current,
                maxDistance,
                maxSegments,
                hSegmentLength,
            )
            // console.log(targetTraceRef.current)
            lastTargetTraceRef.current = targetTraceRef.current
        } else {
            targetTraceRef.current = null
        }
    })
    return targetTraceRef
}

/**
 * Shows a parabolic line of raycast path, and a sphere at the destination. Purely a visualizer, does not affect the raycast / range. maxSegments is used to allocate the path array.
 */
export function VRVisualizer({targetTraceRef, maxSegments, sphereRadius=0.1}: {
    targetTraceRef: RefObject<ParabolicRaycastFrame>,
    maxSegments: number,
    sphereRadius?: number,
}) {
    // Alternatively, we could parameterize the raycast path, and use uniforms to pass in the path to a specialized shader.
    // Anyway, this method will work for now and should not be significantly slower.
    // Easier optimization: modify parabolicRaycast to return a number array instead of an array of Vector3 objects
    const lineGeometryRef = useRef<BufferGeometry | null>(null)
    const lineMaterialRef = useRef<LineBasicMaterial | null>(null)
    const lineRef = useRef<Line | null>(null)
    const sphereMeshRef = useRef<Mesh>(null)
    const groupRef = useRef<Group>(null) // Container group to hold the path and target ball
    // Initialize LineBasicMaterial
    useEffect(()=>{
        lineMaterialRef.current = new LineBasicMaterial({
            color: "white",
            linewidth: 2,
        })
        return ()=>{
            lineMaterialRef.current = null
        }
    }, [])
    // Create line geometry and mesh using useEffect and add to group, sensitive to maxSegments as this determines the BufferGeometry size
    useEffect(()=>{
        // Cleanup old mesh and geometry if exists
        if (lineRef.current) {
            lineRef.current.removeFromParent()
            lineRef.current.geometry.dispose()
        }
        // Create new geometry and mesh
        if (groupRef.current) {
            const geometry = new BufferGeometry()
            geometry.setAttribute("position", new BufferAttribute(new Float32Array(maxSegments * 3), 3))
            const line = new Line(geometry, lineMaterialRef.current as LineBasicMaterial)
            line.userData = {
                bypassTeleportRaycaster: true
            }
            // Add to group
            groupRef.current.add(line)
            lineRef.current = line
            lineGeometryRef.current = geometry
        }
        return ()=>{ // Cleanup
            if (lineRef.current) {
                lineRef.current.removeFromParent()
                lineRef.current.geometry.dispose()
            }
        }
    }, [maxSegments])
    // Per frame updates: Update line geometry from targetTraceRef, call setDrawRange, and hide the line if targetTraceRef is null, and update target location and opacity. Full opacity if target is valid, otherwise half opacity.
    useFrame(()=>{
        if (targetTraceRef?.current === null) {
            // If currently not tracing, hide both line and ball
            if (lineRef.current) {
                lineRef.current.visible = false
            }
            if (sphereMeshRef.current) {
                sphereMeshRef.current.visible = false
            }
        } else {
            if (targetTraceRef.current.destination.position === null) {
                // If there is no reached target, show the line but not the ball
                if (lineRef.current) {
                    lineRef.current.visible = true
                }
                if (sphereMeshRef.current) {
                    sphereMeshRef.current.visible = false
                }
            } else {
                // Update ball location
                // console.log(targetTraceRef.current.destination.position)
                if (sphereMeshRef.current && targetTraceRef.current.destination.position) {
                    sphereMeshRef.current.position.copy(targetTraceRef.current.destination.position)
                    sphereMeshRef.current.visible = true
                }
                // Update ball opacity
                if (sphereMeshRef.current) {
                    (sphereMeshRef.current.material as Material).opacity = targetTraceRef.current.destination.valid ? 1 : 0.5
                }
            }
            // Update line geometry
            if (lineGeometryRef.current) {
                const geometry = lineGeometryRef.current as BufferGeometry
                const positions = geometry.getAttribute("position") as BufferAttribute
                const path = targetTraceRef.current.path
                // console.log(path)
                const n = path.length
                for (let i = 0; i < n; i++) {
                    positions.setXYZ(i, path[i].x, path[i].y, path[i].z)
                }
                geometry.setDrawRange(0, n)
                if (lineRef.current) lineRef.current.visible = true

                // Mark geometry as dirty so that it will be updated in the next frame
                geometry.attributes.position.needsUpdate = true
                // Update bounding box
                geometry.computeBoundingBox()
                // Update bounding sphere
                geometry.computeBoundingSphere()
            }
        }
    })
    return (
        <group ref={groupRef}>
            <mesh ref={sphereMeshRef} userData={{
                bypassTeleportRaycaster: true
            }}>
                <sphereBufferGeometry attach="geometry" args={[sphereRadius, 32, 32]} />
                <meshBasicMaterial attach="material" color="white" transparent/>
            </mesh>
        </group>
    )
}

export function ARVisualizer({targzetRef}) {
    return null
}

export function XRLocomotion(
    {
        locomotionLambda=1.5, 
        maxParabolicSegments=20,
        parabolaSegmentLength=0.2,
        maxParabolaDistance=3, 
    }
    ) {
    // Allows locomotion on XR devices.

    // For AR: 
    // When the user double taps the screen, 
    // raycast and find closest object with "teleport-target" tag. 
    // If a "teleport-blocker" precedes the target, teleportation will be blocked. 
    // Validate teleportation target with normal vectors.
    // Show a sphere ripple around the target if the target is not blocked.

    // For VR: 
    // When the user holds the trigger, 
    // Project a parabolic line from the controller's position to the controller's forward vector.
    // For each segment (segment length definable), raycast and seek the closest object with "teleport-target" tag.
    // If a "teleport-blocker" precedes the target, teleportation will be blocked, and the parabola will be terminated. At the end of parabola, a translucent sphere indicates a blocked target.
    // If a "teleport-target" is found, the parabola will be terminated, and depending on whether the target is valid, either a translucent sphere or a solid sphere will be shown at the target.
    // Only show a solid sphere if the target is valid.

    // For both AR and VR:
    // We teleport / move the user by moving the player object (group of camera and controllers) from the useXR hook.
    // Teleportation will retain user's orientation.
    // The actual targeted location for teleportation should be the target location minus the offset from the XR space's  world origin.
    // During VR locomotion animation, display helmet overlay to reduce the user's field of view for better experience.
    // Use Three.js's damp to transition to target position, but clear target if user exits XR.
    // Initialize the target position to the XR camera's initial position (found in ViewerContext)

    // Implementation:

    // Initialize contexts / refs / variables
    const targetPositionRef = useRef<Vector3>(new Vector3())
    const lastPositionRef = useRef<Vector3>(new Vector3())
    const dtRef = useRef<number>(0) // Used for VR transition animation to determine movement velocity
    const {defaultXRCameraProps, xrMode} = useContext(ViewerContext)
    const gl = useThree((state)=>state.gl)

    useEffect(()=>{
        targetPositionRef.current.set(...defaultXRCameraProps.position)
    }, [defaultXRCameraProps])
    const {player} = useXR()

    // Reset target position to the XR camera's initial position if camera changes
    useEffect(()=>{
        targetPositionRef.current.set(...defaultXRCameraProps.position)
    }, [defaultXRCameraProps, xrMode])

    // Function for setting new target position
    const moveTo = useCallback((destination: Vector3)=>{
        const newDest = new Vector3().copy(destination).sub(gl.xr.getCamera().position).add(player.position)
        newDest.y = destination.y
        targetPositionRef.current.copy(destination)
    }, [player])
    
    // Per-frame updates to smoothly move the player to the target position
    useFrame((state, dt)=>{
        if (state.gl.xr.isPresenting) {
            lastPositionRef.current.copy(player.position)
            dtRef.current = dt
            player.position.set(
                MathUtils.damp(player.position.x, targetPositionRef.current.x, locomotionLambda, dt),
                MathUtils.damp(player.position.y, targetPositionRef.current.y, locomotionLambda, dt),
                MathUtils.damp(player.position.z, targetPositionRef.current.z, locomotionLambda, dt)
            )
        }
    })

    // Binding for AR teleportation triggers
    useARControls((dest:TeleportableDestination)=>{
        moveTo(dest.position)
    })

    const parabolicRaycastFrameRef = useVRControls((dest:TeleportableDestination)=>{
        moveTo(dest.position)
    }, maxParabolicSegments, parabolaSegmentLength, maxParabolaDistance)

    // Binding for VR teleportation triggers

    // Todo: Subcomponents for visualizing AR teleportation target, and VR parabola and target.

    return (
        <Fragment>
            <DefaultXRControllers/>
            <VRVisualizer targetTraceRef={parabolicRaycastFrameRef} maxSegments={maxParabolicSegments}/>
        </Fragment> 
    )
}

function validNormal(normal: Vector3 | undefined, upVector: Vector3, maxDeg: number): boolean {
    if (normal) {
        // Check angleTo with upVector
        const angle = normal.angleTo(upVector)
        return (angle <= maxDeg)
    } else {
        return false
    }
}

export function applyTeleportationTargetEffect(object: Object3D, effect: TargetEffect) {
    if (effect === "blocker") {
        object.userData.teleportEffect = "blocker"
        object.layers.enable(3)
    }
    if (effect === "target") {
        object.userData.teleportEffect = "target"
        object.layers.enable(3)
    }
    if (effect === "bypass") {
        object.userData.teleportEffect = undefined
        object.layers.disable(3)
    }
    // console.log(object)
}