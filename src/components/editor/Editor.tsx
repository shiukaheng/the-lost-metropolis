import { createContext, createElement } from 'react';
import DebugViewport from '../DebugViewport';
import DebugPlane from '../3d/DebugPlane';
import { useState } from 'react';
import EditorEmbeddedWidget from './EditorEmbeddedWidget';
import EditorComponentGraph from './EditorComponentGraph';
import TestObject from '../3d/TestObject';
import { BooleanType, ColorType, EulerType, StringType, URLType, Vector3Type } from './EditorInputTypes';
import EditorComponentProperties from './EditorComponentProperties';
import MagicDiv from '../MagicDiv';
import { DepthKitObject } from '../3d/DepthKitObject';
import EditorTransformControls from './EditorTransformControls';
import EditorTransformOptions from './EditorTransformOptions';
import EditorIO from './EditorIO';

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
    }})
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
// overrideInteractions, setOverrideInteractions

defaultEditorContext = {
    sceneChildren: [],
    setSceneChildren: () => { },
    addSceneChildren: () => { },
    removeSceneChildren: () => { },
    selectedIDs: [],
    setSelectedIDs: () => { },
    addSelectedIDs: () => { },
    removeSelectedIDs: () => { },
    transformMode: "translate",
    setTransformMode: () => { },
    transformSpace: "world",
    setTransformSpace: () => { },
    overrideInteractions: false,
    setOverrideInteractions: () => { },
}

const EditorContext = createContext(defaultEditorContext)

function Editor() {
    // Setup state for editor
    const [sceneChildren, _setSceneChildren] = useState([])
    const [selectedIDs, setSelectedIDs] = useState([])
    const [transformMode, setTransformMode] = useState("translate")
    const [transformSpace, setTransformSpace] = useState("world")
    const [overrideInteractions, setOverrideInteractions] = useState(true)

    // Make selectedIDs react to setSceneChildren
    const setSceneChildren = (newChildren) => {
        const sceneIDs = newChildren.map(child => child.props.id)
        setSelectedIDs(selectedIDs.filter(id => sceneIDs.includes(id)))
        _setSceneChildren(newChildren)
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
        if (selectedIDs.includes(child.props.id)) {
            return (
                <EditorTransformControls updatePartialSceneChildren={addSceneChildren} mode={transformMode} space={transformSpace} key={child.props.id}>
                    {child}
                </EditorTransformControls>
            )
        } else {
            return child
        }
    })

    return (
        <EditorContext.Provider value={
            {sceneChildren, setSceneChildren, addSceneChildren, removeSceneChildren, selectedIDs, setSelectedIDs, addSelectedIDs, removeSelectedIDs, transformMode, setTransformMode, transformSpace, setTransformSpace, overrideInteractions, setOverrideInteractions}
        }>
            <MagicDiv backgroundColorCSSProps={["backgroundColor"]} className="absolute w-full h-full flex flex-row">
                <div className="w-1/2 h-full flex flex-col p-4 overflow-clip">
                    <div className="editor-embedded-widget text-2xl font-bold">Editor</div>
                    <EditorComponentGraph sceneChildren={sceneChildren} setSceneChildren={setSceneChildren} selectedIDs={selectedIDs} setSelectedIDs={setSelectedIDs} supportedComponents={supportedComponents}/>
                    <EditorComponentProperties sceneChildren={sceneChildren} setSceneChildren={setSceneChildren} selectedIDs={selectedIDs} supportedComponents={supportedComponents}/>
                    <EditorTransformOptions {...{transformMode, setTransformMode, transformSpace, setTransformSpace}}/>
                    <EditorIO sceneChildren={sceneChildren} setSceneChildren={setSceneChildren}/>
                </div>
                <div className="w-1/2 h-full bg-black">
                    <DebugViewport className="w-full h-full">
                        <DebugPlane rotation={[Math.PI/2, 0, 0]}/>
                        <EditorContext.Provider value={{childrenInteractions: overrideInteractions}}>
                            {wrappedSceneChildren}
                        </EditorContext.Provider>
                    </DebugViewport>
                </div>
            </MagicDiv>
        </EditorContext.Provider>
    );
}

export {Editor, editorRegister, supportedComponents, getComponentPropInfo, getComponentPropInfoFromName, getComponentFromName, EditorContext}