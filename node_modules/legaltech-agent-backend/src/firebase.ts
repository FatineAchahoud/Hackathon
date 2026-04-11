import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { ContractAnalysis } from "./types";

function getEnv(name: string): string {
  return process.env[name]?.trim() ?? "";
}

function getFirebaseConfig() {
  const projectId = getEnv("FIREBASE_PROJECT_ID");
  const clientEmail = getEnv("FIREBASE_CLIENT_EMAIL");
  const privateKey = getEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n");
  return { projectId, clientEmail, privateKey };
}

export function canUseFirestore(): boolean {
  const cfg = getFirebaseConfig();
  return Boolean(cfg.projectId && cfg.clientEmail && cfg.privateKey);
}

export function initFirestoreIfConfigured(): void {
  if (!canUseFirestore() || getApps().length > 0) {
    return;
  }

  const { projectId, clientEmail, privateKey } = getFirebaseConfig();
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey
    })
  });
}

export async function saveContractAnalysis(params: {
  userId?: string;
  contractText: string;
  contractTypeHint?: string;
  analysis: ContractAnalysis;
}) {
  if (!canUseFirestore()) {
    return null;
  }

  initFirestoreIfConfigured();
  const db = getFirestore();
  const doc = await db.collection("contractAnalyses").add({
    userId: params.userId ?? null,
    contractText: params.contractText,
    contractTypeHint: params.contractTypeHint ?? null,
    analysis: params.analysis,
    createdAt: new Date().toISOString()
  });

  return doc.id;
}
