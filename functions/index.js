const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp()
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Listen for new files uploaded to the default storage bucket.

// On file creation, try to get corresponding asset document from firestore using getAssetDocument function, if it returns null, throw an error
// If it returns a document, set it to a variable and use a try catch block to do the following:
// try {
    // Update document pending property to false
    // Download the file from the bucket and unzip it
    // Throw an error if the zip does not contain a metadata.json at the root
    // Try parse the metadata.json file
    // Run getProcessor function, which also validates the metadata
    // Update assetData, sourceAssetType, targetAssetType, name, from the metadata.json
    // Process the asset using processAsset function, which updates processedProgress regularly
    // Update processedProgress to 1 and processed to true
    // Upload the processed asset to the target bucket
    // Update document ready property to true
// catch (error) {
    // Set the asset document's ready property to false, and set the error property to the error message. Also throw an error.
// }

const getAsset = (assetFileName) => {
    if (assetFileName.endsWith('.zip')) {
        return admin.firestore().collection('assets').doc(assetFileName).get()
    } else {
        return null
    }
}

const sourceTypes = ["lasPointCloud", "potree2.0"]
const targetTypes = ["potree2.0"]

const getProcessor = (metadata) => {
    // Check if sourceType and targetType are valid, whether there is a mapping between them, and whether the name is valid
    // Finally run sourceType specific validation if it exists: sourceTypeValidator(metadata, rootPath)
    // Return the processor function
}



