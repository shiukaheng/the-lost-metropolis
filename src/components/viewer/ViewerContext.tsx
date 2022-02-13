import { createContext } from "react"

// Define viewer context
const defaultViewerContext = {
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
    audioListener: AudioListener,
    // Managing scene contents
    sceneChildren: [],
    setSceneChildren: (children:[]) => { },
    addSceneChildren: (children:[]) => { },
    removeSceneChildren: (children:[]) => { },
    updateSceneChildren: (children:[]) => { },
    potreePointBudget: 1000000,
    setPotreePointBudget: (budget:number) => {},
}

const ViewerContext = createContext(defaultViewerContext)

export { ViewerContext, defaultViewerContext }