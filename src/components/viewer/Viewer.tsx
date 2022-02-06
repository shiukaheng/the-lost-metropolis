import { cloneElement, useRef, useState } from "react"
import { joinChildren } from "../editor/utilities"
import { ViewerContext } from "./ViewerContext"
import { AudioListener } from "three"

function ViewerManager({children}) {
    // Helps to manage Viewer state (camera initial position, post processing, etc), seperated to be reused in Editor and Viewer
    const [defaultCameraProps, setDefaultCameraProps] = useState({
        position: [0,0,1],
        rotation: [0,0,0],
        fov: 50
    })
    const cameraRef = useRef(null) // Will be updated by Viewport
    const [sceneChildren, setSceneChildren] = useState([])
    // Make selectedIDs react to setSceneChildren

    const updateSceneChildren = (newChildren) => {
        setSceneChildren(sceneChildren.map(child => {
            const newChild = newChildren.find(newChild => newChild.props.id === child.props.id)
            if (newChild) {
                return cloneElement(
                    child,
                    {
                        ...newChild.props
                    }
                )
            } else {
                return child
            }
        }))
    }
    
    // Create convenience functions for adding and removing children
    const addSceneChildren = (newChildren) => {
        setSceneChildren(joinChildren(sceneChildren, newChildren))
    }
    const removeSceneChildren = (childrenToRemove) => {
        setSceneChildren(sceneChildren.filter(child => !childrenToRemove.includes(child)))
    }

    // Create AudioListener
    const [audioListener] = useState(()=>{
        return new AudioListener()
    })

    return (
        <ViewerContext.Provider value={{defaultCameraProps, setDefaultCameraProps, cameraRef, sceneChildren, setSceneChildren, addSceneChildren, removeSceneChildren, updateSceneChildren, audioListener}}>
            {children}
        </ViewerContext.Provider>
    );
}

export default ViewerManager;

export { ViewerManager }