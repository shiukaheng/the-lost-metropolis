import { vector3Schema } from './Vector3';
import { array, number, object, InferType, TypeOf, SchemaOf } from 'yup';

export const cameraPropsSchema = object({
    fov: number().required(),
    position: vector3Schema.required(),
    rotation: vector3Schema.required()
})

export type CameraProps = InferType<typeof cameraPropsSchema>