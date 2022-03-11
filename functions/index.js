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
// Delete the file if any of the following conditions are false:
// 1. The file is a zip file
// 2. The file's name excluding the extension has a corresponding document of the same name in the assets collection
// 2. The file contains a metadata.json file
// 3. The metadata.json can be parsed
// 4. The metadata json is valid (check with validateMetadata function)
// 5. All the files referenced in the metadata.json exist in the zip file