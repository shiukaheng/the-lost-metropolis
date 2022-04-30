import EditorEmbeddedWidget from "./EditorEmbeddedWidget";
import EditorInput from "./EditorInput";
import { v4 as uuidv4 } from 'uuid';
import { cloneElement, useContext } from "react";
import { EditorContext } from "./../EditorContext";
// import { supportedComponents } from "../../viewer/ComponentDeclarations"
import { components } from "../../viewer/ComponentDeclarations";
import { ViewerContext } from "../../viewer/ViewerContext";
import MagicDiv from "../../utilities/MagicDiv";
import { useMultilang } from "../../../utilities";
import { EditorInputType } from "../../viewer/ArgumentTypes";

/**
 * Processes input data property before passing it to the Input component, created so that in the 3D editor, it only shows assets that are tagged with "editor-3d"
 * @param propType The property to process
 */
function processPropData(propType) {
    // If prop is of type "Asset", we add "3d-editor" to the data.tags property
    if (propType.typeName === "asset") {
        return {
            ...propType.data,
            tags: [...(propType.data.tags || []), "3d-editor"]
        }
    } else {
        return propType.data
    }
}

export default function EditorComponentProperties() {
    const { sceneChildren, setSceneChildren } = useContext(ViewerContext)
    const { selectedIDs } = useContext(EditorContext);
    const heading = useMultilang({"en": "component properties", "zh": "組件屬性"})
    return (
        <EditorEmbeddedWidget title={heading} stickyKey="compPropExpanded">
            <div className="flex flex-col">
                <div className="flex flex-col gap-2">
                    {
                        selectedIDs.length === 1
                        ?
                        (()=>{
                            const child = sceneChildren.find(component => component.props.objectID === selectedIDs[0])
                            if (child === undefined) {
                                console.warn(`child with id ${selectedIDs[0]} not found`, sceneChildren.map(child => child.props.objectID))
                                return null
                            }
                            const propsDescription = child.type.inputs
                            const inputs = Object.entries(propsDescription).map(([propName, propDescription], i) => (
                                <EditorInput key={selectedIDs[0]+i.toString()} data={processPropData(propDescription.type)} propName={propName} typeName={propDescription.type.typeName} value={child.props[propName]} setValue={(value)=>{
                                    setSceneChildren(sceneChildren.map(child => {
                                        if (child.props.objectID === selectedIDs[0]) {
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