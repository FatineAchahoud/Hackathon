"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canUseFirestore = canUseFirestore;
exports.initFirestoreIfConfigured = initFirestoreIfConfigured;
exports.saveContractAnalysis = saveContractAnalysis;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
function getEnv(name) {
    return process.env[name]?.trim() ?? "";
}
function getFirebaseConfig() {
    const projectId = getEnv("FIREBASE_PROJECT_ID");
    const clientEmail = getEnv("FIREBASE_CLIENT_EMAIL");
    const privateKey = getEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n");
    return { projectId, clientEmail, privateKey };
}
function canUseFirestore() {
    const cfg = getFirebaseConfig();
    return Boolean(cfg.projectId && cfg.clientEmail && cfg.privateKey);
}
function initFirestoreIfConfigured() {
    if (!canUseFirestore() || (0, app_1.getApps)().length > 0) {
        return;
    }
    const { projectId, clientEmail, privateKey } = getFirebaseConfig();
    (0, app_1.initializeApp)({
        credential: (0, app_1.cert)({
            projectId,
            clientEmail,
            privateKey
        })
    });
}
async function saveContractAnalysis(params) {
    if (!canUseFirestore()) {
        return null;
    }
    initFirestoreIfConfigured();
    const db = (0, firestore_1.getFirestore)();
    const doc = await db.collection("contractAnalyses").add({
        userId: params.userId ?? null,
        contractText: params.contractText,
        contractTypeHint: params.contractTypeHint ?? null,
        analysis: params.analysis,
        createdAt: new Date().toISOString()
    });
    return doc.id;
}
