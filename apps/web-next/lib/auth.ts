import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";

function requireAuth() {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized. Check NEXT_PUBLIC_FIREBASE_* env vars.");
  }
  return auth;
}

export async function register(email: string, password: string) {
  return await createUserWithEmailAndPassword(requireAuth(), email, password);
}

export async function login(email: string, password: string) {
  return await signInWithEmailAndPassword(requireAuth(), email, password);
}

export async function logout() {
  return await signOut(requireAuth());
}

export function getCurrentUser() {
  return auth?.currentUser ?? null;
}
