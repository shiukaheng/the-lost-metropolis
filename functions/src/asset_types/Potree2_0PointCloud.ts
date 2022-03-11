import { AssetConverterFunction, AssetType } from "./AssetType";
// Import path, os, fs
import * as path from "path";
import * as os from "os";
import * as fs from "fs";

export class Potree2_0PointCloud extends AssetType {
    static conversionMap = new Map()
    static assetTypeName = "Potree2_0PointCloud";
    static validate(assetData, rootPath) {
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
}