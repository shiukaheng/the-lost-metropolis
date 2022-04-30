import { sourceAssetLiteralSchema, targetAssetLiteralSchema } from './AssetLiteral';
import { array, boolean, InferType, number, object, string } from "yup";

export const assetSchema = object({
    data: object().nullable().defined().default(null),
    metadata: object({
        name: string().defined().default("untitled asset"),
        sourceAssetType: sourceAssetLiteralSchema.defined().nullable().default(null),
        targetAssetType: targetAssetLiteralSchema.defined().nullable().default(null),
        createdAt: string().required().default(() => new Date().toISOString()),
        status: object({
            uploaded: boolean().required().default(false),
            processedProgress: number().required().min(0).max(1).default(0),
            processed: boolean().required().default(false),
            ready: boolean().required().default(false),
            pending: boolean().required().default(true),
            error: string().nullable().default(null)
        }).required(),
        tags: array(string()).required().default([]),
    }).required()
})

export type Asset = InferType<typeof assetSchema>