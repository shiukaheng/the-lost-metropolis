import { AssetLiteral } from "../../../../../api/types/AssetLiteral";
import { AssetConverterFunction, AssetType } from "../AssetType";
import * as fs from "fs";

export class ImageAsset implements AssetType {
    static conversionMap: Map<typeof AssetType, AssetConverterFunction> = new Map();
    static assetLiteral: AssetLiteral = "Image";
    static target = true;
    static source = true;
    static validate(assetData: any, rootPath: string): void {
        // Check that rootPath is actually a directory
        if (!fs.lstatSync(rootPath).isDirectory()) {
            throw `rootPath ${rootPath} is not a directory`
        }
        // Check if there is a single file in the directory of extensions .jpg, .jpeg, .png, .webp
        const files = fs.readdirSync(rootPath);
        const extensions = ["jpg", "jpeg", "png", "webp"];
        const validFiles = files.filter(file => extensions.includes(file.split(".")[1]));
        console.log(files, validFiles)
        if (validFiles.length !== 1) {
            throw `rootPath ${rootPath} does not contain only a single image file`
        }
        // See if assetData is an object, has the property "fileName", and that the fileName matches the file in the directory
        if (assetData === null) {
            throw `assetData is null`
        }
        if (!assetData.hasOwnProperty("fileName")) {
            throw `assetData does not have a property "fileName"`
        }
        if (assetData.fileName !== validFiles[0]) {
            throw `assetData.fileName ${assetData.fileName} does not match the file in the directory ${validFiles[0]}`
        }
    }
    static getConverter(targetAssetType: typeof AssetType): AssetConverterFunction | undefined {
        return ImageAsset.conversionMap.get(targetAssetType);
    }
}