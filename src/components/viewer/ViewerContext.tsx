import { Camera } from "@react-three/fiber"
import { createContext, ReactElement, RefObject } from "react"
import { SceneChild } from "../../../api/types/SceneChild"

// Define viewer context
const defaultViewerContext: ViewerContextProps = {
    // Default camera props
    defaultCameraProps: {
        position: [0,0,1],
        rotation: [0,0,0],
        fov: 50
    },
    setDefaultCameraProps: (props) => {},
    // Camera
    cameraRef: {
        current: null
    },
    audioListener: null,
    // Managing scene contents
    sceneChildren: [],
    setSceneChildren: (children:[]) => { },
    addSceneChildren: (children:[]) => { },
    removeSceneChildren: (children:[]) => { },
    updateSceneChildren: (children:[]) => { },
    potreePointBudget: 1000000,
    setPotreePointBudget: (budget:number) => {},
    potreeOptimisePointBudget: false,
    setPotreeOptimisePointBudget: (optimise:boolean) => {},
}

export type DefaultCameraPropType = {
    position: [number, number, number],
    rotation: [number, number, number],
    fov: number
}

interface ViewerContextProps {
    defaultCameraProps: DefaultCameraPropType,
    setDefaultCameraProps: (props) => void,
    cameraRef: RefObject<Camera>,
    audioListener: AudioListener | null,
    // Let sceneChildren be a list of VaporComponent instances
    sceneChildren: SceneChild[],
    setSceneChildren: (children:ReactElement<any>[]) => void,
    addSceneChildren: (children:ReactElement<any>[]) => void,
    removeSceneChildren: (children:ReactElement<any>[]) => void,
    updateSceneChildren: (children:ReactElement<any>[]) => void,
    potreePointBudget: number,
    setPotreePointBudget: (budget:number) => void,
    potreeOptimisePointBudget: boolean,
    setPotreeOptimisePointBudget: (optimise:boolean) => void,
}

const ViewerContext = createContext(defaultViewerContext)

export { ViewerContext, defaultViewerContext }