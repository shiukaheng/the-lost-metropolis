import { InferType, object, string } from "yup";
import { colorSchema } from "./Color";

export const themeSchema = object({
    foregroundColor: colorSchema.default([1, 1, 1]),
    backgroundColor: colorSchema.default([0, 0, 0]),
    video: string().url().nullable(),
    image: string().url().nullable(),
})

export type Theme = InferType<typeof themeSchema>;