import { AssetConverterFunction, AssetType } from "../AssetType";
import * as fs from "fs";
import { AssetLiteral } from "../../../../../api/types/AssetLiteral";

export class Potree2 implements AssetType {
    static conversionMap: Map<typeof AssetType, AssetConverterFunction> = new Map();
    static assetLiteral: AssetLiteral = "Potree2";
    static target: true;
    static source: true;
    static validate(assetData: object, rootPath: string): void {
        // Check that rootPath is actually a directory
        if (!fs.lstatSync(rootPath).isDirectory()) {
            throw `rootPath ${rootPath} is not a directory`
        }
        // Check that in the rootPath, there is "hierachy.bin", "metadata.json", and "octree.bin", nothing else
        const files = fs.readdirSync(rootPath);
        if (!files.includes("hierarchy.bin") || !files.includes("metadata.json") || !files.includes("octree.bin")) {
            throw `rootPath ${rootPath} does not contain "hierarchy.bin", "metadata.json", and "octree.bin"`
        }
    }
    static getConverter(targetAssetType: typeof AssetType): AssetConverterFunction | undefined {
        return Potree2.conversionMap.get(targetAssetType);
    }
}