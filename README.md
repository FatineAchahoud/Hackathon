# LegalTech Morocco

LegalTech Morocco is a multi-surface hackathon project for Moroccan contract support. Users submit contract text, receive AI risk analysis, review advocate options, and decide whether to book legal help.

## Repository Structure

- `apps/static-web/`: static MVP frontend (HTML/CSS/JS)
- `agent-backend/`: Express + TypeScript backend for AI endpoints
- `apps/web-next/`: Next.js frontend prototype
- `data/`: schema/data artifacts and seed scripts

## Product Flow

1. User authenticates.
2. User pastes contract text.
3. Backend analyzes risk levels and problematic clauses.
4. User reviews advocate profiles.
5. User decides whether to reserve with an advocate.

## API Endpoints

- `GET /health`
- `POST /api/chatbot/analyze-contract`
- `POST /api/chatbot/message`

## Dependencies

### Root Workspace

Production dependencies:

- `firebase@^12.12.0`
- `firebase-admin@^13.8.0`
- `firebase-tools@^15.14.0`

Development dependencies:

- `concurrently@^9.2.1`
- `http-server@^14.1.1`

### Backend: `agent-backend/`

Production dependencies:

- `@google/generative-ai@^0.21.0`
- `cors@^2.8.5`
- `dotenv@^16.4.5`
- `express@^4.21.1`
- `firebase-admin@^12.7.0`

Development dependencies:

- `@types/cors@^2.8.17`
- `@types/express@^4.17.21`
- `@types/node@^22.10.1`
- `tsx@^4.19.2`
- `typescript@^5.7.2`

### Next App: `apps/web-next/`

Production dependencies:

- `firebase@^12.12.0`
- `next@16.2.3`
- `react@19.2.4`
- `react-dom@19.2.4`

Development dependencies:

- `@tailwindcss/postcss@^4`
- `@types/node@^20`
- `@types/react@^19`
- `@types/react-dom@^19`
- `eslint@^9`
- `eslint-config-next@16.2.3`
- `tailwindcss@^4`
- `typescript@^5`

## Local Setup

1. Install dependencies:

```bash
npm install
npm --prefix agent-backend install
npm --prefix apps/web-next install
```

2. Create backend env file from template:

```bash
copy agent-backend/.env.example agent-backend/.env.local
```

3. Set required backend secret in `agent-backend/.env.local`:

- `GEMINI_API_KEY`

4. Run backend + static frontend:

```bash
npm run dev
```

5. Optional: run backend + static frontend + Next app:

```bash
npm run dev:all
```

## Data and Seeding

- Seed advocates: `npm run seed:advocates`
- Seed legal resources: `npm run seed:legal`
- Seed scripts location: `data/seed-advocates.js`, `data/seed-legal-resources.js`

## Security Notes

- Never commit real keys.
- Keep secrets only in local `.env` files.
- `.env.local` is ignored by git.
- Rotate leaked keys immediately.

## Disclaimer

AI output is legal assistance, not final legal advice. Final decisions should be validated by a licensed advocate.
