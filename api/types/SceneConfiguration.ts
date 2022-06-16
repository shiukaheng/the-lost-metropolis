import { InferType, number, object } from "yup";
import { cameraPropsSchema } from "./CameraProps";

export const sceneConfigurationSchema = object({
    defaultCameraProps: cameraPropsSchema.required(),
    potreePointBudget: number().required().default(1000000),
    defaultXRCameraProps: cameraPropsSchema.required(),
    flySpeed: number().required().default(2),
})

export type SceneConfiguration = InferType<typeof sceneConfigurationSchema>