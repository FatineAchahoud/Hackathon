import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ChatMessage, ContractAnalysis, Severity } from "./types";

const SYSTEM_INSTRUCTION = `You are "DOC", a Moroccan legal contract risk analysis expert.
You analyze contracts under Moroccan law and return practical legal risk findings.

Legal context:
- Moroccan Code of Obligations and Contracts (DOC)
- Moroccan Commercial Code, when relevant
- Moroccan Labor Code for employment terms
- Law 31-08 on consumer protection
- Law 09-08 on personal data protection (CNDP context)
- Law 53-05 on electronic exchange and e-signatures
- Public order rules and abusive/unbalanced clauses

Risk levels:
- High: likely unenforceable/illegal term, major imbalance, or serious compliance/litigation exposure
- Medium: ambiguous wording, missing protective detail, moderate compliance risk
- Low: minor drafting weakness or low legal friction risk

Rules:
- Be factual and specific to provided text only.
- Do not invent clauses.
- If information is missing, say so in summary and adjust risk confidence.
- Give concrete revision suggestions.

STRICT OUTPUT:
Return ONLY valid JSON object with this schema:
{
  "contract_type": string,
  "overall_risk": "High" | "Medium" | "Low",
  "summary": string,
  "risks": [
    {
      "severity": "High" | "Medium" | "Low",
      "clause": string,
      "reason": string,
      "suggestion": string
    }
  ]
}
No markdown and no extra text.`;

const ALLOWED: Severity[] = ["High", "Medium", "Low"];

const CHAT_SYSTEM_INSTRUCTION = `You are a helpful Moroccan legal assistant inside a chatbot.
You help users discuss contract issues, reservations, and general legal questions.

Rules:
- Keep responses concise, practical, and easy to understand.
- Focus on Moroccan legal context when relevant.
- If the user asks for legal advice that needs a licensed advocate, say so clearly.
- Do not invent facts or legal outcomes.
- Do not mention internal policies.
- Respond in the user's preferred language when possible.
`;

const CONTRACT_CHAT_SYSTEM_INSTRUCTION = `You are "DOC", a Moroccan legal contract assistant for chatbot users.
Analyze pasted contract text and identify what appears safe and what appears risky under Moroccan context.

Return ONLY a valid JSON object using this schema:
{
  "overall_risk": "High" | "Medium" | "Low",
  "summary": string,
  "safe_parts": string[],
  "risky_parts": [
    {
      "severity": "High" | "Medium" | "Low",
      "clause": string,
      "reason": string,
      "suggestion": string
    }
  ]
}

Rules:
- Be specific to provided text only.
- Keep safe_parts concise and factual.
- Keep suggestions actionable.
- No markdown, no code fences, no extra text.`;

export function validateAnalysisShape(input: unknown): ContractAnalysis {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Analysis must be a JSON object.");
  }

  const analysis = input as Record<string, unknown>;
  const risks = analysis.risks;

  if (typeof analysis.contract_type !== "string") {
    throw new Error("Invalid analysis.contract_type");
  }

  if (typeof analysis.summary !== "string") {
    throw new Error("Invalid analysis.summary");
  }

  if (typeof analysis.overall_risk !== "string" || !ALLOWED.includes(analysis.overall_risk as Severity)) {
    throw new Error("Invalid analysis.overall_risk");
  }

  if (!Array.isArray(risks)) {
    throw new Error("Invalid analysis.risks");
  }

  for (const item of risks) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error("Each risk must be an object.");
    }

    const risk = item as Record<string, unknown>;
    if (typeof risk.severity !== "string" || !ALLOWED.includes(risk.severity as Severity)) {
      throw new Error("Invalid risk.severity");
    }
    if (typeof risk.clause !== "string") {
      throw new Error("Invalid risk.clause");
    }
    if (typeof risk.reason !== "string") {
      throw new Error("Invalid risk.reason");
    }
    if (typeof risk.suggestion !== "string") {
      throw new Error("Invalid risk.suggestion");
    }
  }

  return analysis as unknown as ContractAnalysis;
}

