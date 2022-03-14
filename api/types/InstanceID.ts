import { InferType, string } from "yup"

export const instanceIDSchema = string()
export type InstanceID = InferType<typeof instanceIDSchema>