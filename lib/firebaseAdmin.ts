import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp() {
  if (getApps().length) return getApps()[0];
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "{}");
  return initializeApp({ credential: cert(sa) });
}

export function getAdminAuth() { return getAuth(getAdminApp()); }
export function getAdminDb() { return getFirestore(getAdminApp()); }
