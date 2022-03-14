import { sourceAssetLiteralSchema, targetAssetLiteralSchema } from './AssetLiteral';
import { boolean, InferType, number, object, string } from "yup";

export const assetSchema = object({
    data: object().required(),
    metadata: object({
        name: string().required().default("untitled asset"),
        sourceAssetType: sourceAssetLiteralSchema.required(),
        targetAssetType: targetAssetLiteralSchema.required(),
        createdAt: string().required(),
        status: object({
            uploaded: boolean().required(),
            processedProgress: number().required().min(0).max(1),
            processed: boolean().required(),
            ready: boolean().required(),
            pending: boolean().required()
        })
    }).required()
})

export type Asset = InferType<typeof assetSchema>