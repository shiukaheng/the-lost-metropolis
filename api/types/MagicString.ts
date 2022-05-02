import { mixed } from "yup";
import { MultiLangString, multiLangStringSchema } from "./MultiLangString";

export type MagicString = string | MultiLangString;
export const magicStringSchema = mixed().test(
    "is-magic-string",
    "Must be a string or a MultiLangString",
    (value: MagicString) => typeof value === "string" || multiLangStringSchema.isValidSync(value))
    .default("")