import { applyProps } from "@react-three/fiber";
import { useContext } from "react";
import { ViewerContext } from "../viewer/ViewerContext";
import EditorButton from "./EditorButton";
import EditorEmbeddedWidget from "./EditorEmbeddedWidget";
import EditorInput from "./EditorInput";

function EditorSceneSettings() {    
    const {defaultCameraProps, setDefaultCameraProps, cameraRef} = useContext(ViewerContext);
    return (
        <EditorEmbeddedWidget title="Scene settings">
            <div className="flex flex-col gap-2">
                <EditorInput propName="Default camera position" typeName="vector3" value={defaultCameraProps.position} setValue={(position)=>{setDefaultCameraProps({...defaultCameraProps, position})}}/>
                <EditorInput propName="Default camera rotation" typeName="euler" value={defaultCameraProps.rotation} setValue={(rotation)=>{setDefaultCameraProps({...defaultCameraProps, rotation})}}/>
                <EditorInput propName="Default camera fov" typeName="number" value={defaultCameraProps.fov} setValue={(fov)=>{setDefaultCameraProps({...defaultCameraProps, fov})}}/>
                <EditorButton text="Set to current" className="text-center w-[200px]" onClick={()=>{
                    if (cameraRef.current) {
                        setDefaultCameraProps({
                            position: cameraRef.current.position.toArray(),
                            rotation: cameraRef.current.rotation.toArray(),
                            fov: cameraRef.current.fov
                        })
                    }
                }}/>
            </div>
        </EditorEmbeddedWidget>
    )
}

export default EditorSceneSettings;