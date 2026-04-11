/**
 * Firestore connection + LegalTech data helpers.
 *
 * 1) Install:
 *    npm i firebase
 *
 * 2) Create .env.local with:
 *    NEXT_PUBLIC_FIREBASE_API_KEY=...
 *    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
 *    NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
 *    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
 *    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
 *    NEXT_PUBLIC_FIREBASE_APP_ID=...
 *
 * 3) Import helper functions where needed.
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const COLLECTIONS = {
  users: "users",
  contractAnalyses: "contractAnalyses",
  advocates: "advocates",
  reservations: "reservations",
  chatHistory: "chatHistory"
};

export async function createUser({ uid, name, email, role }) {
  if (!uid || !name || !email || !role) {
    throw new Error("Missing required user fields.");
  }

  if (!["client", "advocate"].includes(role)) {
    throw new Error("Invalid role. Use 'client' or 'advocate'.");
  }

  const payload = {
    uid,
    name,
    email: String(email).toLowerCase(),
    role,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(doc(db, COLLECTIONS.users, uid), payload, { merge: true });
  return payload;
}

export async function createContractAnalysis({
  id,
  userId,
  contractText,
  riskLevel,
  risks
}) {
  if (!userId || !contractText || !riskLevel || !Array.isArray(risks)) {
    throw new Error("Missing required contract analysis fields.");
  }

  if (!["Low", "Medium", "High"].includes(riskLevel)) {
    throw new Error("Invalid riskLevel. Use Low, Medium, or High.");
  }

  const cleanRisks = risks.map((r) => ({
    clause: String(r?.clause || "").trim(),
    reason: String(r?.reason || "").trim()
  }));

  const ref = id
    ? doc(db, COLLECTIONS.contractAnalyses, id)
    : doc(collection(db, COLLECTIONS.contractAnalyses));

  const payload = {
    id: ref.id,
    userId,
    contractText,
    riskLevel,
    risks: cleanRisks,
    date: serverTimestamp(),
    createdAt: serverTimestamp()
  };

  await setDoc(ref, payload);
  return payload;
}

export async function createAdvocate({
  id,
  name,
  specialty,
  rate,
  experience,
  location
}) {
  if (!name || !specialty || rate == null || experience == null || !location) {
    throw new Error("Missing required advocate fields.");
  }

  const ref = id
    ? doc(db, COLLECTIONS.advocates, id)
    : doc(collection(db, COLLECTIONS.advocates));

  const payload = {
    id: ref.id,
    name,
    specialty,
    rate: Number(rate),
    experience: Number(experience),
    location,
    isActive: true
  };

  await setDoc(ref, payload);
  return payload;
}

export async function createReservation({
  id,
  clientId,
  advocateId,
  status = "pending",
  timestamp
}) {
  if (!clientId || !advocateId) {
    throw new Error("Missing required reservation fields.");
  }

  const allowedStatus = ["pending", "accepted", "rejected", "cancelled", "completed"];
  if (!allowedStatus.includes(status)) {
    throw new Error("Invalid reservation status.");
  }

  const ref = id
    ? doc(db, COLLECTIONS.reservations, id)
    : doc(collection(db, COLLECTIONS.reservations));

  const payload = {
    id: ref.id,
    clientId,
    advocateId,
    status,
    timestamp: timestamp || serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(ref, payload);
  return payload;
}

export async function createChatHistory({
  id,
  participants,
  messages = [],
  reservationId
}) {
  if (!Array.isArray(participants) || participants.length !== 2) {
    throw new Error("participants must be an array with exactly 2 user IDs.");
  }

  const sorted = [...participants].sort();
  const participantPairKey = `${sorted[0]}_${sorted[1]}`;

  const safeMessages = messages.map((m) => ({
    senderId: m.senderId,
    text: m.text,
    timestamp: m.timestamp || new Date().toISOString(),
    readBy: Array.isArray(m.readBy) ? m.readBy : []
  }));

  const ref = id
    ? doc(db, COLLECTIONS.chatHistory, id)
    : doc(collection(db, COLLECTIONS.chatHistory));

  const payload = {
    id: ref.id,
    participants,
    participantPairKey,
    messages: safeMessages,
    reservationId: reservationId || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(ref, payload);
  return payload;
}

/**
 * Optional demo seed.
 * Run only after setting env vars in a real Firebase project.
 */
export async function seedDemoData() {
  await createUser({
    uid: "u_demo_client_001",
    name: "Demo Client",
    email: "client@example.com",
    role: "client"
  });

  await createUser({
    uid: "u_demo_advocate_001",
    name: "Demo Advocate",
    email: "advocate@example.com",
    role: "advocate"
  });

  await createAdvocate({
    id: "adv_demo_001",
    name: "Nadia El Fassi",
    specialty: "Contract Law",
    rate: 650,
    experience: 7,
    location: "Rabat"
  });

  await createContractAnalysis({
    userId: "u_demo_client_001",
    contractText: "Sample contract text for risk analysis goes here.",
    riskLevel: "Medium",
    risks: [
      { clause: "Auto-renewal", reason: "Renewal terms are unclear." },
      { clause: "Penalty", reason: "Disproportionate penalty wording." }
    ]
  });

  await createReservation({
    clientId: "u_demo_client_001",
    advocateId: "adv_demo_001",
    status: "pending"
  });

  await createChatHistory({
    participants: ["u_demo_client_001", "u_demo_advocate_001"],
    messages: [
      {
        senderId: "u_demo_client_001",
        text: "Hello, can you review my contract?"
      },
      {
        senderId: "u_demo_advocate_001",
        text: "Yes, please send the clauses you are worried about."
      }
    ]
  });
}

