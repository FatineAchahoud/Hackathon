"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const node_fs_1 = require("node:fs");
const node_path_1 = __importDefault(require("node:path"));
const firebase_1 = require("./firebase");
const gemini_1 = require("./gemini");
function loadEnvironment() {
    const envCandidates = [
        node_path_1.default.resolve(process.cwd(), "agent-backend", ".env.local"),
        node_path_1.default.resolve(process.cwd(), "agent-backend", ".env"),
        node_path_1.default.resolve(process.cwd(), ".env.local"),
        node_path_1.default.resolve(process.cwd(), ".env")
    ];
    for (const envPath of envCandidates) {
        if ((0, node_fs_1.existsSync)(envPath)) {
            dotenv_1.default.config({ path: envPath });
            return;
        }
    }
    dotenv_1.default.config();
}
loadEnvironment();
const app = (0, express_1.default)();
const port = Number(process.env.PORT || 8080);
const apiKey = process.env.GEMINI_API_KEY?.trim() ?? "";
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
function isLocalOrigin(origin) {
    try {
        const url = new URL(origin);
        return url.hostname === "localhost" || url.hostname === "127.0.0.1";
    }
    catch {
        return false;
    }
}
app.use(express_1.default.json({ limit: "2mb" }));
app.use((0, cors_1.default)({
    origin(origin, callback) {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin) || isLocalOrigin(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error("Origin not allowed by CORS"));
    }
}));
app.get("/health", (_req, res) => {
    res.json({
        ok: true,
        service: "legaltech-agent-backend",
        model: "gemini-1.5-flash",
        firestoreConfigured: (0, firebase_1.canUseFirestore)()
    });
});
app.post("/api/chatbot/analyze-contract", async (req, res) => {
    try {
        const body = (req.body ?? {});
        const contractText = typeof body.contractText === "string" ? body.contractText.trim() : "";
        const contractTypeHint = typeof body.contractTypeHint === "string" ? body.contractTypeHint.trim() : "";
        const userId = typeof body.userId === "string" ? body.userId.trim() : undefined;
        const language = body.language;
        if (!contractText || contractText.length < 50) {
            res.status(400).json({
                ok: false,
                error: "'contractText' is required and must have at least 50 characters."
            });
            return;
        }
        const analysis = await (0, gemini_1.analyzeContractWithGemini)({
            apiKey,
            contractText,
            contractTypeHint,
            language
        });
        const analysisId = await (0, firebase_1.saveContractAnalysis)({
            userId,
            contractText,
            contractTypeHint,
            analysis
        });
        res.status(200).json({
            ok: true,
            analysis,
            analysisId
        });
    }
    catch (error) {
        console.error("Contract analysis request failed", error);
        res.status(500).json({
            ok: false,
            error: "Contract analysis failed. Verify API key, request payload, and model output format."
        });
    }
});
app.post("/api/chatbot/message", async (req, res) => {
    try {
        const body = (req.body ?? {});
        const message = typeof body.message === "string" ? body.message.trim() : "";
        if (!message) {
            res.status(400).json({
                ok: false,
                error: "'message' is required."
            });
            return;
        }
        const reply = await (0, gemini_1.generateChatReply)({
            apiKey,
            message,
            conversationHistory: body.conversationHistory,
            advocateName: typeof body.advocateName === "string" ? body.advocateName.trim() : "",
            advocateSpecialty: typeof body.advocateSpecialty === "string" ? body.advocateSpecialty.trim() : "",
            reservationSummary: typeof body.reservationSummary === "string" ? body.reservationSummary.trim() : "",
            language: body.language
        });
        res.status(200).json({
            ok: true,
            reply
        });
    }
    catch (error) {
        console.error("Chat message request failed", error);
        res.status(500).json({
            ok: false,
            error: "Chat response failed. Verify API key, request payload, and model output format."
        });
    }
});
app.use((_req, res) => {
    res.status(404).json({
        ok: false,
        error: "Not found"
    });
});
function startServer() {
    if (!apiKey) {
        console.warn("Warning: GEMINI_API_KEY is not set. Requests will fail until configured.");
    }
    if ((0, firebase_1.canUseFirestore)()) {
        (0, firebase_1.initFirestoreIfConfigured)();
    }
    app.listen(port, () => {
        console.log(`legaltech-agent-backend listening on http://localhost:${port}`);
    });
}
startServer();
