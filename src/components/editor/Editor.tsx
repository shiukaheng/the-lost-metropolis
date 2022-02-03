import { cloneElement, createContext, createElement } from 'react';
import DebugViewport from '../DebugViewport';
import DebugPlane from '../3d/DebugPlane';
import { useState } from 'react';
import EditorEmbeddedWidget from './EditorEmbeddedWidget';
import EditorComponentGraph from './EditorComponentGraph';
import TestObject from '../3d/TestObject';
import { BooleanType, ColorType, EulerType, NumberType, StringType, URLType, Vector3Type } from './EditorInputTypes';
import EditorComponentProperties from './EditorComponentProperties';
import MagicDiv from '../MagicDiv';
import { DepthKitObject } from '../3d/DepthKitObject';
import EditorTransformControls from './EditorTransformControls';
import EditorTransformOptions from './EditorTransformOptions';
import EditorIO from './EditorIO';
import { KeyPressCallback, useKeyPress } from '../../utilities';
import { useContextBridge } from '@react-three/drei';
import LabelIconObject from '../3d/LabelIconObject';
import InfoObject from '../3d/InfoObject';
import PotreeObject from '../3d/PotreeObject';
import EditorSceneSettings from './EditorSceneSettings';
import ViewerManager, { defaultViewerContext, ViewerContext } from '../viewer/Viewer';

var supportedComponents = []

function editorRegister(component, inputs) {
    supportedComponents.push({
        label: component.name,
        value: {
            component: component,
            inputs: inputs
        }
    })
}

function getComponentPropInfo(component) {
    return supportedComponents.find(item => item.value.component === component).value.inputs
}

function getComponentPropInfoFromName(componentName) {
    return supportedComponents.find(item => item.value.component.name === componentName).value.inputs
}

function getComponentFromName(componentName) {
    return supportedComponents.find(item => item.value.component.name === componentName).value.component
}

const genericProps = {
    "name": {
        "type": StringType,
        "default": "Object"
    },
    "position": {
        "type": Vector3Type,
        "default": [0, 0, 0]
    },
    "rotation": {
        "type": EulerType,
        "default": [0, 0, 0]
    },
    "scale": {
        "type": Vector3Type,
        "default": [1, 1, 1]
    }
}

// Register editable components
editorRegister(TestObject, {
    ...genericProps,
    "color": {
        "type": ColorType,
        "default": [1, 1, 1]
    },
    "wireframe": {
        "type": BooleanType,
        "default": false
    }
})
editorRegister(DebugPlane, genericProps)
editorRegister(DepthKitObject, {
    ...genericProps,
    metaUrl: {
        type: URLType,
        default: "http://localhost/"
    },
    videoUrl: {
        type: URLType,
        default: "http://localhost/"
    },
    posterUrl: {
        type: URLType,
        default: "http://localhost/"
    },
    autoplay: {
        type: BooleanType,
        default: false
    },
    muted: {
        type: BooleanType,
        default: false
    },
    loop: {
        type: BooleanType,
        default: false
    },
})
editorRegister(PotreeObject, {
    ...genericProps,
    cloudName: {
        type: StringType,
        default: "cloud.js"
    },
    baseUrl: {
        type: URLType,
        default: "http://localhost/"
    },
    pointSize: {
        type: NumberType,
        default: 1
    }
    // Todo: Support selection types for pointSizeType, pointShape
})

function joinChildren(sceneChildren, childrenToUpdate) {
    // return new sceneChildren but with the children whose props.id is in updateChildren
    const idsToBeUpdated = childrenToUpdate.map(child => child.props.id)
    return sceneChildren.map(child => {
        if (idsToBeUpdated.includes(child.props.id)) {
            return childrenToUpdate.find(item => item.props.id === child.props.id)
        } else {
            return child
        }
    })
}

// Todo: Move common editor children props to context, including: 
// sceneChildren, setSceneChildren, addSceneChildren, removeSceneChildren,
// selectedIDs, setSelectedIDs, addSelectedIDs, removeSelectedIDs,
// transformMode, setTransformMode,
// transformSpace, setTransformSpace,
// overrideInteractions, setOverrideInteractions,
// supportedComponents

const defaultEditorContext = {
    sceneChildren: [],
    setSceneChildren: (children:[]) => { },
    addSceneChildren: (children:[]) => { },
    removeSceneChildren: (children:[]) => { },
    selectedIDs: [],
    setSelectedIDs: (ids:[]) => { },
    addSelectedIDs: (ids:[]) => { },
    removeSelectedIDs: (ids:[]) => { },
    transformMode: "translate",
    setTransformMode: (mode:string) => { },
    transformSpace: "world",
    setTransformSpace: (space:string) => { },
    overrideInteractions: false,
    setOverrideInteractions: (override:boolean) => { },
    supportedComponents: supportedComponents,
    shiftPressed: false,
    updateSceneChildren: (children:[]) => { },
}


// Components should be set to selection when clicked on, added to selection when shift-clicked, and all other behaviour should result in no changes

