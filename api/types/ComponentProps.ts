import { vector3Schema } from './Vector3';
import { object, string, InferType } from 'yup';

export const componentPropsSchema = object({
    position: vector3Schema.required(),
    rotation: vector3Schema.required(),
    scale: vector3Schema.required(),
    name: string().required(),
    objectID: string().required(),
})

export type ComponentProps = InferType<typeof componentPropsSchema>

export const inputComponentPropsSchema = object({
    position: vector3Schema,
    rotation: vector3Schema,
    scale: vector3Schema,
    name: string().required(),
    objectID: string().required()
})

export type InputComponentProps = InferType<typeof inputComponentPropsSchema>

