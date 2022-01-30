import MagicDiv from "../MagicDiv";
import EditorEmbeddedWidget from "./EditorEmbeddedWidget";

function EditorIO({sceneChildren, setSceneChildren}) {
    return (
        <EditorEmbeddedWidget title="Import / Export">
            <div className="flex flex-row">
                <MagicDiv mergeTransitions className="editor-secondary-button" onClick={()=>{
                    console.log(sceneChildren)
                }}>
                    Export
                </MagicDiv>
            </div>
        </EditorEmbeddedWidget>
    );
}

export default EditorIO;    