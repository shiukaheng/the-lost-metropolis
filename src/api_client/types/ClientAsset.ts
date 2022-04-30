import { array, InferType, mixed, object, string } from "yup";
import { targetAssetLiteralSchema } from "../../../api/types/AssetLiteral";

// Parsed asset format for the client which contains postID and assetID

export const clientAssetSchema = object({
    postID: string().defined(),
    assetID: string().defined(),
    type: targetAssetLiteralSchema.required(),
    assetData: mixed(),
    name: string(),
    tags: array(string()).required(),
})

export type ClientAsset = InferType<typeof clientAssetSchema>;