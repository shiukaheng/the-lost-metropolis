import { InferType, number, object } from "yup";
import { cameraPropsSchema } from "./CameraProps";

export const sceneConfigurationSchema = object({
    defaultCameraProps: cameraPropsSchema.required(),
    potreePointBudget: number().required().default(1000000),
    defaultXRCameraProps: cameraPropsSchema.required(),
})

export type SceneConfiguration = InferType<typeof sceneConfigurationSchema>