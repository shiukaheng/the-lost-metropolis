import * as admin from "firebase-admin"
import * as functions from "firebase-functions";
import { onNewFile, onPostDocumentDelete } from "./lib/functions";

admin.initializeApp()

export const handleNewFile = functions.region("asia-east1").storage.object().onFinalize(onNewFile)
export const handlePostDocumentDelete = functions.region("asia-east1").firestore.document("posts/{postID}").onDelete(onPostDocumentDelete)



