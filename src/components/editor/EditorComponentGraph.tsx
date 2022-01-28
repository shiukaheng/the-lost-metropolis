import EditorEmbeddedWidget from "./EditorEmbeddedWidget";
import Select from 'react-dropdown-select';
import MagicDiv from "../MagicDiv";

// Component for selecting scene or deleting scene components, stays in sync with the editor viewport
export default function EditorComponentGraph({sceneChildren, onUpdateSceneChildren, selectedSceneChildren, onUpdateSelectedSceneChildren, supportedComponents}) {
    return (
        <EditorEmbeddedWidget title="Components">
            <div className="flex flex-row">
                <Select className="bg-white text-black flex-grow" searchable options={supportedComponents} labelField="componentName" valueField="componentName"/>
                <MagicDiv mergeTransitions className="secondary-button ml-auto">Add</MagicDiv>
            </div>
        </EditorEmbeddedWidget>
    )
}