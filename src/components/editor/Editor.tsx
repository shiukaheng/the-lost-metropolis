import { cloneElement, useContext, useEffect } from 'react';
import DebugViewport from '../DebugViewport';
import DebugPlane from '../3d/DebugPlane';
import { useState } from 'react';
import EditorComponentGraph from './ui_elements/EditorComponentGraph';
import EditorComponentProperties from './ui_elements/EditorComponentProperties';
import MagicDiv from '../MagicDiv';
import EditorTransformControls from './ui_elements/EditorTransformControls';
import EditorTransformOptions from './ui_elements/EditorTransformOptions';
import EditorIO from './EditorIO';
import { KeyPressCallback, useKeyPress } from '../../utilities';
import EditorSceneSettings from './ui_elements/EditorSceneSettings';
import { EditorContext } from './EditorContext';
import ViewerManager from '../viewer/Viewer';
import { ViewerContext } from '../viewer/ViewerContext';
import LabelIconObject from '../3d/LabelIconObject';

function Editor() {
    return (
        <ViewerManager>
            <EditorManager/>
        </ViewerManager>
    )
}

function EditorManager() {
    const {sceneChildren, setSceneChildren: _setSceneChildren} = useContext(ViewerContext)
    // Setup state for editor
    const [selectedIDs, setSelectedIDs] = useState([])
    const [transformMode, setTransformMode] = useState("translate")
    const [transformSpace, setTransformSpace] = useState("world")
    const [overrideInteractions, setOverrideInteractions] = useState(true)
    const shiftPressed = useKeyPress("Shift")
    // Create convenience functions for adding and removing selectedIDs
    const addSelectedIDs = (newIDs) => {
        setSelectedIDs(selectedIDs.concat(newIDs))
    }
    const removeSelectedIDs = (idsToRemove) => {
        setSelectedIDs(selectedIDs.filter(id => !idsToRemove.includes(id)))
    }

    // Overrides for setSceneChildren and removeSceneChildren to update selectedIDs

    const setSceneChildren = (newChildren) => {
        // Filter out selected IDs that don't exist in the new scene
        const newSelectedIDs = selectedIDs.filter(id => newChildren.find(child => child.props.id === id))
        setSelectedIDs(newSelectedIDs)
        // Update the scene
        _setSceneChildren(newChildren)
    }

    const removeSceneChildren = (childrenToRemove) => {
        setSceneChildren(sceneChildren.filter(child => !childrenToRemove.includes(child)))
    }

    // Wrap children whose child.props.id is in selectedIDs with TransformControls
    const wrappedSceneChildren = sceneChildren.map(child => {
        return (
            <EditorTransformControls enabled={selectedIDs.includes(child.props.id)} key={child.props.id}>
                {child}
            </EditorTransformControls>
        )
    })

    return (
        <EditorContext.Provider value={
            {selectedIDs, setSelectedIDs, addSelectedIDs, removeSelectedIDs, transformMode, setTransformMode, transformSpace, setTransformSpace, overrideInteractions, setOverrideInteractions, shiftPressed, setSceneChildren, removeSceneChildren}
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
    );
}

export {Editor}