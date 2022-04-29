import { AssetLiteral } from "../../../../../api/types/AssetLiteral";
import { AssetConverterFunction, AssetType } from "../AssetType";
import * as fs from "fs";

export class ImageAsset implements AssetType {
    static conversionMap: Map<typeof AssetType, AssetConverterFunction> = new Map();
    static assetLiteral: AssetLiteral = "Image";
    static target: true;
    static source: true;
    static validate(assetData: object, rootPath: string): void {
        // Check that rootPath is actually a directory
        if (!fs.lstatSync(rootPath).isDirectory()) {
            throw `rootPath ${rootPath} is not a directory`
        }
        // TODO: Implement the proper checks
    }
    static getConverter(targetAssetType: typeof AssetType): AssetConverterFunction | undefined {
        return ImageAsset.conversionMap.get(targetAssetType);
    }
}