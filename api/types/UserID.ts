import { InferType, string } from "yup"

export const userIDSchema = string()
export type UserID = InferType<typeof userIDSchema>