import { mapValues } from "lodash";
import { lazy, number, string } from "yup";
import { object } from "yup";
import { CameraProps, cameraPropsSchema } from "./CameraProps";

export const projectorViewsSchema = lazy(obj => object(
    mapValues(obj, () => cameraPropsSchema.required())
).required().default({}))

export type ProjectorViews = {
    [key: string]: CameraProps
}