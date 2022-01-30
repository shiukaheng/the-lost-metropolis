import { createElement } from 'react';
import DebugViewport from '../DebugViewport';
import DebugPlane from '../3d/DebugPlane';
import { useState } from 'react';
import EditorEmbeddedWidget from './EditorEmbeddedWidget';
import EditorComponentGraph from './EditorComponentGraph';
import TestObject from '../3d/TestObject';
import { BooleanType, EulerType, StringType, URLType, Vector3Type } from './EditorInputTypes';
import EditorComponentProperties from './EditorComponentProperties';
import MagicDiv from '../MagicDiv';
import { DepthKitObject } from '../3d/DepthKitObject';
import EditorTransformControls from './EditorTransformControls';

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
editorRegister(TestObject, genericProps)
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

function _updatePartialSceneChildren(sceneChildren, childrenToUpdate) {
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

function Editor() {
    const [sceneChildren, _setSceneChildren] = useState([])
    const [selectedIDs, setSelectedIDs] = useState([])
    const setSceneChildren = (newChildren) => {
        const sceneIDs = newChildren.map(child => child.props.id)
        setSelectedIDs(selectedIDs.filter(id => sceneIDs.includes(id)))
        _setSceneChildren(newChildren)
    }
    const updatePartialSceneChildren = (newChildren) => {
        _setSceneChildren(_updatePartialSceneChildren(sceneChildren, newChildren))
    }
    // Wrap children whose child.props.id is in selectedIDs with TransformControls
    const wrappedSceneChildren = sceneChildren.map(child => {
        if (selectedIDs.includes(child.props.id)) {
            return (
                <EditorTransformControls updatePartialSceneChildren={updatePartialSceneChildren} mode="translate" key={child.props.id}>
                    {child}
                </EditorTransformControls>
            )
        } else {
            return child
        }
    })

    return (
        <MagicDiv backgroundColorCSSProps={["backgroundColor"]} className="absolute w-full h-full flex flex-row">
            <div className="w-1/2 h-full flex flex-col p-4 overflow-clip">
                <div className="editor-embedded-widget text-2xl font-bold">Editor</div>
                <EditorComponentGraph sceneChildren={sceneChildren} setSceneChildren={setSceneChildren} selectedIDs={selectedIDs} setSelectedIDs={setSelectedIDs} supportedComponents={supportedComponents}/>
                <EditorComponentProperties sceneChildren={sceneChildren} setSceneChildren={setSceneChildren} selectedIDs={selectedIDs} supportedComponents={supportedComponents}/>
            </div>
            <div className="w-1/2 h-full bg-black">
                <DebugViewport className="w-full h-full">
                    <DebugPlane rotation={[Math.PI/2, 0, 0]}/>
                    {wrappedSceneChildren}
                </DebugViewport>
            </div>
        </MagicDiv>
    );
}

export {Editor, editorRegister}