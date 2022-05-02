import {ReactNode} from 'react';
import { magicStringSchema } from '../../../api/types/MagicString';
import { multiLangStringSchema } from '../../../api/types/MultiLangString';
import { clientAssetSchema } from '../../api_client/types/ClientAsset';

export type EditorInputType = {
    typeName: ArgumentLiteral
    typeCheck: (value: any) => boolean
    data?: any
}

export const NumberType: EditorInputType = {
    typeName: "number",
    typeCheck: (value) => typeof value === "number"
}

export const StringType: EditorInputType = {
    typeName: "string",
    typeCheck: (value) => typeof value === "string" && (value !== undefined)
}

export const URLType: EditorInputType = {
    typeName: "url",
    typeCheck: (value) => typeof value === "string" && (value !== undefined)
}

export const VectorType: EditorInputType = {
    typeName: "vector",
    typeCheck: (value) => Array.isArray(value) && value.length > 0 && value.every(v => typeof v === "number" && !isNaN(v))
}

export const Vector3Type: EditorInputType = {
    typeName: "vector3",
    typeCheck: (value) => VectorType.typeCheck(value) && value.length === 3
}

export const Vector4Type: EditorInputType = {
    typeName: "vector4",
    typeCheck: (value) => VectorType.typeCheck(value) && value.length === 4
}

export const Vector2Type: EditorInputType = {
    typeName: "vector2",
    typeCheck: (value) => VectorType.typeCheck(value) && value.length === 2
}

export const ColorType: EditorInputType = {
    typeName: "color",
    typeCheck: (value) => VectorType.typeCheck(value) && value.length === 3
}

export const QuaternionType: EditorInputType = {
    typeName: "quaternion",
    typeCheck: (value) => VectorType.typeCheck(value) && value.length === 4
}

export const EulerOrders = ["XYZ", "YZX", "ZXY", "XZY", "YXZ", "ZYX"]

export const EulerType: EditorInputType = {
    typeName: "euler",
    typeCheck: ([x, y, z, ...remaining]) => VectorType.typeCheck([x, y, z]) && ((remaining.length === 0) || ((remaining.length === 1) && (EulerOrders.includes(remaining[0]))))
}

export const Matrix3Type: EditorInputType = {
    typeName: "matrix3",
    typeCheck: (value) => VectorType.typeCheck(value) && value.length === 9
}

export const Matrix4Type: EditorInputType = {
    typeName: "matrix4",
    typeCheck: (value) => VectorType.typeCheck(value) && value.length === 16
}

// Matrix type is a special case, since it should be composed of arrays of arrays of numbers. Not directly usable in R3F, more of a helper for the Matrix3 and Matrix4 types
export const MatrixType: EditorInputType = {
    typeName: "matrix",
    typeCheck: (value) => Array.isArray(value) && value.length > 0 && value.every(row => Array.isArray(row) && row.length > 0 && row.every(v => typeof v === "number" && !isNaN(v)))
}

export const BooleanType: EditorInputType = {
    typeName: "boolean",
    typeCheck: (value) => typeof value === "boolean"
}

export const MultilineStringType: EditorInputType = { // TODO: Unify with StringType (?) as they should both output valid strings, instead return different UI based on the data given
    typeName: "multiline-string",
    typeCheck: (value) => typeof value === "string" && (value !== undefined)
}

export const MultiLangStringType: EditorInputType = {
    typeName: "multilang-string",
    typeCheck: (value) => multiLangStringSchema.isValidSync(value),
}

export const MagicStringType: EditorInputType = {
    typeName: "magic-string",
    typeCheck: (value) => magicStringSchema.isValidSync(value),
}

// export const AssetType: EditorInputType = {
//     typeName: "asset",
//     typeCheck: (value) => resolvedAssetSchema.isValidSync(value)
// }

export function createAssetType(acceptedAssetTypes?: string[], acceptedTags?: string[]): EditorInputType {
    return {
        typeName: "asset",
        typeCheck: (value) => (value === null) || (clientAssetSchema.isValidSync(value) && acceptedAssetTypes.includes(value.type)), // Input needs to be able to deal with null, since assets can't have some generic default type
        data: {
            "assetTypes": acceptedAssetTypes,
            "tags": acceptedTags
        }
    }
}

export type ArgumentLiteral = "number" | "string" | "url" | "vector" | "vector3" | "vector4" | "vector2" | "color" | "quaternion" | "euler" | "matrix3" | "matrix4" | "matrix" | "boolean" | "multiline-string" | "asset" | "multilang-string" | "magic-string"