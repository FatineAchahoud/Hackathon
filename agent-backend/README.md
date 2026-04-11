# Agent Backend (Node.js + TypeScript)

Standalone backend for Moroccan contract analysis chatbot using Gemini.

## Endpoints

- `GET /health`
- `POST /api/chatbot/analyze-contract`

Request body:

```json
{
  "contractText": "full contract text...",
  "contractTypeHint": "employment",
  "userId": "firebase-uid",
  "language": "fr"
}
```

Response body:

```json
{
  "ok": true,
  "analysis": {
    "contract_type": "Employment Contract",
    "overall_risk": "Medium",
    "summary": "....",
    "risks": [
      {
        "severity": "High",
        "clause": "....",
        "reason": "....",
        "suggestion": "...."
      }
    ]
  },
  "analysisId": "firestore-doc-id-or-null"
}
```

## Setup

1. Create or edit `.env.local`.
2. Fill `GEMINI_API_KEY`.
3. Optional: set `ALLOWED_ORIGINS` as a comma-separated list for CORS.
4. Optional: fill Firebase service-account vars to enable Firestore save.

```bash
npm install
npm run dev
```

Environment variables used by the backend:

- `PORT` (default: `8080`)
- `GEMINI_API_KEY` (required for analysis endpoint)
- `ALLOWED_ORIGINS` (optional; if empty, all origins are allowed)
- `FIREBASE_PROJECT_ID` (optional, enables Firestore persistence when provided with the vars below)
- `FIREBASE_CLIENT_EMAIL` (optional)
- `FIREBASE_PRIVATE_KEY` (optional)

Build for production:

```bash
npm run build
npm start
```
