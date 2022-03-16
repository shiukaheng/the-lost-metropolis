import { InferType, object, string } from "yup";

export const assetZipMetadataSchema = object({
    assetID: string().required(),
    postID: string().required(),
})

export type AssetZipMetadata = InferType<typeof assetZipMetadataSchema>