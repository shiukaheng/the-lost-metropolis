import { InferType, mixed, object, string } from "yup";
import { targetAssetLiteralSchema } from "../../../api/types/AssetLiteral";

export const clientAssetSchema = object({
    postID: string().defined(),
    assetID: string().defined(),
    type: targetAssetLiteralSchema.required(),
    assetData: mixed()
})

export type ClientAsset = InferType<typeof clientAssetSchema>;