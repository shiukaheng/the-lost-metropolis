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
        console.log("readDirSync results:", files);
        if (!files.includes("hierarchy.bin")) {
            throw `hierarchy.bin not found in ${rootPath}`
        }
        if (!files.includes("metadata.json")) {
            throw `metadata.json not found in ${rootPath}`
        }
        if (!files.includes("octree.bin")) {
            throw `octree.bin not found in ${rootPath}`
        }
        if (files.length !== 3) {
            throw `${rootPath} has wrong number of files`
        }
    }
    static getConverter(targetAssetType: typeof AssetType): AssetConverterFunction | undefined {
        return Potree2.conversionMap.get(targetAssetType);
    }
}