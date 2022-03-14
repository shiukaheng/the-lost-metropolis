import { sourceAssetLiteralSchema, targetAssetLiteralSchema } from './AssetLiteral';
import { boolean, InferType, number, object, string } from "yup";

export const assetSchema = object({
    data: object().required(),
    metadata: object({
        name: string().required().default("untitled asset"),
        sourceAssetType: sourceAssetLiteralSchema.required().default(null),
        targetAssetType: targetAssetLiteralSchema.required().default(null),
        createdAt: string().required().default(() => new Date().toISOString()),
        status: object({
            uploaded: boolean().required().default(false),
            processedProgress: number().required().min(0).max(1).default(0),
            processed: boolean().required().default(false),
            ready: boolean().required().default(false),
            pending: boolean().required().default(true)
        }).required()
    }).required()
})

export type Asset = InferType<typeof assetSchema>