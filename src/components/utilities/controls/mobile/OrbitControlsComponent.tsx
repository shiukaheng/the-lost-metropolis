import { EventManager, ReactThreeFiber, useFrame, useThree } from '@react-three/fiber'
import * as React from 'react'
import { useRef } from 'react'
import { Camera, Event, Group, MathUtils, Matrix4, Object3D, Quaternion, Raycaster, Vector3 } from 'three'
import { useEventListener } from '../../../../utilities'
import { ViewerContext } from '../../../viewer/ViewerContext'
import { useCameraUpdateHelper } from '../../../viewer/ViewportCanvas'
import { processIntersections } from '../XRControls'
import { OrbitControls as OrbitControlsImpl } from "./orbitControls"

export type OrbitControlsProps = Omit<
  ReactThreeFiber.Overwrite<
    ReactThreeFiber.Object3DNode<OrbitControlsImpl, typeof OrbitControlsImpl>,
    {
      camera?: Camera
      domElement?: HTMLElement
      enableDamping?: boolean
      makeDefault?: boolean
      onChange?: (e?: Event) => void
      onEnd?: (e?: Event) => void
      onStart?: (e?: Event) => void
      regress?: boolean
      target?: Object3D
      doubleTapMaxDelay?: number
      locomotionLambda?: number
      cameraOffset?: number
    }
  >,
  'ref'
>

// To repurpose OrbitControls into our desired TouchControls:
// Limit the offset length to be a short constant (for a depth effect, and inside-out controls)
// DON'T put the camera in the group, for less complexity
// Modify OrbitControls to take a TargetObject instead of a target
// Create an Object3D, initializing its pose as the scene camera
// Create a TargetObject, intializing its pose a set distance forward from the Object3D, in the direction the camera is looking
// Put both Object3D and TargetObject in a group
// Initialize OrbitControls with a generic Object3D as the camera, and the TargetObject
// Copy camera position to the Object3D's position


