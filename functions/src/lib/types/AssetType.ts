import { AssetLiteral } from "../../../../api/types/AssetLiteral";
import { Nexus } from "./asset_types/Nexus";
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
    public static conversionMap: Map<typeof AssetType, AssetConverterFunction>;
    public static assetLiteral: AssetLiteral;
    public static source: boolean;
    public static target: boolean;
    public static validate(assetData: object, rootPath: string) {
        throw "not implemented";
    }
    public static getConverter(targetAssetType: typeof AssetType): AssetConverterFunction | undefined {
        return AssetType.conversionMap.get(targetAssetType);
    }
}



export const assetTypes: (typeof AssetType)[] = [Potree2, Nexus]