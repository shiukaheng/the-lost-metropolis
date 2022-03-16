import { AssetLiteral } from "../../../../api/types/AssetLiteral";
import { Potree2 } from "./asset_types/Potree2";

export type AssetConverterFunction = (
    assetData: object, 
    sourceRootPath: string, 
    targetRootPath: string, 
    progressCallback?:(progress: number)=>void
    ) => Promise<void>;

export abstract class AssetType {
    /**
     * Map of sources to convert from
     */
    static conversionMap: Map<typeof AssetType, AssetConverterFunction>;
    static assetLiteral: AssetLiteral;
    static source: boolean;
    static target: boolean;
    static validate(assetData: object, rootPath: string) {
        throw "not implemented";
    }
    static getConverter(targetAssetType: typeof AssetType): AssetConverterFunction | undefined {
        return AssetType.conversionMap.get(targetAssetType);
    }
}

export const assetTypes: (typeof AssetType)[] = [Potree2]