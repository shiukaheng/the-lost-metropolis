import { Camera } from "@react-three/fiber"
import { createContext, MutableRefObject, ReactElement, RefObject } from "react"
import { EventDispatcher, XRSessionMode } from "three"
import { SceneChild } from "../../../api/types/SceneChild"

const defaultViewerContext: ViewerContextProps = {
    // A. Camera prop management
    defaultCameraProps: {
        position: [0,0,1],
        rotation: [0,0,0],
        fov: 50
    },
    setDefaultCameraProps: (props) => {},
    // B. XR camera prop management
    defaultXRCameraProps: {
        position: [0,0,1],
        rotation: [0,0,0],
        fov: 50
    },
    setDefaultXRCameraProps: (props) => {},
    // C. XR session management
    xrMode: null,
    _setXrMode: () => {}, // Require intervention from XRHelper
    xrSessionRef: {current: null}, // Require intervention from XRHelper
    xrRequesterRef: {current: null}, // Require intervention from XRHelper
    // D. General camera management
    cameraRef: {
        current: null
    },
    audioListener: null,
    // E. 3D component management
    sceneChildren: [],
    setSceneChildren: (children:[]) => { },
    addSceneChildren: (children:[]) => { },
    removeSceneChildren: (children:[]) => { },
    updateSceneChildren: (children:[]) => { },
    // F. Potree management
    potreePointBudget: 1000000,
    setPotreePointBudget: (budget:number) => {},
    potreeOptimisePointBudget: false,
    setPotreeOptimisePointBudget: (optimise:boolean) => {},
    // G. Event management
    eventDispatcher: new EventDispatcher(),
}

export type DefaultCameraPropType = {
    position: [number, number, number],
    rotation: [number, number, number],
    fov: number
}

interface ViewerContextProps {
    // A. Camera prop management
    defaultCameraProps: DefaultCameraPropType,
    setDefaultCameraProps: (props) => void,
    // B. XR Camera prop management
    defaultXRCameraProps: DefaultCameraPropType,
    setDefaultXRCameraProps: (props) => void,
    // C. XR session management
    xrMode: null | XRSessionMode,
    _setXrMode: (mode:null | XRSessionMode) => void, // Require intervention from XRHelper
    xrSessionRef: MutableRefObject<null | XRSession>, // Require intervention from XRHelper
    xrRequesterRef: MutableRefObject<null | ((mode: XRSessionMode, options: any)=>void)>, // Require intervention from XRHelper
    // D. General camera management
    cameraRef: MutableRefObject<null | Camera>,
    audioListener: AudioListener | null,
    // E. 3D component management
    sceneChildren: SceneChild[],
    setSceneChildren: (children:ReactElement<any>[]) => void,
    addSceneChildren: (children:ReactElement<any>[]) => void,
    removeSceneChildren: (children:ReactElement<any>[]) => void,
    updateSceneChildren: (children:ReactElement<any>[]) => void,
    // F. Potree management
    potreePointBudget: number,
    setPotreePointBudget: (budget:number) => void,
    potreeOptimisePointBudget: boolean,
    setPotreeOptimisePointBudget: (optimise:boolean) => void,
    // G. Event management
    eventDispatcher: EventDispatcher,
}

const ViewerContext = createContext(defaultViewerContext)

export { ViewerContext, defaultViewerContext }