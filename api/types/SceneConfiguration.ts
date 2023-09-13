import { InferType, array, number, object, string } from "yup";
import { cameraPropsSchema } from "./CameraProps";

export const sceneConfigurationSchema = object({
    defaultCameraProps: cameraPropsSchema.required(),
    potreePointBudget: number().required().default(1000000),
    defaultXRCameraProps: cameraPropsSchema.required(),
    flySpeed: number().required().default(2),
    scenes: array().of(string().required()).required().default([]),
})

export type SceneConfiguration = InferType<typeof sceneConfigurationSchema>