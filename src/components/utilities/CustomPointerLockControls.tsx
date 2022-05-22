import { ReactThreeFiber, useThree } from '@react-three/fiber'
import * as React from 'react'
import * as THREE from 'three'

import { Camera, Euler, EventDispatcher, Vector3 } from 'three'

class PointerLockControlsImpl extends EventDispatcher {
  private camera: Camera
  public domElement: HTMLElement

  public isLocked = false

  // Set to constrain the pitch of the camera
  // Range is 0 to Math.PI radians
  public minPolarAngle = 0 // radians
  public maxPolarAngle = Math.PI // radians

  private changeEvent = { type: 'change' }
  private lockEvent = { type: 'lock' }
  private unlockEvent = { type: 'unlock' }

  private euler = new Euler(0, 0, 0, 'YXZ')

  private PI_2 = Math.PI / 2

  private vec = new Vector3()

  constructor(camera: Camera, domElement: HTMLElement) {
    super()

    if (domElement === undefined) {
      console.warn('THREE.PointerLockControls: The second parameter "domElement" is now mandatory.')
      domElement = document.body
    }

    this.domElement = domElement
    this.camera = camera

    this.connect()
  }

  private onMouseMove = (event: MouseEvent): void => {
    if (this.isLocked === false) return

    const movementX = event.movementX || (event as any).mozMovementX || (event as any).webkitMovementX || 0
    const movementY = event.movementY || (event as any).mozMovementY || (event as any).webkitMovementY || 0

    this.euler.setFromQuaternion(this.camera.quaternion)

    this.euler.y -= movementX * 0.0005
    this.euler.x -= movementY * 0.0005

    this.euler.x = Math.max(this.PI_2 - this.maxPolarAngle, Math.min(this.PI_2 - this.minPolarAngle, this.euler.x))

    this.camera.quaternion.setFromEuler(this.euler)

    this.dispatchEvent(this.changeEvent)
  }

  private onPointerlockChange = (): void => {
    if (this.domElement.ownerDocument.pointerLockElement === this.domElement) {
      this.dispatchEvent(this.lockEvent)

      this.isLocked = true
    } else {
      this.dispatchEvent(this.unlockEvent)

      this.isLocked = false
    }
  }

  private onPointerlockError = (): void => {
    console.error('THREE.PointerLockControls: Unable to use Pointer Lock API')
  }

  public connect = (): void => {
    this.domElement.ownerDocument.addEventListener('mousemove', this.onMouseMove)
    this.domElement.ownerDocument.addEventListener('pointerlockchange', this.onPointerlockChange)
    this.domElement.ownerDocument.addEventListener('pointerlockerror', this.onPointerlockError)
  }

  public disconnect = (): void => {
    this.domElement.ownerDocument.removeEventListener('mousemove', this.onMouseMove)
    this.domElement.ownerDocument.removeEventListener('pointerlockchange', this.onPointerlockChange)
    this.domElement.ownerDocument.removeEventListener('pointerlockerror', this.onPointerlockError)
  }

  public dispose = (): void => {
    this.disconnect()
  }

  private getObject = (): Camera =>
    // retaining this method for backward compatibility
    this.camera

  private direction = new Vector3(0, 0, -1)
  public getDirection = (v: Vector3): Vector3 => v.copy(this.direction).applyQuaternion(this.camera.quaternion)

  public moveForward = (distance: number): void => {
    // move forward parallel to the xz-plane
    // assumes this.camera.up is y-up

    this.vec.setFromMatrixColumn(this.camera.matrix, 0)

    this.vec.crossVectors(this.camera.up, this.vec)

    this.camera.position.addScaledVector(this.vec, distance)
  }

  public moveRight = (distance: number): void => {
    this.vec.setFromMatrixColumn(this.camera.matrix, 0)

    this.camera.position.addScaledVector(this.vec, distance)
  }

  public lock = (): void => {
    this.domElement.requestPointerLock()
  }

  public unlock = (): void => {
    this.domElement.ownerDocument.exitPointerLock()
  }
}

export type PointerLockControlsProps = ReactThreeFiber.Object3DNode<
  PointerLockControlsImpl,
  typeof PointerLockControlsImpl
> & {
  selector?: string
  camera?: THREE.Camera
  onChange?: (e?: THREE.Event) => void
  onLock?: (e?: THREE.Event) => void
  onUnlock?: (e?: THREE.Event) => void
}

export const CustomPointerLockControls = React.forwardRef<PointerLockControlsImpl, PointerLockControlsProps>(
  ({ selector=".viewport-canvas", onChange, onLock, onUnlock, ...props }, ref) => {
    const { camera, ...rest } = props
    const gl = useThree(({ gl }) => gl)
    const defaultCamera = useThree(({ camera }) => camera)
    const invalidate = useThree(({ invalidate }) => invalidate)
    const explCamera = camera || defaultCamera

    const [controls] = React.useState(() => new PointerLockControlsImpl(explCamera, gl.domElement))

    React.useEffect(() => {
      const callback = (e: THREE.Event) => {
        invalidate()
        if (onChange) onChange(e)
      }

      controls?.addEventListener?.('change', callback)

      if (onLock) controls?.addEventListener?.('lock', onLock)
      if (onUnlock) controls?.addEventListener?.('unlock', onUnlock)

      return () => {
        controls?.removeEventListener?.('change', callback)
        if (onLock) controls?.addEventListener?.('lock', onLock)
        if (onUnlock) controls?.addEventListener?.('unlock', onUnlock)
      }
    }, [onChange, onLock, onUnlock, controls, invalidate])

    React.useEffect(() => {
      const handler = () => controls?.lock()
      const elements = selector ? Array.from(document.querySelectorAll(selector)) : [document]
      elements.forEach((element) => element && element.addEventListener('click', handler))
      return () => {
        elements.forEach((element) => (element ? element.removeEventListener('click', handler) : undefined))
      }
    }, [controls, selector])

    return controls ? <primitive ref={ref} dispose={undefined} object={controls} {...rest} /> : null
  }
)