"use client"

// Firebase configuration - initialization happens lazily on first use
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCIBJ8VeL_WeXEGuF9yx7GXrU80SjA9wWs",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "vitamend-org.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "vitamend-org",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "vitamend-org.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "495466597036",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:495466597036:web:785f6ef5dbbd755c256d09",
  measurementId: "G-Z9F415N5XY",
}

// Cached instances - each service initialized independently
let cachedApp: any = null
let cachedAuth: any = null
let cachedDb: any = null
let cachedStorage: any = null

async function getFirebaseApp() {
  if (typeof window === "undefined") {
    throw new Error("Firebase can only be initialized on the client side")
  }

  if (cachedApp) {
    return cachedApp
  }

  const { initializeApp, getApps, getApp } = await import("firebase/app")
  cachedApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
  return cachedApp
}

export async function getFirestoreDb() {
  if (typeof window === "undefined") {
    throw new Error("Firestore is not available on the server")
  }

  if (cachedDb) {
    return cachedDb
  }

  const app = await getFirebaseApp()
  const { getFirestore } = await import("firebase/firestore")
  cachedDb = getFirestore(app)
  return cachedDb
}

export async function getFirebaseStorage() {
  if (typeof window === "undefined") {
    throw new Error("Firebase Storage is not available on the server")
  }

  if (cachedStorage) {
    return cachedStorage
  }

  const app = await getFirebaseApp()
  const { getStorage } = await import("firebase/storage")
  cachedStorage = getStorage(app)
  return cachedStorage
}

export async function getFirebaseAuth() {
  if (typeof window === "undefined") {
    throw new Error("Firebase Auth is not available on the server")
  }

  if (cachedAuth) {
    return cachedAuth
  }

  const app = await getFirebaseApp()
  const { getAuth } = await import("firebase/auth")
  cachedAuth = getAuth(app)
  return cachedAuth
}

export async function getGoogleProvider() {
  const { GoogleAuthProvider } = await import("firebase/auth")
  return new GoogleAuthProvider()
}

// Legacy function for backward compatibility
export async function getFirebase() {
  if (typeof window === "undefined") {
    throw new Error("Firebase is not available on the server")
  }

  const [app, auth, db, storage] = await Promise.all([
    getFirebaseApp(),
    getFirebaseAuth(),
    getFirestoreDb(),
    getFirebaseStorage(),
  ])

  return { app, auth, db, storage }
}

export { firebaseConfig }
