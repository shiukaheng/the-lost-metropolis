import { useChooseFile, useMultilang } from "../../../utilities";
import MagicButton from "../../utilities/MagicButton";
import EditorEmbeddedWidget from "./EditorEmbeddedWidget";

export default function EditorAssetManager() {
    const [createPrompt, file] = useChooseFile()
    const title = useMultilang({
        en: "Asset Manager",
        zh: "資源管理器",
    })
    const chooseFile = useMultilang({
        en: "choose a file",
        zh: "選擇檔案",
    })
    const uploadButtonText = useMultilang({
        en: "upload",
        zh: "上傳",
    })
    return (
        <EditorEmbeddedWidget title={title}>
            <div className="flex flex-row gap-2">
                <MagicButton solid onClick={createPrompt} className="h-9 md:h-9 grow text-base md:text-base font-normal text-left">{file?.name || chooseFile}</MagicButton>
                <MagicButton className="h-9 md:h-9" onClick={()=>{

                }}>{uploadButtonText}</MagicButton>
            </div>
        </EditorEmbeddedWidget>
    )
}