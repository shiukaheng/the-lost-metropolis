import { InferType, number, object, string } from "yup";
import { colorSchema } from "./Color";

// export const themeSchema = object({
//     foregroundColor: colorSchema.default([255, 255, 255]),
//     backgroundColor: colorSchema.default([0, 0, 0]),
//     video: string().url().nullable().default(null),
//     image: string().url().nullable().default(null),
// })

// export type Theme = InferType<typeof themeSchema>;

// export type Theme = {
//     backgroundColor: [number, number, number],
//     foregroundColor: [number, number, number],
//     backgroundVideo: string | null,
//     backgroundImage: string | null,
//     backgroundOpacity: number,
//     transitionDuration: number
// }

export const themeSchema = object({
    backgroundColor: colorSchema.nullable().default(null),
    foregroundColor: colorSchema.nullable().default(null),
    backgroundVideo: string().url().nullable().default(null),
    backgroundImage: string().url().nullable().default(null),
    backgroundOpacity: number().nullable().default(null),
    transitionDuration: number().nullable().default(null),
})

export type Theme = InferType<typeof themeSchema>