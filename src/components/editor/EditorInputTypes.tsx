import {ReactNode} from 'react';

type EditorArgumentType = {
    typeName: string
    typeCheck: (value: any) => boolean
}

const NumberType: EditorArgumentType = {
    typeName: "number",
    typeCheck: (value) => typeof value === "number"
}

const StringType: EditorArgumentType = {
    typeName: "string",
    typeCheck: (value) => typeof value === "string"
}

const URLType: EditorArgumentType = {
    typeName: "url",
    typeCheck: (value) => typeof value === "string" && value.startsWith("http")
}

const Vector3Type: EditorArgumentType = {
    typeName: "vector3",
    typeCheck: (value) => Array.isArray(value) && value.length === 3 && value.every(v => typeof v === "number")
}

const Vector4Type: EditorArgumentType = {
    typeName: "vector4",
    typeCheck: (value) => Array.isArray(value) && value.length === 4 && value.every(v => typeof v === "number")
}

const Vector2Type: EditorArgumentType = {
    typeName: "vector2",
    typeCheck: (value) => Array.isArray(value) && value.length === 2 && value.every(v => typeof v === "number")
}

const ColorType: EditorArgumentType = {
    typeName: "color",
    typeCheck: (value) => Array.isArray(value) && value.length === 3 && value.every(v => typeof v === "number")
}

const QuaternionType: EditorArgumentType = {
    typeName: "quaternion",
    typeCheck: (value) => Array.isArray(value) && value.length === 4 && value.every(v => typeof v === "number")
}

const EulerType: EditorArgumentType = {
    typeName: "euler",
    typeCheck: (value) => Array.isArray(value) && value.length === 3 && value.every(v => typeof v === "number")
}

const Matrix3Type: EditorArgumentType = {
    typeName: "matrix3",
    typeCheck: (value) => Array.isArray(value) && value.length === 9 && value.every(v => typeof v === "number")
}

const Matrix4Type: EditorArgumentType = {
    typeName: "matrix4",
    typeCheck: (value) => Array.isArray(value) && value.length === 16 && value.every(v => typeof v === "number")
}

export {
    NumberType, Vector3Type, Vector4Type, Vector2Type, ColorType, QuaternionType, EulerType, Matrix3Type, Matrix4Type, StringType, URLType
}