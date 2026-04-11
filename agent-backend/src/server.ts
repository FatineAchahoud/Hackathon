import cors from "cors";
import dotenv from "dotenv";
import express, { type Request, type Response } from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { saveContractAnalysis, canUseFirestore, initFirestoreIfConfigured } from "./firebase";
import { analyzeContractWithGemini, buildFallbackContractAnalysis, generateChatReply } from "./gemini";
import type { AnalyzeContractRequest, ChatbotMessageRequest } from "./types";

function loadEnvironment(): void {
  const envCandidates = [
    path.resolve(process.cwd(), "agent-backend", ".env.local"),
    path.resolve(process.cwd(), "agent-backend", ".env"),
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), ".env")
  ];

  for (const envPath of envCandidates) {
    if (existsSync(envPath)) {
      dotenv.config({ path: envPath });
      return;
    }
  }

  dotenv.config();
}

loadEnvironment();

const app = express();
const port = 5000;
const apiKey = process.env.GEMINI_API_KEY?.trim() ?? "";

app.use(express.json({ limit: "2mb" }));
app.use(cors());

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    service: "legaltech-agent-backend",
    model: "gemini-2.0-flash",
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

    let analysis;
    try {
      analysis = await analyzeContractWithGemini({
        apiKey,
        contractText,
        contractTypeHint,
        language
      });
    } catch (analysisError) {
      console.error("Gemini analysis failed, using backend fallback analysis", analysisError);
      analysis = buildFallbackContractAnalysis({
        contractText,
        contractTypeHint
      });

      const statusCode =
        typeof analysisError === "object" && analysisError !== null && "status" in analysisError
          ? Number((analysisError as { status?: unknown }).status)
          : NaN;

      if (statusCode === 429) {
        analysis.summary =
          "AI quota exceeded right now (Gemini rate limit). This is a backend fallback analysis; retry shortly or use a higher-quota API key.";
      }
    }

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

app.post("/api/chatbot/message", async (req: Request, res: Response) => {
  try {
    const body = (req.body ?? {}) as Partial<ChatbotMessageRequest>;
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!message) {
      res.status(400).json({
        ok: false,
        error: "'message' is required."
      });
      return;
    }

    const reply = await generateChatReply({
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
  } catch (error) {
    console.error("Chat message request failed", error);
    res.status(500).json({
      ok: false,
      error: "Chat response failed. Verify API key, request payload, and model output format."
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
