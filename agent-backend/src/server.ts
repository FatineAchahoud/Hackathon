import cors from "cors";
import dotenv from "dotenv";
import express, { type Request, type Response } from "express";
import { saveContractAnalysis, canUseFirestore, initFirestoreIfConfigured } from "./firebase";
import { analyzeContractWithGemini } from "./gemini";
import type { AnalyzeContractRequest } from "./types";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 8080);
const apiKey = process.env.GEMINI_API_KEY?.trim() ?? "";

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((v) => v.trim())
  .filter(Boolean);

app.use(express.json({ limit: "2mb" }));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin not allowed by CORS"));
    }
  })
);

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    service: "legaltech-agent-backend",
    model: "gemini-1.5-flash",
    firestoreConfigured: canUseFirestore()
  });
});

app.post("/api/chatbot/analyze-contract", async (req: Request, res: Response) => {
  try {
    const body = (req.body ?? {}) as Partial<AnalyzeContractRequest>;
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

    const analysis = await analyzeContractWithGemini({
      apiKey,
      contractText,
      contractTypeHint,
      language
    });

    const analysisId = await saveContractAnalysis({
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
  } catch (error) {
    console.error("Contract analysis request failed", error);
    res.status(500).json({
      ok: false,
      error: "Contract analysis failed. Verify API key, request payload, and model output format."
    });
  }
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    ok: false,
    error: "Not found"
  });
});

function startServer() {
  if (!apiKey) {
    console.warn("Warning: GEMINI_API_KEY is not set. Requests will fail until configured.");
  }

  if (canUseFirestore()) {
    initFirestoreIfConfigured();
  }

  app.listen(port, () => {
    console.log(`legaltech-agent-backend listening on http://localhost:${port}`);
  });
}

startServer();
