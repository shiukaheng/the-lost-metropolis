import { lazy, object, string, SchemaOf } from 'yup';
import { LanguageLiteral, languageLiteral } from './LanguageLiteral';

function getMultiLangStringSchema() {
    // schemaShape will have keys that are the language literals, and values that are the schema for the string
    const schemaShape: { [key: string]: SchemaOf<string> } = {};
    languageLiteral.forEach(x => {
        schemaShape[x] = string().required()
    })
    return object(schemaShape) as SchemaOf<MultiLangString>
}

export type MultiLangString = {
    [key in LanguageLiteral]: string
}

/**
 * Not linked directly to MultiLangString. But should be fine as its all based on the array of language literals.
 */
export const multiLangStringSchema = lazy(getMultiLangStringSchema) 

/**
 * Kinda forced.. but ok!
 */
export const makeRequiredMultiLangStringSchema = (defaultValue: MultiLangString = {"en": "", "zh": ""}) => lazy(()=>{
    const schemaShape: { [key: string]: SchemaOf<string> } = {};
    languageLiteral.forEach(x => {
        schemaShape[x] = string().required()
    })
    return object(schemaShape).default(defaultValue) as SchemaOf<MultiLangString>
})