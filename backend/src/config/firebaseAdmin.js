import admin from "firebase-admin";
import { AUTH_URI, CLIENT_EMAIL, CLIENT_ID, PRIVATE_KEY, PRIVATE_KEY_ID, PROJECT_ID, TOKEN_URI } from "./env.js";

const serviceAccount = {
  type: "service_account",
  project_id: PROJECT_ID,
  private_key_id: PRIVATE_KEY_ID,
  private_key: PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: CLIENT_EMAIL,
  client_id: CLIENT_ID,
  auth_uri: AUTH_URI,
  token_uri: TOKEN_URI,
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40clone-fce3e.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

export { db };