export const OrbitControls = React.forwardRef<OrbitControlsImpl, OrbitControlsProps>(
  ({ makeDefault, camera, regress, domElement, enableDamping = true, onChange, onStart, onEnd, doubleTapMaxDelay=300, locomotionLambda=1.5, cameraOffset=0.1, ...restProps }, ref) => {
    useCameraUpdateHelper()
    const invalidate = useThree((state) => state.invalidate)
    const defaultCamera = useThree((state) => state.camera)
    const gl = useThree((state) => state.gl)
    const scene = useThree((state) => state.scene)
    const events = useThree((state) => state.events) as EventManager<HTMLElement>
    const set = useThree((state) => state.set)
    const get = useThree((state) => state.get)
    const viewerPerformance = useThree((state) => state.performance)
    const explCamera = camera || defaultCamera
    const explDomElement = (domElement || events.connected || gl.domElement) as HTMLElement
    const controls = React.useMemo(() => new OrbitControlsImpl(explCamera), [explCamera])

    // Initialize objects and group
    const proxyCamera = React.useMemo(()=>new Object3D(), [])
    const target = React.useMemo(()=>new Object3D(), [])
    const transformGroup = React.useMemo(()=>new Group(), [])

    React.useEffect(()=>{
        proxyCamera.position.copy(explCamera.position)
        proxyCamera.rotation.copy(explCamera.rotation)
        // Set the target to be a distance forward from the proxy camera, in the direction the camera is looking
        const forward = new Vector3(0,0,1)
        forward.applyQuaternion(proxyCamera.quaternion)
        target.position.copy(proxyCamera.position).add(forward.multiplyScalar(cameraOffset))
        transformGroup.add(proxyCamera, target)
        console.log("Copied camera position to proxy camera position")
    }, [])

    useFrame(() => {
      if (controls.enabled) controls.update()
    }, -1)

    const worldPosVec = React.useMemo(()=>new Vector3(), [])
    const worldQuatVec = React.useMemo(()=>new Quaternion(), [])

    useFrame((state, dt)=>{
      explCamera.position.copy(proxyCamera.getWorldPosition(worldPosVec))
      explCamera.quaternion.copy(proxyCamera.getWorldQuaternion(worldQuatVec))
      transformGroup.position.x = MathUtils.damp(transformGroup.position.x, groupOffsetTarget[0], locomotionLambda, dt)
      transformGroup.position.y = MathUtils.damp(transformGroup.position.y, groupOffsetTarget[1], locomotionLambda, dt)
      transformGroup.position.z = MathUtils.damp(transformGroup.position.z, groupOffsetTarget[2], locomotionLambda, dt)
    })

    const [groupOffsetTarget, setGroupOffsetTarget] = React.useState<[number, number, number]>([0, 0, 0])

    // Raycast to layer 3 on double-taps
    const raycaster = React.useMemo(() => {
      const raycaster = new Raycaster()
      raycaster.layers.set(3)
      return raycaster
    }, [])

    // On double-tap, move the camera to the layer 3 position by setting positionOffsetTarget
    const onDoubleTap = React.useCallback((x, y) => {
      raycaster.setFromCamera({ x, y }, explCamera)
      const intersects = raycaster.intersectObjects(scene.children, true)
      const destination = processIntersections(intersects)
      if (destination.valid && destination.position) {
        // positionOffsetTarget.current.copy(destination.position)
        // Detect current floor by raycasting straight down (HaCkY!)
        raycaster.set(explCamera.position, new Vector3(0, -1, 0)) // TODO: Allow specification of up vector
        const intersects = raycaster.intersectObjects(scene.children, true)
        const floor = processIntersections(intersects)
        if (floor.valid && floor.position) {
          // Preserving floor height (which is NOT absolute height), move the camera from the current position to the destination position
          // positionOffsetTarget.current.copy(destination.position).sub(floor.position)
          const offset = destination.position.clone().sub(floor.position)
          setGroupOffsetTarget(offset.toArray())
        } else {
          // No current floor found, just move the camera to the destination position from camera position
          // positionOffsetTarget.current.copy(destination.position).sub(explCamera.getWorldPosition(new Vector3()))
          const offset = destination.position.clone().sub(explCamera.getWorldPosition(new Vector3()))
          setGroupOffsetTarget(offset.toArray())
        }
        console.log('Double-tap detected, moving camera to', groupOffsetTarget)
      }
    }, [explCamera, explDomElement, groupOffsetTarget])

    const lastTapTime = useRef<number | null>(null)

    const onTap = React.useCallback((e) => {
      // Get touch location from event, and transform to NDC taking into consideration that the DOM element may not be fullscreen (NDC is normamlized between -1 and 1)
      const x = ((e.touches[0].clientX - explDomElement.clientLeft) / explDomElement.clientWidth) * 2 - 1
      const y = ((e.touches[0].clientY - explDomElement.clientTop) / explDomElement.clientHeight) * -2 + 1
      if (lastTapTime.current) {
        const time = performance.now()
        if (((time - lastTapTime.current) <= doubleTapMaxDelay) && e.touches.length === 1) {
          onDoubleTap(x, y)
        }
      }
      lastTapTime.current = performance.now()
    }, [onDoubleTap, doubleTapMaxDelay])

    // Attach event listeners
    useEventListener('touchstart', onTap, explDomElement)

    React.useEffect(() => {
      controls.connect(explDomElement)
      return () => void controls.dispose()
    }, [explDomElement, regress, controls, invalidate])

    React.useEffect(() => {
      const callback = (e: Event) => {
        invalidate()
        if (regress) viewerPerformance.regress()
        if (onChange) onChange(e)
      }
      controls.addEventListener('change', callback)
      if (onStart) controls.addEventListener('start', onStart)
      if (onEnd) controls.addEventListener('end', onEnd)

      return () => {
        if (onStart) controls.removeEventListener('start', onStart)
        if (onEnd) controls.removeEventListener('end', onEnd)
        controls.removeEventListener('change', callback)
      }
    }, [onChange, onStart, onEnd, controls, invalidate])

    React.useEffect(() => {
      if (makeDefault) {
        const old = get().controls
        set({ controls })
        return () => set({ controls: old })
      }
    }, [makeDefault, controls])

    return <primitive ref={ref} object={controls} target={target} controlObject={proxyCamera} enableDamping={enableDamping} {...restProps} />
  }
)