function extractJsonObject(raw: string): unknown {
  const text = raw.trim();
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start < 0 || end <= start) {
      throw new Error("Model response did not contain a JSON object.");
    }
    return JSON.parse(text.slice(start, end + 1));
  }
}

function looksLikeContractText(text: string): boolean {
  const lower = text.toLowerCase();
  if (text.length >= 350) {
    return true;
  }

  const keywords = [
    "contract",
    "agreement",
    "clause",
    "party",
    "parties",
    "termination",
    "liability",
    "confidential",
    "payment terms",
    "obligation",
    "penalty",
    "governing law",
    "jurisdiction",
    "indemn",
    "force majeure"
  ];

  return keywords.some((kw) => lower.includes(kw));
}

function formatContractChatReply(input: {
  overallRisk: Severity;
  summary: string;
  safeParts: string[];
  riskyParts: Array<{
    severity: Severity;
    clause: string;
    reason: string;
    suggestion: string;
  }>;
}): string {
  const safeLines = input.safeParts.length > 0
    ? input.safeParts.slice(0, 5).map((item) => `- ${item}`).join("\n")
    : "- No clearly safe clause was explicitly confirmed from the provided text.";

  const riskLines = input.riskyParts.length > 0
    ? input.riskyParts
      .slice(0, 5)
      .map((item) => `- [${item.severity}] ${item.clause}: ${item.reason} Suggested fix: ${item.suggestion}`)
      .join("\n")
    : "- No major risk detected in the provided text.";

  return [
    `Overall risk: ${input.overallRisk}`,
    "",
    `Summary: ${input.summary}`,
    "",
    "Safe parts:",
    safeLines,
    "",
    "Risky parts:",
    riskLines
  ].join("\n");
}

export async function analyzeContractWithGemini(params: {
  apiKey: string;
  contractText: string;
  contractTypeHint?: string;
  language?: "ar" | "fr" | "en";
}): Promise<ContractAnalysis> {
  const { apiKey, contractText, contractTypeHint = "", language } = params;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY.");
  }
  if (!contractText || contractText.trim().length < 50) {
    throw new Error("'contractText' must be at least 50 characters.");
  }

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2048,
      responseMimeType: "application/json"
    }
  });

  const prompt = [
    "Analyze the contract under Moroccan legal context.",
    language ? `Preferred response language: ${language}.` : "",
    contractTypeHint ? `Contract type hint: ${contractTypeHint}` : "",
    "Contract text:",
    contractText
  ]
    .filter(Boolean)
    .join("\n\n");

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  const cleaned = responseText.replace(/```json|```|\n/g, "").trim();
  const parsed = extractJsonObject(cleaned);
  return validateAnalysisShape(parsed);
}

