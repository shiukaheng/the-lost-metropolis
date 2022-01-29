import { createElement } from 'react';
import DebugViewport from '../DebugViewport';
import DebugPlane from '../3d/DebugPlane';
import { useState } from 'react';
import EditorEmbeddedWidget from './EditorEmbeddedWidget';
import EditorComponentGraph from './EditorComponentGraph';
import TestObject from '../3d/TestObject';
import { EulerType, StringType, Vector3Type } from './EditorInputTypes';
import EditorComponentProperties from './EditorComponentProperties';
import MagicDiv from '../MagicDiv';
import { TransformControls } from '@react-three/drei';
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

// Register editable components
editorRegister(TestObject, {
    "name": {
        "type": StringType,
        "default": "TestObject"
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
})

function Editor() {
    const [sceneChildren, _setSceneChildren] = useState([])
    const [selectedIDs, setSelectedIDs] = useState([])
    const setSceneChildren = (newChildren) => {
        const sceneIDs = newChildren.map(child => child.props.id)
        setSelectedIDs(selectedIDs.filter(id => sceneIDs.includes(id)))
        _setSceneChildren(newChildren)
    }
    // Wrap children whose child.props.id is in selectedIDs with TransformControls
    const wrappedSceneChildren = sceneChildren.map(child => {
        if (selectedIDs.includes(child.props.id)) {
            return (
                <EditorTransformControls setSceneChildren={setSceneChildren} mode="translate" key={child.props.id}>
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