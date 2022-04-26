import { AssetLiteral } from "../../../../../api/types/AssetLiteral";
import { AssetConverterFunction, AssetType } from "../AssetType";
import * as fs from "fs";

export class Nexus implements AssetType {
    static conversionMap: Map<typeof AssetType, AssetConverterFunction> = new Map();
    static assetLiteral: AssetLiteral = "Nexus";
    static target: true;
    static source: true;
    static validate(assetData: object, rootPath: string): void {
        // Check that rootPath is actually a directory
        if (!fs.lstatSync(rootPath).isDirectory()) {
            throw `rootPath ${rootPath} is not a directory`
        }
        // Check that in the rootPath, there is "mesh.nxz", nothing else
        const files = fs.readdirSync(rootPath);
        console.log("readDirSync results:", files);
        if (!files.includes("mesh.nxz")) {
            throw `mesh.nxz not found in ${rootPath}`
        }
    }
    static getConverter(targetAssetType: typeof AssetType): AssetConverterFunction | undefined {
        return Nexus.conversionMap.get(targetAssetType);
    }
}