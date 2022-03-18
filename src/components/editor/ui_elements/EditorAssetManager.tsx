import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { Asset } from "../../../../api/types/Asset";
import { Instance } from "../../../../api/utility_types";
import VaporAPI from "../../../api_client/api";
import { useChooseFile, useMultilang } from "../../../utilities";
import MagicButton from "../../utilities/MagicButton";
import MagicDiv from "../../utilities/MagicDiv";
import EditorEmbeddedWidget from "./EditorEmbeddedWidget";

export default function EditorAssetManager({postID, assets}: {postID?: string, assets?: (Instance<Asset>)[]}) {
    const [createPrompt, file, valid, clearFiles] = useChooseFile((file) => file.name.endsWith(".vaps"))
    const [uploadProgress, setUploadProgress] = useState<null|number>(null)
    const title = useMultilang({
        en: "asset manager",
        zh: "資源管理器",
    })
    const chooseFile = useMultilang({
        en: "choose asset file (.vaps)",
        zh: "選擇資源檔 (.vaps)",
    })
    const invalidFile = useMultilang({
        en: "invalid file format",
        zh: "無效檔案格式",
    })
    const uploadButtonText = useMultilang({
        en: "upload",
        zh: "上傳",
    })
    return (
        <EditorEmbeddedWidget title={title}>
            <div className="flex flex-row gap-2">
                <MagicButton solid onClick={createPrompt} className="h-9 md:h-9 grow text-base md:text-base font-normal text-left">{(valid === false) ? invalidFile : (file?.name || chooseFile)}</MagicButton>
                <MagicButton className="h-9 md:h-9" onClick={()=>{
                    if(file) {
                        setUploadProgress(0)
                        VaporAPI.uploadAsset(postID as string, file, (progress: number)=>{
                            setUploadProgress(progress)
                        }).then(()=>{
                            setUploadProgress(null)
                        })
                    }
                }} disabled={(postID !== undefined) && (!(file !== null && valid === true))}>{(uploadProgress === null) ? uploadButtonText : `${Math.round(uploadProgress*100)
                }%`}</MagicButton>
            </div>
            {
                (assets !== undefined) && assets.map((asset, index) => {
                    return (
                        <AssetEntry key={index} asset={asset}/>
                    )
                })
            }
        </EditorEmbeddedWidget>
    )
}

function AssetEntry({asset}: {asset: Instance<Asset>}) {
    const assetLoading = useMultilang({
        en: "unknown",
        zh: "未知",
    })
    const assetUntitled = useMultilang({
        en: "untitled",
        zh: "未命名",
    })
    const unknownAssetType = useMultilang({
        en: "unknown",
        zh: "未知",
    })
    const pending = useMultilang({
        en: "pending",
        zh: "等待中",
    })
    const ready = useMultilang({
        en: "ready",
        zh: "就緒",
    })
    const error = useMultilang({
        en: "error",
        zh: "錯誤",
    })
    return (
        <MagicDiv className="flex flex-row">
            <div title={asset.id}>{`${asset.data.metadata.name || (asset.data.metadata.status.pending === true) ? assetLoading : assetUntitled} - <${asset.data.metadata.targetAssetType || unknownAssetType}>`}</div>
            <div title={(
                (asset.data.metadata.status.error !== null) ? asset.data.metadata.status.error : undefined
            )} className={twMerge("ml-auto", ((asset.data.metadata.status.error !== null) && "text-red-600"))}>{(asset.data.metadata.status.error === null) ? `(${(asset.data.metadata.status.pending === true) ? pending : asset.data.metadata.status.processed ? ready : `${Math.round(asset.data.metadata.status.processedProgress*100)}%`})` : `(${error})`}</div>
        </MagicDiv>
    )
}