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

// Current conclusion of why not to use cloud functions and cloud storage:

// My task: Upload a zip file to the storage bucket on a particular folder, and use a cloud function trigger to unzip the file into a folder of the same name
//          The folder may contain tens of thousand of tiny files. The cloud function will then delete the zip file from the storage bucket after it is unzipped.

// Problem: The cloud function is not directly connected to the storage bucket, and this will entail downloading the zip to the vm and then uploading tens of thousands
//          of tiny files to the storage bucket, which will be a very expensive and time consuming operation.

// Probable solution 1:
// Instead of cloud functions, use a dedicated server to host asset files; and use a CDN in front of the dedicated server for better performance.
// The disadvantage is this kinda wrecks my plan of making the website scalable and expandable to a public platform.
// Honestly, I think this is more 

// Probable solution 2:
// Go forward with the cloud functions. The only true issue is having to deal with so many files. This will be an non-issue of not dealing with Potree files, or dealing
// with a newer version of Potree. So either: Not use Potree at all, or host Potree files on a separate server (hacky), or write a custom library that takes advantage of
// the new Potree format.
