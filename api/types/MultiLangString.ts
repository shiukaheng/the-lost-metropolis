import { lazy, object, string, SchemaOf, AnySchema } from 'yup';
import Lazy from 'yup/lib/Lazy';
import { OptionalObjectSchema, TypeOfShape } from 'yup/lib/object';
import { AnyObject } from 'yup/lib/types';
import { LanguageLiteral, languageLiteral } from './LanguageLiteral';

function getMultiLangStringSchema() {
    const schemaShape = {};
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
    const schemaShape = {};
    languageLiteral.forEach(x => {
        schemaShape[x] = string().required()
    })
    return object(schemaShape).default(defaultValue) as SchemaOf<MultiLangString>
})