import { createElement } from 'react';
import DebugViewport from '../DebugViewport';
import DebugPlane from '../3d/DebugPlane';
import { useState } from 'react';
import EditorEmbeddedWidget from './EditorEmbeddedWidget';
import EditorComponentGraph from './EditorComponentGraph';
import TestObject from '../3d/TestObject';
import { Vector3Type } from './EditorInputTypes';

var supportedComponents = []

function editorRegister(component, inputs) {
    supportedComponents.push({
        componentName: component.name,
        component: component,
        inputs: inputs
    })
}

// Register editable components
editorRegister(TestObject, {
    "position": {
        "type": Vector3Type,
        "default": [0, 0, 0]
    },
    "rotation": {
        "type": Vector3Type,
        "default": [0, 0, 0]
    },
    "scale": {
        "type": Vector3Type,
        "default": [1, 1, 1]
    }
})

function Editor() {
    const [sceneChildren, setSceneChildren] = useState([])
    return (
        <div className="absolute w-full h-full flex flex-row">
            <div className="w-1/2 h-full bg-zinc-800 flex flex-col p-4 text-white">
                <div className="editor-embedded-widget text-2xl font-bold">Editor</div>
                <EditorComponentGraph sceneChildren={sceneChildren} onUpdateSceneChildren={setSceneChildren} supportedComponents={supportedComponents}/>
            </div>
            <div className="w-1/2 h-full bg-black">
                <DebugViewport className="w-full h-full">
                    <DebugPlane rotation={[Math.PI/2, 0, 0]}/>
                    {sceneChildren}
                </DebugViewport>
            </div>
        </div>
    );
}

export {Editor, editorRegister}