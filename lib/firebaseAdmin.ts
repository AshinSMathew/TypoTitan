import admin from "firebase-admin"

const firebaseAdminApp = !admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      }),
    })
  : admin.app()

export const adminAuth = firebaseAdminApp.auth()
export const adminDb = firebaseAdminApp.firestore()

export const ADMIN_EMAILS = new Set([
  "typo@ajal.com",
  "typo@tiya.com",
])


