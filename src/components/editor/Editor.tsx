import { cloneElement, useContext, useEffect } from 'react';
import DebugViewport from '../DebugViewport';
import DebugPlane from '../3d/DebugPlane';
import { useState } from 'react';
import EditorComponentGraph from './EditorComponentGraph';
import EditorComponentProperties from './EditorComponentProperties';
import MagicDiv from '../MagicDiv';
import EditorTransformControls from './EditorTransformControls';
import EditorTransformOptions from './EditorTransformOptions';
import EditorIO from './EditorIO';
import { KeyPressCallback, useKeyPress } from '../../utilities';
import EditorSceneSettings from './EditorSceneSettings';
import { EditorContext } from './EditorContext';
import ViewerManager from '../viewer/Viewer';
import { ViewerContext } from '../viewer/ViewerContext';

function Editor() {
    return (
        <ViewerManager>
            <EditorManager/>
        </ViewerManager>
    )
}

function EditorManager() {
    const {sceneChildren} = useContext(ViewerContext)
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

    useEffect(()=>{
        const sceneIDs = sceneChildren.map(child => child.props.id)
        setSelectedIDs(selectedIDs.filter(id => sceneIDs.includes(id)))
    }, [sceneChildren])

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
            {selectedIDs, setSelectedIDs, addSelectedIDs, removeSelectedIDs, transformMode, setTransformMode, transformSpace, setTransformSpace, overrideInteractions, setOverrideInteractions, shiftPressed}
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