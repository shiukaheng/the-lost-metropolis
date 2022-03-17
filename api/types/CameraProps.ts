import { vector3Schema } from './Vector3';
import { number, object, InferType } from 'yup';

export const cameraPropsSchema = object({
    fov: number().required().default(90),
    position: vector3Schema.required().default([5,1,0]),
    rotation: vector3Schema.required().default([0,0,0])
})

export type CameraProps = InferType<typeof cameraPropsSchema>