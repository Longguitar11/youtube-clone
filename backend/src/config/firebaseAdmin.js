import admin from "firebase-admin";
import { SERVICE_ACCOUNT_KEY } from "./env.js";

const serviceAccount = JSON.parse(SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

export { db };
