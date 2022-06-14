import { EventManager, ReactThreeFiber, useFrame, useThree } from '@react-three/fiber'
import * as React from 'react'
import { useRef } from 'react'
import { Camera, Event, Group, MathUtils, Object3D, Raycaster, Vector3 } from 'three'
import { useEventListener } from '../../../../utilities'
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
      target?: ReactThreeFiber.Vector3
      doubleTapMaxDelay?: number
      locomotionLambda?: number
    }
  >,
  'ref'
>

export const OrbitControls = React.forwardRef<OrbitControlsImpl, OrbitControlsProps>(
  ({ makeDefault, camera, regress, domElement, enableDamping = true, onChange, onStart, onEnd, doubleTapMaxDelay=300, locomotionLambda=1.5, ...restProps }, ref) => {
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

    useFrame(() => {
      if (controls.enabled) controls.update()
    }, -1)

    // Move the camera into a group for easy translation, and on unmount, remove the group and set the camera to the appropriate position
    const groupRef = useRef<Group>(new Group())
    const originalParentRef = useRef<Object3D>()
    React.useEffect(()=>{
      if(!explCamera.parent) return
      originalParentRef.current = explCamera.parent
      explCamera.parent.remove(explCamera)
      groupRef.current.add(explCamera)
      originalParentRef.current.add(groupRef.current)
      return () => {
        if ((!(groupRef.current.parent)) || (!(originalParentRef.current))) return
        // Compute camera transform and move the camera back to the original parent
        const groupTransform = groupRef.current.matrixWorld
        const cameraTransform = explCamera.matrixWorld
        const newCameraTransform = groupTransform.clone().invert().multiply(cameraTransform)
        // Remove the group from the scene
        groupRef.current.parent.remove(groupRef.current)
        // Move the camera back to the original parent
        explCamera.removeFromParent()
        originalParentRef.current.add(explCamera)
        // Move the camera back to the original position
        explCamera.matrixWorld.copy(newCameraTransform)
      }
    }, [explCamera])

    const positionOffsetTarget = useRef<Vector3>(new Vector3())
    // const lookAtTargetOffsetTarget = useRef<Vector3>(new Vector3())

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
          positionOffsetTarget.current.copy(destination.position).sub(floor.position)
        } else {
          // No current floor found, just move the camera to the destination position from camera position
          positionOffsetTarget.current.copy(destination.position).sub(explCamera.getWorldPosition(new Vector3()))
        }
      }
    }, [explCamera, explDomElement])

    // Sync camera group position with positionOffsetTarget, with damping
    useFrame((state, dt) => {
      if (positionOffsetTarget.current && groupRef.current) {
        groupRef.current.position.x = MathUtils.damp(groupRef.current.position.x, positionOffsetTarget.current.x, locomotionLambda, dt)
        groupRef.current.position.y = MathUtils.damp(groupRef.current.position.y, positionOffsetTarget.current.y, locomotionLambda, dt)
        groupRef.current.position.z = MathUtils.damp(groupRef.current.position.z, positionOffsetTarget.current.z, locomotionLambda, dt)
      }
    })

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

    return <primitive ref={ref} groupRef={groupRef} object={controls} enableDamping={enableDamping} {...restProps} />
  }
)