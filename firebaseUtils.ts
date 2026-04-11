import { initializeApp, getApp, getApps } from "firebase/app";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  Timestamp,
  type DocumentData
} from "firebase/firestore";

type RiskLevel = "Low" | "Medium" | "High";
type ReservationStatus = "pending" | "accepted" | "rejected" | "cancelled" | "completed";

export interface AdvocateProfile {
  id?: string;
  name: string;
  specialty: string;
  hourlyRateMAD: number;
  yearsOfExperience: number;
  location: "Casablanca" | "Marrakech" | "Rabat" | string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface RiskItem {
  clause: string;
  reason: string;
}

export interface ContractAnalysisInput {
  contractText: string;
  riskLevel: RiskLevel;
  risks: RiskItem[];
  date?: Timestamp;
}

export interface ContractAnalysis extends ContractAnalysisInput {
  id: string;
  userId: string;
  date: Timestamp;
  createdAt?: Timestamp;
}

export interface ReservationInput {
  clientId: string;
  advocateId: string;
  status?: ReservationStatus;
  timestamp?: Timestamp;
  note?: string;
}

export interface Reservation extends ReservationInput {
  id: string;
  status: ReservationStatus;
  timestamp: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface UserHistory {
  analyses: ContractAnalysis[];
  reservations: Reservation[];
}

export type AppUser = {
  uid: string;
  name: string;
  email: string;
  role: "client" | "advocate";
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

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

const COLLECTIONS = {
  advocates: "advocates",
  contractAnalyses: "contractAnalyses",
  reservations: "reservations",
  users: "users"
} as const;

function withId<T extends DocumentData>(id: string, data: T): T & { id: string } {
  return { id, ...data };
}

export async function getAdvocates(): Promise<AdvocateProfile[]> {
  const advocatesRef = collection(db, COLLECTIONS.advocates);
  const snapshot = await getDocs(advocatesRef);
  return snapshot.docs.map((d) => withId(d.id, d.data() as AdvocateProfile));
}

export async function saveContractAnalysis(
  userId: string,
  analysisData: ContractAnalysisInput
): Promise<string> {
  if (!userId) throw new Error("userId is required");
  if (!analysisData.contractText) throw new Error("contractText is required");
  if (!["Low", "Medium", "High"].includes(analysisData.riskLevel)) {
    throw new Error("riskLevel must be one of: Low, Medium, High");
  }

  const analysesRef = collection(db, COLLECTIONS.contractAnalyses);
  const payload = {
    userId,
    contractText: analysisData.contractText,
    riskLevel: analysisData.riskLevel,
    risks: analysisData.risks ?? [],
    date: analysisData.date ?? serverTimestamp(),
    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(analysesRef, payload);
  return docRef.id;
}

export async function createReservation(reservationData: ReservationInput): Promise<string> {
  if (!reservationData.clientId) throw new Error("clientId is required");
  if (!reservationData.advocateId) throw new Error("advocateId is required");

  const status = reservationData.status ?? "pending";
  const allowedStatus: ReservationStatus[] = [
    "pending",
    "accepted",
    "rejected",
    "cancelled",
    "completed"
  ];

  if (!allowedStatus.includes(status)) {
    throw new Error(`status must be one of: ${allowedStatus.join(", ")}`);
  }

  const reservationsRef = collection(db, COLLECTIONS.reservations);
  const payload = {
    clientId: reservationData.clientId,
    advocateId: reservationData.advocateId,
    status,
    note: reservationData.note ?? null,
    timestamp: reservationData.timestamp ?? serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const docRef = await addDoc(reservationsRef, payload);
  return docRef.id;
}

export async function getUserHistory(userId: string): Promise<UserHistory> {
  if (!userId) throw new Error("userId is required");

  const analysesQ = query(
    collection(db, COLLECTIONS.contractAnalyses),
    where("userId", "==", userId),
    orderBy("date", "desc")
  );

  const reservationsAsClientQ = query(
    collection(db, COLLECTIONS.reservations),
    where("clientId", "==", userId),
    orderBy("timestamp", "desc")
  );

  const reservationsAsAdvocateQ = query(
    collection(db, COLLECTIONS.reservations),
    where("advocateId", "==", userId),
    orderBy("timestamp", "desc")
  );

  const [analysesSnap, clientResSnap, advocateResSnap] = await Promise.all([
    getDocs(analysesQ),
    getDocs(reservationsAsClientQ),
    getDocs(reservationsAsAdvocateQ)
  ]);

  const analyses = analysesSnap.docs.map((d) =>
    withId(d.id, d.data() as ContractAnalysis)
  );

  const reservationMap = new Map<string, Reservation>();
  [...clientResSnap.docs, ...advocateResSnap.docs].forEach((d) => {
    reservationMap.set(d.id, withId(d.id, d.data() as Reservation));
  });

  const reservations = Array.from(reservationMap.values()).sort((a, b) => {
    const aMs = a.timestamp?.toMillis?.() ?? 0;
    const bMs = b.timestamp?.toMillis?.() ?? 0;
    return bMs - aMs;
  });

  return { analyses, reservations };
}

export async function saveUser(
  uid: string,
  data: { name: string; email: string; role: "client" | "advocate" }
): Promise<void> {
  if (!uid) throw new Error("uid is required");
  if (!data?.name) throw new Error("name is required");
  if (!data?.email) throw new Error("email is required");
  if (!data?.role) throw new Error("role is required");
  if (!["client", "advocate"].includes(data.role)) {
    throw new Error('role must be "client" or "advocate"');
  }

  const userRef = doc(db, COLLECTIONS.users, uid);
  await setDoc(
    userRef,
    {
      uid,
      name: data.name,
      email: data.email,
      role: data.role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

export async function getUser(uid: string): Promise<AppUser | null> {
  if (!uid) throw new Error("uid is required");

  const userRef = doc(db, COLLECTIONS.users, uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) return null;
  return snapshot.data() as AppUser;
}
