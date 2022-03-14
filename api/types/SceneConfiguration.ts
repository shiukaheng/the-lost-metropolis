import { cameraPropsSchema } from './../types';
import { InferType, number, object } from "yup";

export const sceneConfigurationSchema = object({
    defaultCameraProps: cameraPropsSchema.required(),
    potreePointBudget: number().required(),
})

export type SceneConfiguration = InferType<typeof sceneConfigurationSchema>