export function buildFallbackContractAnalysis(params: {
  contractText: string;
  contractTypeHint?: string;
}): ContractAnalysis {
  const { contractText, contractTypeHint = "" } = params;
  const lower = contractText.toLowerCase();

  const risks: ContractAnalysis["risks"] = [];

  if (lower.includes("non-compete") || lower.includes("non compete") || lower.includes("concurrent")) {
    risks.push({
      severity: "High",
      clause: "Non-compete restrictions",
      reason: "Broad post-termination restrictions without narrow scope or compensation may be challenged for imbalance.",
      suggestion: "Limit geography and duration, and add fair compensation where appropriate."
    });
  }

  if (lower.includes("60 hours") || lower.includes("overtime") || lower.includes("heures supplémentaires")) {
    risks.push({
      severity: "High",
      clause: "Working time and overtime",
      reason: "Overtime waiver language may conflict with mandatory labor protections.",
      suggestion: "Align overtime terms with mandatory labor-law limits and compensation rules."
    });
  }

  if (lower.includes("liability") || lower.includes("indemn") || lower.includes("responsabil")) {
    risks.push({
      severity: "Medium",
      clause: "Liability allocation",
      reason: "Unclear or one-sided liability wording can increase dispute risk.",
      suggestion: "Define caps, exclusions, and clear indemnity triggers."
    });
  }

  if (lower.includes("termination") || lower.includes("résiliation") || lower.includes("cancel")) {
    risks.push({
      severity: "Medium",
      clause: "Termination conditions",
      reason: "Missing notice periods and post-termination duties can create ambiguity.",
      suggestion: "State notice period, grounds for termination, and post-termination obligations."
    });
  }

  if (risks.length === 0) {
    risks.push({
      severity: "Medium",
      clause: "General drafting clarity",
      reason: "Contract text should be reviewed for enforceability, proportionality, and mandatory legal compliance.",
      suggestion: "Clarify obligations, payment terms, liability limits, and dispute resolution process."
    });
  }

  const hasHigh = risks.some((risk) => risk.severity === "High");
  const hasMedium = risks.some((risk) => risk.severity === "Medium");

  return {
    contract_type: contractTypeHint || "General Contract",
    overall_risk: hasHigh ? "High" : hasMedium ? "Medium" : "Low",
    summary:
      "Fallback analysis generated locally because AI provider was unavailable. Review highlighted clauses with a licensed Moroccan advocate before signing.",
    risks
  };
}

export async function generateChatReply(params: {
  apiKey: string;
  message: string;
  conversationHistory?: ChatMessage[];
  advocateName?: string;
  advocateSpecialty?: string;
  reservationSummary?: string;
  language?: "ar" | "fr" | "en";
}): Promise<string> {
  const {
    apiKey,
    message,
    conversationHistory = [],
    advocateName = "",
    advocateSpecialty = "",
    reservationSummary = "",
    language
  } = params;

  const trimmedMessage = message.trim();
  if (!trimmedMessage) {
    throw new Error("'message' is required.");
  }

  if (!apiKey) {
    return buildFallbackChatReply({
      message: trimmedMessage,
      advocateName,
      advocateSpecialty,
      reservationSummary,
      conversationHistory,
      language
    });
  }

  try {
    const client = new GoogleGenerativeAI(apiKey);

    if (looksLikeContractText(trimmedMessage)) {
      const contractModel = client.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: CONTRACT_CHAT_SYSTEM_INSTRUCTION,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1500,
          responseMimeType: "application/json"
        }
      });

      const contractPrompt = [
        language ? `Preferred language: ${language}.` : "",
        "Analyze this contract text and split findings into safe parts and risky parts.",
        `Contract text:\n${trimmedMessage}`
      ]
        .filter(Boolean)
        .join("\n\n");

      const contractResult = await contractModel.generateContent(contractPrompt);
      const parsed = extractJsonObject(contractResult.response.text()) as Record<string, unknown>;

      const overallRiskRaw = typeof parsed.overall_risk === "string" ? parsed.overall_risk : "Medium";
      const overallRisk = ALLOWED.includes(overallRiskRaw as Severity) ? overallRiskRaw as Severity : "Medium";
      const summary = typeof parsed.summary === "string"
        ? parsed.summary
        : "Contract was analyzed. Review risky clauses before signing.";

      const safeParts = Array.isArray(parsed.safe_parts)
        ? parsed.safe_parts.filter((item): item is string => typeof item === "string")
        : [];

      const riskyParts = Array.isArray(parsed.risky_parts)
        ? parsed.risky_parts
          .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
          .map((item) => {
            const severityRaw = typeof item.severity === "string" ? item.severity : "Medium";
            const severity = ALLOWED.includes(severityRaw as Severity) ? severityRaw as Severity : "Medium";
            return {
              severity,
              clause: typeof item.clause === "string" ? item.clause : "Unspecified clause",
              reason: typeof item.reason === "string" ? item.reason : "Potential legal uncertainty detected.",
              suggestion: typeof item.suggestion === "string" ? item.suggestion : "Clarify this clause with explicit wording."
            };
          })
        : [];

      return formatContractChatReply({
        overallRisk,
        summary,
        safeParts,
        riskyParts
      });
    }

    const model = client.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: CHAT_SYSTEM_INSTRUCTION,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 700
      }
    });

    const historyBlock = conversationHistory
      .slice(-8)
      .map((entry) => `${entry.role === "user" ? "User" : "Assistant"}: ${entry.content}`)
      .join("\n");

    const prompt = [
      language ? `Preferred language: ${language}.` : "",
      advocateName ? `Advocate name: ${advocateName}` : "",
      advocateSpecialty ? `Advocate specialty: ${advocateSpecialty}` : "",
      reservationSummary ? `Reservation context: ${reservationSummary}` : "",
      historyBlock ? `Conversation history:\n${historyBlock}` : "",
      `User message: ${trimmedMessage}`,
      "Respond with a single helpful message."
    ]
      .filter(Boolean)
      .join("\n\n");

    const result = await model.generateContent(prompt);
    const reply = result.response.text().trim();
    return reply || buildFallbackChatReply({
      message: trimmedMessage,
      advocateName,
      advocateSpecialty,
      reservationSummary,
      conversationHistory,
      language
    });
  } catch {
    return buildFallbackChatReply({
      message: trimmedMessage,
      advocateName,
      advocateSpecialty,
      reservationSummary,
      conversationHistory,
      language
    });
  }
}

