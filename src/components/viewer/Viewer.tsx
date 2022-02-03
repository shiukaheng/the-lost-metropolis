import { createContext, useRef, useState } from "react"

const defaultViewerContext = {
    defaultCameraProps: {
        position: [1,0,0],
        rotation: [0,0,0],
        fov: 50
    },
    setDefaultCameraProps: (props) => {},
    cameraRef: {
        current: null
    },
}

const ViewerContext = createContext(defaultViewerContext)

function ViewerManager({children}) {
    // Helps to manage Viewer state (camera initial position, post processing, etc), seperated to be reused in Editor and Viewer
    const [defaultCameraProps, setDefaultCameraProps] = useState({
        position: [1,0,0],
        rotation: [0,0,0],
        fov: 50
    })
    const cameraRef = useRef(null) // Will be updated by Viewport
    return (
        <ViewerContext.Provider value={{defaultCameraProps, setDefaultCameraProps, cameraRef}}>
            {children}
        </ViewerContext.Provider>
    );
}

export default ViewerManager;

export { ViewerContext, defaultViewerContext, ViewerManager }