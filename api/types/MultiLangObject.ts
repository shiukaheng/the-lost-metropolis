import { mapValues } from "lodash";
import { lazy, object } from "yup";
import { makeRequiredMultiLangStringSchema, MultiLangString } from "./MultiLangString";

const multiLangObjectSchema = lazy(obj => object(
    mapValues(obj, () => makeRequiredMultiLangStringSchema())
))

export type MultiLangObject = {
    [key: string]: MultiLangString
}