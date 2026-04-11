/**
 * Seed script for Firestore collection: legalResources
 * Usage: node data/seed-legal-resources.js
 * Requires: serviceAccountKey.json in project root
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

const legalResources = [
  {
    title: "Code des Obligations et Contrats (DOC)",
    category: "Contract Law",
    description: "Loi fondamentale régissant tous les contrats au Maroc — obligations, nullité, responsabilité civile.",
    url: "https://adala.justice.gov.ma/production/html/Fr/liens/190.htm",
    source: "Ministère de la Justice",
    language: "fr",
    relevantRisks: ["unlimited liability", "auto-renewal", "penalty clause", "unilateral termination"]
  },
  {
    title: "Code du Travail Marocain (Loi 65-99)",
    category: "Labor Law",
    description: "Réglemente les contrats de travail, licenciement, congés, heures supplémentaires et droits des salariés.",
    url: "https://www.emploi.gov.ma/index.php/fr/documentation/textes-legislatifs-et-reglementaires/code-du-travail.html",
    source: "Ministère de l'Inclusion Économique et de l'Emploi",
    language: "fr",
    relevantRisks: ["wrongful termination", "non-compete clause", "overtime", "employee rights"]
  },
  {
    title: "Loi sur les Sociétés Anonymes (Loi 17-95)",
    category: "Corporate Law",
    description: "Encadre la création, gouvernance et dissolution des sociétés anonymes au Maroc.",
    url: "https://adala.justice.gov.ma/production/html/Fr/liens/96.htm",
    source: "Ministère de la Justice",
    language: "fr",
    relevantRisks: ["shareholder rights", "board liability", "dissolution clause", "capital obligations"]
  },
  {
    title: "Code de Commerce Marocain",
    category: "Commercial Law",
    description: "Régit les actes de commerce, commerçants, fonds de commerce et contrats commerciaux.",
    url: "https://adala.justice.gov.ma/production/html/Fr/liens/91.htm",
    source: "Ministère de la Justice",
    language: "fr",
    relevantRisks: ["commercial dispute", "payment terms", "late penalty", "trade obligations"]
  },
  {
    title: "Loi sur la Protection du Consommateur (Loi 31-08)",
    category: "Consumer Protection",
    description: "Protège les consommateurs contre les clauses abusives, publicité trompeuse et pratiques déloyales.",
    url: "https://www.mcinet.gov.ma/fr/content/loi-n%C2%B031-08-%C3%A9dictant-des-mesures-de-protection-du-consommateur",
    source: "Ministère du Commerce et de l'Industrie",
    language: "fr",
    relevantRisks: ["abusive clause", "unfair terms", "consumer rights", "hidden fees"]
  },
  {
    title: "Loi sur la Location Immobilière (Loi 67-12)",
    category: "Real Estate Law",
    description: "Régit les rapports entre bailleurs et locataires pour les locaux à usage d'habitation.",
    url: "https://www.mhu.gov.ma/fr/documents/lois-et-reglements",
    source: "Ministère de l'Habitat et de la Politique de la Ville",
    language: "fr",
    relevantRisks: ["rent increase", "eviction", "deposit clause", "maintenance obligations", "lease termination"]
  },
  {
    title: "Loi sur la Protection des Données Personnelles (Loi 09-08)",
    category: "Data Privacy",
    description: "Encadre la collecte, traitement et transfert des données personnelles au Maroc. Géré par la CNDP.",
    url: "https://www.cndp.ma/fr/cadre-juridique/textes-fondamentaux.html",
    source: "Commission Nationale de contrôle de la protection des Données à caractère Personnel (CNDP)",
    language: "fr",
    relevantRisks: ["data sharing", "personal data", "privacy clause", "GDPR equivalent", "data retention"]
  },
  {
    title: "Loi sur la Propriété Intellectuelle (Loi 17-97)",
    category: "Intellectual Property",
    description: "Protège les marques, brevets, droits d'auteur et dessins industriels au Maroc.",
    url: "https://www.ompic.ma/fr/content/loi-n%C2%B017-97-relative-%C3%A0-la-protection-de-la-propri%C3%A9t%C3%A9-industrielle",
    source: "Office Marocain de la Propriété Industrielle et Commerciale (OMPIC)",
    language: "fr",
    relevantRisks: ["IP ownership", "copyright clause", "trademark", "trade secret", "work for hire"]
  },
  {
    title: "Procédures de Recouvrement de Créances",
    category: "Debt Recovery",
    description: "Guide officiel des procédures judiciaires pour le recouvrement de créances impayées au Maroc.",
    url: "https://adala.justice.gov.ma",
    source: "Ministère de la Justice",
    language: "fr",
    relevantRisks: ["payment default", "debt clause", "collection rights", "enforcement"]
  },
  {
    title: "Loi sur l'Arbitrage et la Médiation (Loi 08-05)",
    category: "Dispute Resolution",
    description: "Encadre le recours à l'arbitrage et à la médiation comme alternatives aux tribunaux.",
    url: "https://adala.justice.gov.ma/production/html/Fr/liens/141.htm",
    source: "Ministère de la Justice",
    language: "fr",
    relevantRisks: ["arbitration clause", "jurisdiction", "dispute resolution", "governing law"]
  },
  {
    title: "Loi sur les Marchés Publics (Décret 2-12-349)",
    category: "Public Procurement",
    description: "Réglemente les contrats passés par l'État et les collectivités publiques marocaines.",
    url: "https://www.marchespublics.gov.ma/pmmp/content/textes-legislatifs",
    source: "Trésorerie Générale du Royaume",
    language: "fr",
    relevantRisks: ["public tender", "government contract", "penalty for delay", "bid clause"]
  },
  {
    title: "Code Général des Impôts (CGI)",
    category: "Tax Law",
    description: "Référence fiscale complète — TVA, IS, IR et obligations déclaratives des entreprises au Maroc.",
    url: "https://www.tax.gov.ma/wps/portal/DGI/Accueil/Documentation/TextesLegislatifs",
    source: "Direction Générale des Impôts",
    language: "fr",
    relevantRisks: ["tax clause", "VAT obligation", "fiscal liability", "tax indemnity"]
  }
];

async function seedLegalResources() {
  initializeFirebaseAdmin();
  const db = admin.firestore();
  const collectionRef = db.collection("legalResources");

  const batch = db.batch();
  legalResources.forEach((resource, index) => {
    const docId = `res_${String(index + 1).padStart(2, "0")}`;
    const docRef = collectionRef.doc(docId);
    batch.set(docRef, {
      ...resource,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });

  await batch.commit();
  console.log(`✅ Seed completed: ${legalResources.length} legal resources added to Firestore.`);
  console.log(`\n📚 Categories seeded:`);
  [...new Set(legalResources.map(r => r.category))].forEach(cat => {
    console.log(`   • ${cat}`);
  });
}

seedLegalResources()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  });