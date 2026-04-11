"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAnalysisShape = validateAnalysisShape;
exports.analyzeContractWithGemini = analyzeContractWithGemini;
const generative_ai_1 = require("@google/generative-ai");
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
const ALLOWED = ["High", "Medium", "Low"];
function validateAnalysisShape(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new Error("Analysis must be a JSON object.");
    }
    const analysis = input;
    const risks = analysis.risks;
    if (typeof analysis.contract_type !== "string") {
        throw new Error("Invalid analysis.contract_type");
    }
    if (typeof analysis.summary !== "string") {
        throw new Error("Invalid analysis.summary");
    }
    if (typeof analysis.overall_risk !== "string" || !ALLOWED.includes(analysis.overall_risk)) {
        throw new Error("Invalid analysis.overall_risk");
    }
    if (!Array.isArray(risks)) {
        throw new Error("Invalid analysis.risks");
    }
    for (const item of risks) {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
            throw new Error("Each risk must be an object.");
        }
        const risk = item;
        if (typeof risk.severity !== "string" || !ALLOWED.includes(risk.severity)) {
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
    return analysis;
}
function extractJsonObject(raw) {
    const text = raw.trim();
    try {
        return JSON.parse(text);
    }
    catch {
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}");
        if (start < 0 || end <= start) {
            throw new Error("Model response did not contain a JSON object.");
        }
        return JSON.parse(text.slice(start, end + 1));
    }
}
async function analyzeContractWithGemini(params) {
    const { apiKey, contractText, contractTypeHint = "", language } = params;
    if (!apiKey) {
        throw new Error("Missing GEMINI_API_KEY.");
    }
    if (!contractText || contractText.trim().length < 50) {
        throw new Error("'contractText' must be at least 50 characters.");
    }
    const client = new generative_ai_1.GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({
        model: "gemini-1.5-flash",
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
    const raw = result.response.text();
    const parsed = extractJsonObject(raw);
    return validateAnalysisShape(parsed);
}
