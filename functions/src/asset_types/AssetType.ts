export type AssetConverterFunction = (
    sourceMetadata: object, 
    sourceRootPath: string, 
    targetRootPath: string, 
    progressCallback?:(progress: number)=>void
    ) => Promise<void>;
export abstract class AssetType {
    static conversionMap: Map<AssetType, AssetConverterFunction>;
    static assetTypeName: string;
    static validate(assetData: object, rootPath: string) {
        throw "not implemented";
    }
    static getConverter(targetAssetType: typeof AssetType): AssetConverterFunction | undefined {
        return AssetType.conversionMap.get(targetAssetType);
    }
}