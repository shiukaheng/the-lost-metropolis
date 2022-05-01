import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { Asset } from "../../../../api/types/Asset";
import { Instance } from "../../../../api/utility_types";
import VaporAPI from "../../../api_client/api";
import { useChooseFile, useMultiLang } from "../../../utilities";
import MagicButton from "../../utilities/MagicButton";
import MagicDiv from "../../utilities/MagicDiv";
import EditorEmbeddedWidget from "./EditorEmbeddedWidget";
import { ReactComponent as Trash } from "../svgs/trash.svg"
import MagicIcon from "../../utilities/MagicIcon";

export default function EditorAssetManager({postID, assets}: {postID?: string, assets?: (Instance<Asset>)[]}) {
    const [createPrompt, file, valid, clearFiles] = useChooseFile((file) => file.name.endsWith(".vaps"))
    const [uploadProgress, setUploadProgress] = useState<null|number>(null)
    const title = useMultiLang({
        en: "asset manager",
        zh: "資源管理器",
    })
    const chooseFile = useMultiLang({
        en: "choose asset file (.vaps)",
        zh: "選擇資源檔 (.vaps)",
    })
    const invalidFile = useMultiLang({
        en: "invalid file format",
        zh: "無效檔案格式",
    })
    const uploadButtonText = useMultiLang({
        en: "upload",
        zh: "上傳",
    })
    return (
        <EditorEmbeddedWidget title={title} stickyKey="assetManExpanded">
            <div className="flex flex-row gap-2">
                <MagicButton solid onClick={createPrompt} className="h-9 md:h-9 grow text-base md:text-base font-normal text-left">{(valid === false) ? invalidFile : (file?.name || chooseFile)}</MagicButton>
                <MagicButton className="h-9 md:h-9" onClick={async ()=>{
                    if((file !== null) && (uploadProgress === null)) {
                        setUploadProgress(0)
                        try {
                            await VaporAPI.uploadAsset(postID as string, file, (progress: number)=>{
                                setUploadProgress(progress)
                            }, ["3d-editor"])
                        } catch (e) {
                            console.warn("Error uploading asset...")
                            if (window.location.hostname !== "localhost") {
                                throw e
                            } 
                        }
                        setUploadProgress(null)
                        clearFiles()
                    }
                }} disabled={(file === null) || (uploadProgress !== null)}>{(uploadProgress === null) ? uploadButtonText : `${Math.round(uploadProgress*100)
                }%`}</MagicButton>
            </div>
            {
                (assets !== undefined) && assets.filter(asset => asset.data.metadata.tags.includes("3d-editor")).map((asset, index) => {
                    return (
                        <AssetEntry key={index} asset={asset} postID={postID}/>
                    )
                })
            }
        </EditorEmbeddedWidget>
    )
}

function AssetEntry({asset, postID}: {asset: Instance<Asset>, postID: string}) {
    const assetLoading = useMultiLang({
        en: "unknown",
        zh: "未知",
    })
    const assetUntitled = useMultiLang({
        en: "untitled",
        zh: "未命名",
    })
    const unknownAssetType = useMultiLang({
        en: "unknown",
        zh: "未知",
    })
    const pending = useMultiLang({
        en: "pending",
        zh: "等待中",
    })
    const ready = useMultiLang({
        en: "ready",
        zh: "就緒",
    })
    const error = useMultiLang({
        en: "error",
        zh: "錯誤",
    })
    return (
        <MagicDiv className="flex flex-row gap-2">
            <div title={asset.id}>{`${asset.data.metadata.name || ((asset.data.metadata.status.pending === true) ? assetLoading : assetUntitled)} - <${asset.data.metadata.targetAssetType || unknownAssetType}>`}</div>
            <div title={(
                (asset.data.metadata.status.error !== null) ? asset.data.metadata.status.error : undefined
            )} className={twMerge("ml-auto", ((asset.data.metadata.status.error !== null) && "text-red-600"))}>
                {(asset.data.metadata.status.error === null) ?
                 `(${(asset.data.metadata.status.pending === true) ?
                 pending : asset.data.metadata.status.processed ?
                 ready : `${Math.round(asset.data.metadata.status.processedProgress*100)}%`})` : `(${error})`}
                </div>
            <div className="cursor-pointer h-5" onClick={()=>{}}>
                <MagicIcon fillCurrent IconComponent={Trash} clickable onClick={async () => {
                    await VaporAPI.deleteAsset(postID, asset.id)
                }
                }/>
            </div>
        </MagicDiv>
    )
}