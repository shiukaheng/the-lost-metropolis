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
    typeCheck: (value) => typeof value === "string"
}

const URLType: EditorInputType = {
    typeName: "url",
    typeCheck: (value) => typeof value === "string" && value.startsWith("http")
}

const Vector3Type: EditorInputType = {
    typeName: "vector3",
    typeCheck: (value) => Array.isArray(value) && value.length === 3 && value.every(v => typeof v === "number")
}

const Vector4Type: EditorInputType = {
    typeName: "vector4",
    typeCheck: (value) => Array.isArray(value) && value.length === 4 && value.every(v => typeof v === "number")
}

const Vector2Type: EditorInputType = {
    typeName: "vector2",
    typeCheck: (value) => Array.isArray(value) && value.length === 2 && value.every(v => typeof v === "number")
}

const ColorType: EditorInputType = {
    typeName: "color",
    typeCheck: (value) => Array.isArray(value) && value.length === 3 && value.every(v => typeof v === "number")
}

const QuaternionType: EditorInputType = {
    typeName: "quaternion",
    typeCheck: (value) => Array.isArray(value) && value.length === 4 && value.every(v => typeof v === "number")
}

const EulerType: EditorInputType = {
    typeName: "euler",
    typeCheck: (value) => Array.isArray(value) && value.length === 3 && value.every(v => typeof v === "number")
}

const Matrix3Type: EditorInputType = {
    typeName: "matrix3",
    typeCheck: (value) => Array.isArray(value) && value.length === 9 && value.every(v => typeof v === "number")
}

const Matrix4Type: EditorInputType = {
    typeName: "matrix4",
    typeCheck: (value) => Array.isArray(value) && value.length === 16 && value.every(v => typeof v === "number")
}

const VectorType: EditorInputType = {
    typeName: "vector",
    typeCheck: (value) => Array.isArray(value) && value.length > 0 && value.every(v => typeof v === "number")
}

// Matrix type is a special case, since it should be composed of arrays of arrays of numbers. Not directly usable in R3F, more of a helper for the Matrix3 and Matrix4 types
const MatrixType: EditorInputType = {
    typeName: "matrix",
    typeCheck: (value) => Array.isArray(value) && value.length > 0 && value.every(v => Array.isArray(v) && v.length > 0 && v.every(v => typeof v === "number"))
}

export {
    EditorInputType, NumberType, Vector3Type, Vector4Type, Vector2Type, ColorType, QuaternionType, EulerType, Matrix3Type, Matrix4Type, StringType, URLType, VectorType, MatrixType
}