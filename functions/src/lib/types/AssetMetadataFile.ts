import { InferType, object, string } from "yup";
import { sourceAssetLiteralSchema, targetAssetLiteralSchema } from "../../../../api/types/AssetLiteral";

export const assetMetadataFileSchema = object({
    sourceAssetType: sourceAssetLiteralSchema.required(),
    targetAssetType: targetAssetLiteralSchema.required(),
    name: string(),
    assetData: object()
})

export type AssetMetadataFile = InferType<typeof assetMetadataFileSchema>