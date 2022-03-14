import { InferType, number, object } from "yup";
import { cameraPropsSchema } from "./CameraProps";

export const sceneConfigurationSchema = object({
    defaultCameraProps: cameraPropsSchema.required(),
    potreePointBudget: number().required(),
})

export type SceneConfiguration = InferType<typeof sceneConfigurationSchema>