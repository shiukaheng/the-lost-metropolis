import { InferType, object, string } from "yup";
import { makeRequiredMultiLangStringSchema } from "./MultiLangString";

export const sponsorSchema = object({
    name: makeRequiredMultiLangStringSchema(), // Display name of the sponsor, used for alt text and if no image is provided
    imageAssetID: string().nullable().defined().default(null), // The asset id of the image to use for the sponsor, if not provided, the name will be used
    link: string().url().nullable().defined().default(null), // The link to the sponsor, if provided, clicking the image / name will take you to this link
    title: makeRequiredMultiLangStringSchema(), // The title of the sponsor to display on the website
    description: makeRequiredMultiLangStringSchema().defined().nullable().default(null), // The description of the sponsor, if provided, will be displayed on the website
})

export type Sponsor = InferType<typeof sponsorSchema>