import * as admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const auth = admin.auth();
const db = admin.firestore();
const storage = admin.storage();

if (process.env.USE_FIREBASE_EMULATORS === "true") {
  process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
  process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
  process.env.FIREBASE_STORAGE_EMULATOR_HOST = "127.0.0.1:9199";
}

export { auth, db, storage, admin };
