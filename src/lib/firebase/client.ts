"use client";

import { type FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { type Auth, getAuth } from "firebase/auth";
import { type Firestore, getFirestore } from "firebase/firestore";
import { firebaseConfig, isFirebaseConfigured } from "./config";

interface FirebaseBundle {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}

let bundle: FirebaseBundle | null = null;

/** Returns a singleton Firebase bundle, or null when Firebase isn't configured. */
export function getFirebase(): FirebaseBundle | null {
  if (!isFirebaseConfigured) return null;
  if (bundle) return bundle;
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  bundle = { app, auth: getAuth(app), db: getFirestore(app) };
  return bundle;
}
