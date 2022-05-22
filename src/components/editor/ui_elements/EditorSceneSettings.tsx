import { applyProps } from "@react-three/fiber";
import { useContext } from "react";
import { useMultiLang } from "../../../utilities";
import { ViewerContext } from "../../viewer/ViewerContext";
import EditorButton from "./EditorButton";
import EditorEmbeddedWidget from "./EditorEmbeddedWidget";
import EditorInput from "./EditorInput";

function EditorSceneSettings() {    
    const {defaultCameraProps, setDefaultCameraProps, defaultXRCameraProps, setDefaultXRCameraProps, cameraRef, potreePointBudget, setPotreePointBudget} = useContext(ViewerContext);
    const heading = useMultiLang({"en": "scene Settings", "zh":"場景設定"});
    const pointBudgetLabel = useMultiLang({"en": "point budget", "zh": "點限制"});
    const defaultCameraPosLabel = useMultiLang({"en": "default camera position", "zh": "預設攝影機位置"});
    const defaultCameraRotLabel = useMultiLang({"en": "default camera rotation", "zh": "預設攝影機旋轉"});
    const defaultCameraFOVLabel = useMultiLang({"en": "default camera FOV", "zh": "預設攝影機 FOV"});
    const setToCurrentPoseLabel = useMultiLang({"en": "set to current pose", "zh": "設定為當前姿態"});
    const defaultXRCameraPosLabel = useMultiLang({"en": "default XR camera position", "zh": "預設XR攝影機位置"});
    const defaultXRCameraRotLabel = useMultiLang({"en": "default XR camera rotation", "zh": "預設XR攝影機旋轉"});
    const defaultXRCameraFOVLabel = useMultiLang({"en": "default XR camera FOV", "zh": "預設XR攝影機 FOV"});
    const setXRToCurrentPoseLabel = useMultiLang({"en": "set XR to current pose", "zh": "設定XR為當前姿態"});
    return (
        <EditorEmbeddedWidget title={heading} stickyKey="sceneSettingsExpanded">
            <div className="flex flex-col gap-2">
                <EditorInput propName={pointBudgetLabel} typeName="number" value={potreePointBudget} setValue={setPotreePointBudget}/>
                <EditorInput propName={defaultCameraPosLabel} typeName="vector3" value={defaultCameraProps.position} setValue={(position)=>{setDefaultCameraProps({...defaultCameraProps, position})}}/>
                <EditorInput propName={defaultCameraRotLabel} typeName="euler" value={defaultCameraProps.rotation} setValue={(rotation)=>{setDefaultCameraProps({...defaultCameraProps, rotation})}}/>
                <EditorInput propName={defaultCameraFOVLabel} typeName="number" value={defaultCameraProps.fov} setValue={(fov)=>{setDefaultCameraProps({...defaultCameraProps, fov})}}/>
                <EditorButton text={setToCurrentPoseLabel} className="text-center" onClick={()=>{
                    if (cameraRef.current) {
                        setDefaultCameraProps({
                            position: cameraRef.current.position.toArray(),
                            rotation: cameraRef.current.rotation.toArray().slice(0, 3), // Remove unneeded format info
                            fov: cameraRef.current.fov
                        })
                    }
                }}/>
                {/* Lazy copy of default camera position for XR position, better locomotion options to be developed (floor aware) */}
                <EditorInput propName={defaultXRCameraPosLabel} typeName="vector3" value={defaultXRCameraProps.position} setValue={(position)=>{setDefaultXRCameraProps({...defaultXRCameraProps, position})}}/>
                <EditorInput propName={defaultXRCameraRotLabel} typeName="euler" value={defaultXRCameraProps.rotation} setValue={(rotation)=>{setDefaultXRCameraProps({...defaultXRCameraProps, rotation})}}/>
                <EditorInput propName={defaultXRCameraFOVLabel} typeName="number" value={defaultXRCameraProps.fov} setValue={(fov)=>{setDefaultXRCameraProps({...defaultXRCameraProps, fov})}}/>
                <EditorButton text={setXRToCurrentPoseLabel} className="text-center" onClick={()=>{
                    if (cameraRef.current) {
                        setDefaultXRCameraProps({
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