import {ReactNode} from 'react';

type EditorInputType = {
    typeName: string
    typeCheck: (value: any) => boolean
}

const NumberType: EditorInputType = {
    typeName: "number",
    typeCheck: (value) => typeof value === "number"
}

const StringType: EditorInputType = {
    typeName: "string",
    typeCheck: (value) => typeof value === "string" && (value !== undefined)
}

const URLType: EditorInputType = {
    typeName: "url",
    typeCheck: (value) => typeof value === "string" && value.startsWith("http")
}

const VectorType: EditorInputType = {
    typeName: "vector",
    typeCheck: (value) => Array.isArray(value) && value.length > 0 && value.every(v => typeof v === "number" && !isNaN(v))
}

const Vector3Type: EditorInputType = {
    typeName: "vector3",
    typeCheck: (value) => VectorType.typeCheck(value) && value.length === 3
}

const Vector4Type: EditorInputType = {
    typeName: "vector4",
    typeCheck: (value) => VectorType.typeCheck(value) && value.length === 4
}

const Vector2Type: EditorInputType = {
    typeName: "vector2",
    typeCheck: (value) => VectorType.typeCheck(value) && value.length === 2
}

const ColorType: EditorInputType = {
    typeName: "color",
    typeCheck: (value) => VectorType.typeCheck(value) && value.length === 3
}

const QuaternionType: EditorInputType = {
    typeName: "quaternion",
    typeCheck: (value) => VectorType.typeCheck(value) && value.length === 4
}

const EulerOrders = ["XYZ", "YZX", "ZXY", "XZY", "YXZ", "ZYX"]

const EulerType: EditorInputType = {
    typeName: "euler",
    typeCheck: ([x, y, z, ...remaining]) => VectorType.typeCheck([x, y, z]) && ((remaining.length === 0) || ((remaining.length === 1) && (EulerOrders.includes(remaining[0]))))
}

const Matrix3Type: EditorInputType = {
    typeName: "matrix3",
    typeCheck: (value) => VectorType.typeCheck(value) && value.length === 9
}

const Matrix4Type: EditorInputType = {
    typeName: "matrix4",
    typeCheck: (value) => VectorType.typeCheck(value) && value.length === 16
}

// Matrix type is a special case, since it should be composed of arrays of arrays of numbers. Not directly usable in R3F, more of a helper for the Matrix3 and Matrix4 types
const MatrixType: EditorInputType = {
    typeName: "matrix",
    typeCheck: (value) => Array.isArray(value) && value.length > 0 && value.every(row => Array.isArray(row) && row.length > 0 && row.every(v => typeof v === "number" && !isNaN(v)))
}

const BooleanType: EditorInputType = {
    typeName: "boolean",
    typeCheck: (value) => typeof value === "boolean"
}

export {
    EditorInputType, NumberType, Vector3Type, Vector4Type, Vector2Type, ColorType, QuaternionType, EulerType, Matrix3Type, Matrix4Type, StringType, URLType, VectorType, MatrixType, BooleanType
}