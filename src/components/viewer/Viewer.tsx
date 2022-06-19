import { cloneElement, useRef, useState, useContext, useEffect } from "react"
import { joinChildren } from "../editor/utilities"
import { DefaultCameraPropType, ViewerContext } from "./ViewerContext"
import { AudioListener, EventDispatcher } from "three"
import { useStatefulDeserialize } from "../editor/ui_elements/EditorIO"
import Viewport from "./Viewport"
import { Post } from "../../../api/types/Post"
import { useContextBridge } from "@react-three/drei"
import { SettingsContext, ThemeContext } from "../App"
import { Camera, useFrame } from "@react-three/fiber"
import { XRControls } from "../utilities/controls/XRControls"
import { useRefContext, useThreeEventListener } from "../../utilities"

/**
 * Non-visual component that manages the viewer state, including scene configuration and scene children.
 */
function ViewerManager({children, defaultCameraProps}: {children: any, defaultCameraProps?: DefaultCameraPropType}) {
    // Helps to manage Viewer state (camera initial position, post processing, etc), seperated to be reused in Editor and Viewer
    const [_defaultCameraProps, setDefaultCameraProps] = useState<DefaultCameraPropType>(defaultCameraProps || {
        position: [0,0,1],
        rotation: [0,0,0],
        fov: 50
    })

    const [_defaultXRCameraProps, setDefaultXRCameraProps] = useState<DefaultCameraPropType>(defaultCameraProps || {
        position: [0,0,1],
        rotation: [0,0,0],
        fov: 50
    })

    const cameraRef = useRef<Camera>(null) // Will be updated by Viewport

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
        // console.log(joinChildren(sceneChildren, newChildren))
        setSceneChildren(joinChildren(sceneChildren, newChildren))
    }
    const removeSceneChildren = (childrenToRemove) => {
        setSceneChildren(sceneChildren.filter(child => !childrenToRemove.includes(child)))
    }

    // Create AudioListener
    const [audioListener] = useState(()=>{
        const audioListener = new AudioListener()
        return audioListener
    })

    // Args for Potree
    const [potreePointBudget, setPotreePointBudget] = useState(1e6)
    const [potreeOptimisePointBudget, setPotreeOptimisePointBudget] = useState(false)

    // XR
    const [xrMode, _setXrMode] = useState<null | XRSessionMode>(null)
    const xrSessionRef = useRef<null | XRSession>(null)
    const xrRequesterRef = useRef<null | ((XRSessionMode)=>void)>(null)

    // Events
    const [eventDispatcher, _setEventDispatcher] = useState(new EventDispatcher())

    // Navigation options
    const [flySpeed, setFlySpeed] = useState(2)

    return (
        <ViewerContext.Provider value={{
            // A. Camera prop management
            defaultCameraProps: _defaultCameraProps, 
            setDefaultCameraProps, 
            // B. XR Camera prop management
            defaultXRCameraProps: _defaultXRCameraProps,
            setDefaultXRCameraProps,
            // C. XR session management
            xrMode,
            _setXrMode,
            xrSessionRef,
            xrRequesterRef,
            // D. General camera management
            cameraRef, 
            audioListener, 
            // E. 3D component management
            sceneChildren, 
            setSceneChildren, 
            addSceneChildren, 
            removeSceneChildren, 
            updateSceneChildren, 
            // F. Potree management
            potreePointBudget, 
            setPotreePointBudget, 
            potreeOptimisePointBudget, 
            setPotreeOptimisePointBudget,
            // G. Event management
            eventDispatcher,
            // H. Navigation options
            flySpeed,
            setFlySpeed,
        }}>
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
            <XRControls/>
            {sceneChildren}
            {children}
        </Viewport>
    )
}

interface ViewerProps {
    post?: Post
    defaultCameraProps?: DefaultCameraPropType
    // Allow extra props to be passed to Viewport
    [key: string]: any
}

/**
 * Composite component that combines ViewerManager and ViewerUI
 */
function Viewer({post, className, style, children, ...props}: ViewerProps) {
    return (
        <ViewerManager {...props}>
            <ViewerUI post={post} {...{className, style}}>
                <FadeInAudio/>
                {children}
            </ViewerUI>
        </ViewerManager>
    )
}

function FadeInAudio({fadeInSeconds=1}) {
    const {eventDispatcher, audioListener} = useContext(ViewerContext)
    const viewerContextRef = useRefContext(ViewerContext)
    const volumeRef = useRef(0)
    const timePassed = useRef(0)
    const numResumes = useRef(0)
    const firstResume = useRef(false)
    useThreeEventListener("audio-resumed", ()=>{
        numResumes.current++
        if (numResumes.current === 1) {
            firstResume.current = true
        }
    }, eventDispatcher)
    useFrame((state, dt)=>{
        if (firstResume.current || viewerContextRef?.current?.audioListener?.context?.state === "running") {
            timePassed.current += dt
            if (timePassed.current <= fadeInSeconds) {
                volumeRef.current = timePassed.current / fadeInSeconds
                viewerContextRef.current?.audioListener.setMasterVolume(volumeRef.current)
            } else {
                viewerContextRef.current?.audioListener.setMasterVolume(1)
                firstResume.current = false
            }
        }
    })
    return null
}

export { ViewerManager, Viewer }