import { useState } from "react"
import { AssetMetadataFile } from "../../../../functions/src/lib/types/AssetMetadataFile"
import VaporAPI from "../../../api_client/api"
import { useChooseFile, useMultiLang } from "../../../utilities"
import MagicButton from "../../utilities/MagicButton"

interface UploaderProps {
    extensions: string[]
    postID: string
    tags?: string[]
    metadata?: Partial<AssetMetadataFile> | ((file: File) => Partial<AssetMetadataFile>) // If a function is passed, it will be called with the file and the result will be used as the metadata
}

function generateMetadata(metadataProp: Partial<AssetMetadataFile> | ((file: File) => Partial<AssetMetadataFile>) | undefined, file: File): Partial<AssetMetadataFile> {
    if (typeof metadataProp === "function") {
        return metadataProp(file)
    } else if (metadataProp) {
        return metadataProp
    } else {
        return {}
    }
}

/**
 * Uploader component for single file assets, metadata should be provided to indicate the asset type (auto-detection is possible, but not stable)
 */
export function SingleFileAssetUploader({extensions, postID, tags, metadata}: UploaderProps) {
    const [uploadProgress, setUploadProgress] = useState<null|number>(null)
    var acceptFileString = ""
    if (extensions.length > 1) {
        acceptFileString = extensions.map(extension => `.${extension}`).join(", ")
    } else if (extensions.length === 1) {
        acceptFileString = `.${extensions[0]}`
    } else {
        acceptFileString = "*"
    }
    const [createPrompt, file, valid, clearFiles] = useChooseFile((file) => extensions.some(extension => file.name.endsWith(`.${extension}`)), acceptFileString)
    const chooseFile = useMultiLang({
        en: `choose a file (${acceptFileString})`,
        zh: `選擇檔案 (${acceptFileString})`,
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
        <div className="flex flex-col gap-2">
            <MagicButton solid onClick={createPrompt} className="h-9 md:h-9 grow text-base md:text-base font-normal text-left">{(valid === false) ? invalidFile : (file?.name || chooseFile)}</MagicButton>
            <MagicButton className="h-9 md:h-9" onClick={async ()=>{
                if((file !== null) && (uploadProgress === null)) {
                    setUploadProgress(0)
                    try {
                        await VaporAPI.uploadSingleFileAsset(postID as string, file, generateMetadata(metadata, file), (progress: number)=>{
                            setUploadProgress(progress)
                        }, tags)
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
    )
}