// Assume a unified interaction interface with mouse and VR controllers:
// Mouse:
// - onClick -> onClick
// - onMouseEnter -> onHover
// - onMouseLeave -> onBlur
// VR controller:
// - onClick -> onSelect
// - onHover -> onHover
// - onBlur -> onBlur

// Create convenience functions for creating 3d components respecting overrideInteractions:
// Provide onClick, onHover, onBlur wrapper functions to be used in components
// e.g., Before: onClick -> Do something After: onClick -> Do that something IF overrideInteractions is false, otherwise do other thing with ID as argument
// Take care that context may be undefined in cases where the component is not being used in an editor

function wrapOnClick(onClick:(e)=>void, context, id) {
    return (event) => {
        if (context?.overrideInteractions) {
            if (context.shiftPressed) {
                if (context.selectedIDs.includes(id)) {
                    context.removeSelectedIDs([id])
                } else {
                    context.addSelectedIDs([id])
                }
            } else {
                context.setSelectedIDs([id])
            }
        } else {
            onClick(event)
        }
    }
}

// Behaviour for hover and blur is to ignore if overrideInteractions is true; id is passed just in case for future use
function wrapOnHover(onHover:(e)=>void, context, id) {
    return (event) => {
        if (!context?.overrideInteractions) {
            onHover(event)
        }
    }
}

function wrapOnBlur(onBlur:(e)=>void, context, id) {
    return (event) => {
        if (!context?.overrideInteractions) {
            onBlur(event)
        }
    }
}
            

const EditorContext = createContext(defaultEditorContext)

function inspect(v:any) {
    console.log(v)
    return v
}

function Editor() {
    // Setup state for editor
    const [sceneChildren, _setSceneChildren] = useState([])
    const [selectedIDs, setSelectedIDs] = useState([])
    const [transformMode, setTransformMode] = useState("translate")
    const [transformSpace, setTransformSpace] = useState("world")
    const [overrideInteractions, setOverrideInteractions] = useState(true)
    const shiftPressed = useKeyPress("Shift")

    // Make selectedIDs react to setSceneChildren
    const setSceneChildren = (newChildren) => {
        const sceneIDs = newChildren.map(child => child.props.id)
        setSelectedIDs(selectedIDs.filter(id => sceneIDs.includes(id)))
        _setSceneChildren(newChildren)
    }

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
        _setSceneChildren(joinChildren(sceneChildren, newChildren))
    }
    const removeSceneChildren = (childrenToRemove) => {
        _setSceneChildren(sceneChildren.filter(child => !childrenToRemove.includes(child)))
        // Remove selected children
        setSelectedIDs(selectedIDs.filter(id => !childrenToRemove.map(child => child.props.id).includes(id)))
    }

    // Create convenience functions for adding and removing selectedIDs
    const addSelectedIDs = (newIDs) => {
        setSelectedIDs(selectedIDs.concat(newIDs))
    }
    const removeSelectedIDs = (idsToRemove) => {
        setSelectedIDs(selectedIDs.filter(id => !idsToRemove.includes(id)))
    }

    // Wrap children whose child.props.id is in selectedIDs with TransformControls
    const wrappedSceneChildren = sceneChildren.map(child => {
        return (
            <EditorTransformControls enabled={selectedIDs.includes(child.props.id)} updatePartialSceneChildren={updateSceneChildren} mode={transformMode} space={transformSpace} key={child.props.id}>
                {child}
            </EditorTransformControls>
        )
    })

    return (
        <ViewerManager>
            <EditorContext.Provider value={
                {sceneChildren, setSceneChildren, addSceneChildren, removeSceneChildren, selectedIDs, setSelectedIDs, addSelectedIDs, removeSelectedIDs, transformMode, setTransformMode, transformSpace, setTransformSpace, overrideInteractions, setOverrideInteractions, supportedComponents, shiftPressed, updateSceneChildren}
            }>
                <KeyPressCallback keyName={"Escape"} onDown={()=>{setSelectedIDs([])}}/>
                <MagicDiv backgroundColorCSSProps={["backgroundColor"]} className="absolute w-full h-full flex flex-row">
                    <div className="w-1/2 h-full flex flex-col p-4 overflow-clip">
                        <div className="editor-embedded-widget text-2xl font-bold">Editor</div>
                        <EditorComponentGraph/>
                        <EditorComponentProperties/>
                        <EditorTransformOptions/>
                        <EditorIO/>
                        <EditorSceneSettings/>
                    </div>
                    <div className="w-1/2 h-full bg-black">
                        <DebugViewport className="w-full h-full">
                            <DebugPlane rotation={[Math.PI/2, 0, 0]}/>
                                {wrappedSceneChildren}
                        </DebugViewport>
                    </div>
                </MagicDiv>
            </EditorContext.Provider>
        </ViewerManager>
    );
}

export {Editor, editorRegister, supportedComponents, getComponentPropInfo, getComponentPropInfoFromName, getComponentFromName, EditorContext, wrapOnClick, wrapOnHover, wrapOnBlur}