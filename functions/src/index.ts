import * as admin from "firebase-admin"
import * as functions from "firebase-functions";
import { checkConversion, getAssetClasses, getBuckets, initHandleNewFile, parseMetadataFile, processAsset, unzipFile, updateAssetDocument } from './helpers';

admin.initializeApp()

export const handleNewFile = functions.region("asia-east1").storage.object().onFinalize(async (object) => {

})



