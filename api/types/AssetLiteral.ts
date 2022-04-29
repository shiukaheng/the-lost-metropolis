import { mixed } from 'yup';
import { nullable_tuple } from './utilities';

// Declare all asset literals here

export const sourceAssetLiteral = nullable_tuple("Potree2", "Image", "Nexus")
export type SourceAssetLiteral = typeof sourceAssetLiteral[number]
export const sourceAssetLiteralSchema = mixed<SourceAssetLiteral>().oneOf(sourceAssetLiteral).default(null)

export const targetAssetLiteral = nullable_tuple("Potree2", "Image", "Nexus")
export type TargetAssetLiteral = typeof targetAssetLiteral[number]
export const targetAssetLiteralSchema = mixed<TargetAssetLiteral>().oneOf(targetAssetLiteral).default(null)

export type AssetLiteral = SourceAssetLiteral | TargetAssetLiteral