import { vector3Schema } from './Vector3';
import { number, object, InferType } from 'yup';

export const cameraPropsSchema = object({
    fov: number().required(),
    position: vector3Schema.required(),
    rotation: vector3Schema.required()
})

export type CameraProps = InferType<typeof cameraPropsSchema>