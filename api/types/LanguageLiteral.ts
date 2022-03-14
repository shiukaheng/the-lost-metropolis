import { mixed } from 'yup';
import { tuple } from "./utilities"

export const languageLiteral = tuple("en", "zh")
export type LanguageLiteral = typeof languageLiteral[number]
export const languageLiteralSchema = mixed<LanguageLiteral>().oneOf(languageLiteral)