function buildFallbackChatReply(params: {
  message: string;
  advocateName: string;
  advocateSpecialty: string;
  reservationSummary: string;
  conversationHistory: ChatMessage[];
  language?: "ar" | "fr" | "en";
}): string {
  const { message, advocateName, advocateSpecialty, reservationSummary, conversationHistory } = params;
  const lower = message.toLowerCase();

  const contextLine = advocateName || advocateSpecialty
    ? `I'm reviewing this as ${advocateName || "your assistant"}${advocateSpecialty ? `, focusing on ${advocateSpecialty}` : ""}.`
    : "I'm reviewing your message in the context of Moroccan contract practice.";

  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return `${contextLine} Tell me the clause, problem, or question you want me to review.`;
  }

  if (lower.includes("payment") || lower.includes("invoice") || lower.includes("fee")) {
    return `${contextLine} For payment terms, I would check due dates, late-payment penalties, invoice timing, and whether the contract clearly states who pays and when. If you paste the exact clause, I can help rewrite it more clearly.`;
  }

  if (lower.includes("termination") || lower.includes("cancel")) {
    return `${contextLine} For termination clauses, the key points are notice period, cause vs. convenience termination, and what happens to unpaid amounts or ongoing work after cancellation.`;
  }

  if (lower.includes("liability") || lower.includes("damages") || lower.includes("indemn")) {
    return `${contextLine} Liability clauses should clearly limit exposure, define exclusions, and avoid vague unlimited responsibility unless that is intentional.`;
  }

  if (lower.includes("confidential") || lower.includes("nda") || lower.includes("privacy")) {
    return `${contextLine} Confidentiality terms should define what is protected, how long the duty lasts, and any legal exceptions for disclosure.`;
  }

  if (lower.includes("reservation") || lower.includes("meeting") || lower.includes("call")) {
    return `${contextLine} I can help organize the consultation. ${reservationSummary ? `I noted: ${reservationSummary}. ` : ""}Share the clause or issue you want to focus on, and I’ll give you a practical first-pass answer.`;
  }

  const historyHint = conversationHistory.length > 0
    ? "I can also keep the answer aligned with the earlier messages in this conversation."
    : "";

  return `${contextLine} ${historyHint} Please paste the clause or explain the issue in one or two sentences, and I’ll give you a clear next step.`.trim();
}
