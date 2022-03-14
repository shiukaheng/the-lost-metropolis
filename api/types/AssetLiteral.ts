import { mixed } from 'yup';
import { tuple } from './utilities';

// Declare all asset literals here

export const sourceAssetLiteral = tuple("Potree2", "Audio", "DepthKitVideo", "Image")
export type SourceAssetLiteral = typeof sourceAssetLiteral[number]
export const sourceAssetLiteralSchema = mixed<SourceAssetLiteral>().oneOf(sourceAssetLiteral)

export const targetAssetLiteral = tuple("Potree2", "Audio", "DepthKitVideo", "Image")
export type TargetAssetLiteral = typeof targetAssetLiteral[number]
export const targetAssetLiteralSchema = mixed<TargetAssetLiteral>().oneOf(targetAssetLiteral)

export type AssetLiteral = SourceAssetLiteral | TargetAssetLiteral