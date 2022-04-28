import { applyProps } from "@react-three/fiber";
import { useContext } from "react";
import { useMultilang } from "../../../utilities";
import { ViewerContext } from "../../viewer/ViewerContext";
import EditorButton from "./EditorButton";
import EditorEmbeddedWidget from "./EditorEmbeddedWidget";
import EditorInput from "./EditorInput";

function EditorSceneSettings() {    
    const {defaultCameraProps, setDefaultCameraProps, cameraRef, potreePointBudget, setPotreePointBudget} = useContext(ViewerContext);
    const heading = useMultilang({"en": "scene Settings", "zh":"場景設定"});
    const pointBudgetLabel = useMultilang({"en": "point budget", "zh": "點限制"});
    const defaultCameraPosLabel = useMultilang({"en": "default camera position", "zh": "預設攝影機位置"});
    const defaultCameraRotLabel = useMultilang({"en": "default camera rotation", "zh": "預設攝影機旋轉"});
    const defaultCameraFOVLabel = useMultilang({"en": "default camera FOV", "zh": "預設攝影機 FOV"});
    const setToCurrentPoseLabel = useMultilang({"en": "set to current pose", "zh": "設定為當前姿態"});
    return (
        <EditorEmbeddedWidget title={heading} stickyKey="sceneSettingsExpanded">
            <div className="flex flex-col gap-2">
                <EditorInput propName={pointBudgetLabel} typeName="number" value={potreePointBudget} setValue={setPotreePointBudget}/>
                <EditorInput propName={defaultCameraPosLabel} typeName="vector3" value={defaultCameraProps.position} setValue={(position)=>{setDefaultCameraProps({...defaultCameraProps, position})}}/>
                <EditorInput propName={defaultCameraRotLabel} typeName="euler" value={defaultCameraProps.rotation} setValue={(rotation)=>{setDefaultCameraProps({...defaultCameraProps, rotation})}}/>
                <EditorInput propName={defaultCameraFOVLabel} typeName="number" value={defaultCameraProps.fov} setValue={(fov)=>{setDefaultCameraProps({...defaultCameraProps, fov})}}/>
                <EditorButton text={setToCurrentPoseLabel} className="text-center w-[250px]" onClick={()=>{
                    if (cameraRef.current) {
                        setDefaultCameraProps({
                            position: cameraRef.current.position.toArray(),
                            rotation: cameraRef.current.rotation.toArray().slice(0, 3), // Remove unneeded format info
                            fov: cameraRef.current.fov
                        })
                    }
                }}/>
            </div>
        </EditorEmbeddedWidget>
    )
}

export default EditorSceneSettings;