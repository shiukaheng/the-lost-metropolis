import EditorEmbeddedWidget from "./EditorEmbeddedWidget";
import EditorInput from "./EditorInput";
import { v4 as uuidv4 } from 'uuid';
import { cloneElement, useContext } from "react";
import { EditorContext } from "./../EditorContext";
import { supportedComponents } from "../../viewer/ComponentDeclarations"
import { ViewerContext } from "../../viewer/ViewerContext";
import MagicDiv from "../../utilities/MagicDiv";
import { useMultilang } from "../../../utilities";

export default function EditorComponentProperties() {
    const { sceneChildren, setSceneChildren } = useContext(ViewerContext)
    const { selectedIDs } = useContext(EditorContext);
    const heading = useMultilang({"en": "component properties", "zh": "組件屬性"})
    return (
        <EditorEmbeddedWidget title={heading}>
            <div className="flex flex-col">
                <div className="flex flex-col gap-2">
                    {
                        selectedIDs.length === 1
                        ?
                        (()=>{
                            const child = sceneChildren.find(component => component.props.id === selectedIDs[0])
                            const propsDescription = supportedComponents.find(item => item.value.component === child.type).value.inputs
                            const inputs = Object.entries(propsDescription).map(([propName, propDescription], i) => (
                                <EditorInput key={selectedIDs[0]+i.toString()} propName={propName} typeName={propDescription.type.typeName} value={child.props[propName]} setValue={(value)=>{
                                    setSceneChildren(sceneChildren.map(child => {
                                        if (child.props.id === selectedIDs[0]) {
                                            return cloneElement(child, {
                                                [propName]: value
                                            })
                                        }
                                        return child
                                    }))
                                }}/>
                            ))
                            return inputs
                        })()
                        :
                        (
                            selectedIDs.length > 1
                            ?
                            // <div>Multiple components selected</div>
                            <MagicDiv languageSpecificChildren={
                                {
                                    "en": "Multiple components selected",
                                    "zh": "選擇多個組件"
                                }
                            }/>
                            :
                            // <div>No component selected</div>
                            <MagicDiv languageSpecificChildren={
                                {
                                    "en": "No component selected",
                                    "zh": "沒有選擇組件"
                                }
                            }/>
                        )
                    }
                </div>
            </div>
        </EditorEmbeddedWidget>
    )
}