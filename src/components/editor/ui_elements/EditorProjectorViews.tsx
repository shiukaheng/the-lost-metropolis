import { applyProps } from "@react-three/fiber";
import { useContext } from "react";
import { useMultiLang } from "../../../utilities";
import { ViewerContext } from "../../viewer/ViewerContext";
import EditorButton from "./EditorButton";
import EditorEmbeddedWidget from "./EditorEmbeddedWidget";
import EditorInput from "./EditorInput";

function EditorProjectorViews() {    
    const {projectorViews, setProjectorViews, cameraRef} = useContext(ViewerContext);
    const heading = useMultiLang({"en": "projector views", "zh":"投影機視圖"});
    const projectorPostionLabel = useMultiLang({"en": "projector position", "zh":"投影機位置"});
    const projectorRotationLabel = useMultiLang({"en": "projector rotation", "zh":"投影機旋轉"});
    const projectorFovLabel = useMultiLang({"en": "projector fov", "zh":"投影機視野"});
    const projectorAddLabel = useMultiLang({"en": "add projector", "zh":"添加投影機"});
    const projectorRemoveLabel = useMultiLang({"en": "remove projector", "zh":"移除投影機"});
    return (
        <EditorEmbeddedWidget title={heading} stickyKey="projectViewExpanded">
            <div className="flex flex-col gap-2">
                <EditorButton text={projectorAddLabel} onClick={()=>{
                    // Add a new projector view based on the current camera position
                    if (cameraRef.current) {
                        const newProjectorViews = {...projectorViews};
                        const newProjectorViewName = "projectorView" + Object.keys(projectorViews).length;
                        newProjectorViews[newProjectorViewName] = {
                            position: cameraRef.current.position.toArray(),
                            // @ts-ignore [n, n, n] vs n[]
                            rotation: cameraRef.current.rotation.toArray().slice(0, 3), // Remove unneeded format info
                            // @ts-ignore wrong types, included orthographic
                            fov: cameraRef.current.fov || 45
                        };
                        setProjectorViews(newProjectorViews);
                    }
                }}/>
                {
                    Object.keys(projectorViews).map((key) => {
                        return (
                            <div className="flex flex-col gap-22" key={key}>
                                <div className="font-bold">
                                    {key}
                                </div>
                                <EditorInput propName={projectorPostionLabel} typeName="vector3" value={projectorViews[key].position} setValue={(position)=>{setProjectorViews({...projectorViews, [key]: {...projectorViews[key], position}})}}/>
                                <EditorInput propName={projectorRotationLabel} typeName="euler" value={projectorViews[key].rotation} setValue={(rotation)=>{setProjectorViews({...projectorViews, [key]: {...projectorViews[key], rotation}})}}/>
                                <EditorInput propName={projectorFovLabel} typeName="number" value={projectorViews[key].fov} setValue={(fov)=>{setProjectorViews({...projectorViews, [key]: {...projectorViews[key], fov}})}}/>
                                <EditorButton className="mt-2" text={projectorRemoveLabel} onClick={()=>{const newProjectorViews = {...projectorViews}; delete newProjectorViews[key]; setProjectorViews(newProjectorViews)}}/>
                            </div>
                        )
                    })
                }
            </div>
        </EditorEmbeddedWidget>
    )
}

export default EditorProjectorViews;