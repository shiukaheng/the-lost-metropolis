import { cloneElement, useRef, useState, useContext, useEffect } from "react"
import { joinChildren } from "../editor/utilities"
import { DefaultCameraPropType, ViewerContext } from "./ViewerContext"
import { AudioListener } from "three"
import { useStatefulDeserialize } from "../editor/ui_elements/EditorIO"
import Viewport from "./Viewport"
import { Post } from "../../../api/types/Post"

/**
 * Non-visual component that manages the viewer state, including scene configuration and scene children.
 */
function ViewerManager({children}) {
    // Helps to manage Viewer state (camera initial position, post processing, etc), seperated to be reused in Editor and Viewer
    const [defaultCameraProps, setDefaultCameraProps] = useState<DefaultCameraPropType>({
        position: [0,0,1],
        rotation: [0,0,0],
        fov: 50
    })
    const cameraRef = useRef(null) // Will be updated by Viewport
    const [sceneChildren, setSceneChildren] = useState([])
    // Make selectedIDs react to setSceneChildren

    const updateSceneChildren = (newChildren) => {
        setSceneChildren(sceneChildren.map(child => {
            const newChild = newChildren.find(newChild => newChild.props.objectID === child.props.objectID)
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

    // Args for Potree
    const [potreePointBudget, setPotreePointBudget] = useState(1e6)
    const [potreeOptimisePointBudget, setPotreeOptimisePointBudget] = useState(false)

    return (
        <ViewerContext.Provider value={{defaultCameraProps, setDefaultCameraProps, cameraRef, sceneChildren, setSceneChildren, addSceneChildren, removeSceneChildren, updateSceneChildren, audioListener, potreePointBudget, setPotreePointBudget, potreeOptimisePointBudget, setPotreeOptimisePointBudget}}>
            {children}
        </ViewerContext.Provider>
    );
}

/**
 * Responsible for reading sceneChildren and configuration from ViewerContext, and providing GameControls.
 */
function ViewerUI({post, children, ...props}: ViewerProps) {
    const {sceneChildren} = useContext(ViewerContext)
    const deserialize = useStatefulDeserialize()
    useEffect(()=>{
        if (post !== null && post !== undefined) {
            deserialize(post)
        }
    }, [post])
    return (
        <Viewport {...props}>
            {sceneChildren}
            {children}
        </Viewport>
    )
}

interface ViewerProps {
    post?: Post
    // Allow extra props to be passed to Viewport
    [key: string]: any
}

/**
 * Composite component that combines ViewerManager and ViewerUI
 */
function Viewer({post, ...props}: ViewerProps) {
    return (
        <ViewerManager {...props}>
            <ViewerUI post={post} {...props}/>
        </ViewerManager>
    )
}

export { ViewerManager, Viewer }