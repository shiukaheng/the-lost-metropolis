import { createContext } from "react"

// Define viewer context
const defaultViewerContext = {
    // Default camera props
    defaultCameraProps: {
        position: [1,0,0],
        rotation: [0,0,0],
        fov: 50
    },
    setDefaultCameraProps: (props) => {},
    // Camera
    cameraRef: {
        current: null
    },
    // Managing scene contents
    sceneChildren: [],
    setSceneChildren: (children:[]) => { },
    addSceneChildren: (children:[]) => { },
    removeSceneChildren: (children:[]) => { },
    updateSceneChildren: (children:[]) => { },
}

const ViewerContext = createContext(defaultViewerContext)

export { ViewerContext, defaultViewerContext }