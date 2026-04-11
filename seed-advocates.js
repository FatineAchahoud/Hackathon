/**
 * Seed script for Firestore collection: advocates
 *
 * Usage:
 * 1) Install deps: npm install
 * 2) Set credentials (one option):
 *    - GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccountKey.json
 *    OR
 *    - place serviceAccountKey.json in project root
 * 3) Run: npm run seed:advocates
 */

const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

function initializeFirebaseAdmin() {
  if (admin.apps.length) return admin.app();

  const keyPath = path.join(process.cwd(), "serviceAccountKey.json");
  if (fs.existsSync(keyPath)) {
    const serviceAccount = require(keyPath);
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  return admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

const advocates = [
  {
    name: "Mehdi El Idrissi",
    specialty: "Commercial Law",
    hourlyRateMAD: 900,
    yearsOfExperience: 12,
    location: "Casablanca"
  },
  {
    name: "Salma Benjelloun",
    specialty: "Family Law",
    hourlyRateMAD: 700,
    yearsOfExperience: 8,
    location: "Rabat"
  },
  {
    name: "Youssef Alaoui",
    specialty: "Labor Law",
    hourlyRateMAD: 650,
    yearsOfExperience: 7,
    location: "Marrakech"
  },
  {
    name: "Nadia El Fassi",
    specialty: "Corporate Law",
    hourlyRateMAD: 1000,
    yearsOfExperience: 14,
    location: "Casablanca"
  },
  {
    name: "Hicham Amrani",
    specialty: "Real Estate Law",
    hourlyRateMAD: 800,
    yearsOfExperience: 10,
    location: "Rabat"
  },
  {
    name: "Meryem Tazi",
    specialty: "Family Law",
    hourlyRateMAD: 680,
    yearsOfExperience: 6,
    location: "Marrakech"
  },
  {
    name: "Omar Bennis",
    specialty: "Commercial Law",
    hourlyRateMAD: 850,
    yearsOfExperience: 11,
    location: "Casablanca"
  },
  {
    name: "Khadija Lamrani",
    specialty: "Intellectual Property Law",
    hourlyRateMAD: 950,
    yearsOfExperience: 13,
    location: "Rabat"
  },
  {
    name: "Adil Chraibi",
    specialty: "Tax Law",
    hourlyRateMAD: 920,
    yearsOfExperience: 9,
    location: "Marrakech"
  },
  {
    name: "Imane Saidi",
    specialty: "Civil Litigation",
    hourlyRateMAD: 780,
    yearsOfExperience: 8,
    location: "Casablanca"
  }
];

async function seedAdvocates() {
  initializeFirebaseAdmin();
  const db = admin.firestore();
  const collectionRef = db.collection("advocates");

  const batch = db.batch();
  advocates.forEach((advocate) => {
    const docRef = collectionRef.doc();
    batch.set(docRef, {
      ...advocate,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });

  await batch.commit();
  console.log(`Seed completed: ${advocates.length} advocate profiles added.`);
}

seedAdvocates()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exit(1);
  });

