# LegalTech Morocco - Hackathon Project

AI legal assistant for Moroccan contracts, connecting clients with real advocates.

## Product Summary

- Clients paste a contract and get AI risk analysis (Low, Medium, High)
- Clients can view advocate suggestions and send a reservation request
- Advocates receive case information and manage incoming leads

## Plans

### Free Plan

- Contract input (text)
- AI risk highlights (Low/Medium/High)
- Short explanation for each risk
- Advocate suggestion list

## Core Pages

- Login/Register (Client or Advocate)
- Contract Analysis
- Chat
- Profile
- Chat History
- Advocate Suggestions
- Reservation

## Technologies

- Frontend: Next.js + TypeScript + Tailwind CSS
- Backend: Firebase Functions (HTTPS callable endpoints)
- Auth and Database: Firebase Authentication + Cloud Firestore (https://firebase.google.com)
- AI: Gemini API
- Deployment: Vercel (app) + Firebase

## Backend Scope (MVP)

- Gemini prompt-based legal risk analysis for Moroccan context
- Role-based auth (client, advocate)
- Contract analysis storage in Cloud Firestore
- Advocate suggestions from seeded data
- Reservation request creation

Note: No custom model training in MVP. Use strong prompts and simple rules.

## 6-Hour MVP Scope

1. Register/login with Firebase Auth
2. Role selection (client or advocate)
3. Contract text input + Gemini analysis
4. Risk output with Low/Medium/High tags
5. Advocate suggestions page (seeded)
6. Reservation request form saved in Cloud Firestore

## 6-Hour Parallel Work Division (4 People)

### Person 1: Project Setup & Firebase Auth (130 min)
- Create Next.js app, install Firebase SDK, Firebase Functions, Gemini SDK
- Initialize Firebase project, enable Email/Password auth
- Build auth helper functions (login, register, getCurrentUser, logout)
- Set up auth state management context for Next.js
- Create basic page layout/navigation structure

### Person 2: Firestore & Seeded Data (150 min)
- Create Firestore collections: users, contractAnalyses, advocates, reservations, chatHistory
- Define collection schemas (fields, types, indexes if needed)
- Set up Firestore security rules (users can read/write own data, advocate public profiles readable)
- Seed 5–10 advocates with name, specialty, rate, experience in Firestore
- Build Firestore CRUD helper functions for all collections

### Person 3: Gemini API & Backend (160 min)
- Set up Firebase Functions project locally
- Create a callable Firebase Function for contract analysis
- Write Gemini prompt for Moroccan contract risk analysis (Low/Medium/High)
- Return JSON with risks array: [{ severity, clause, reason }]
- Test Gemini API integration locally with sample contracts

### Person 4: All Frontend Interfaces (180 min)
- Build Login page (email, password, role toggle, create account link)
- Build Register page (email, password, role selection, submit)
- Build Profile page (display user info, role, logout button)
- Build Contract Analysis page (text input, submit, display risk output with severity tags)
- Build Advocate Suggestions page (list advocates from Firestore in cards)
- Build Reservation page (select advocate, submit reservation, save to Firestore)
- Build Chat History page (list past analyses and reservations)
- Add legal disclaimer banner
- Style with Tailwind CSS for cohesive UX

### Final Sync (30 min)
- Test end-to-end flow: Login → Upload Contract → Get Analysis → View Advocates → Reserve → Chat History
- Deploy Next.js app to Vercel
- Deploy Firebase Functions
- Share live demo URL

## Blockers to Avoid

- Firestore security rules block reads → test in Firestore emulator first
- Gemini API quota exhausted → use one shared API key or test with free tier quota
- Firebase Functions cold start → deploy early for faster testing

## Suggested Improvements After Hackathon

1. Add Arabic/French/English support
2. Add advocate rating and reviews
3. Add OCR for scanned contracts
4. Add real payments and commission automation
5. Add admin moderation dashboard

## Compliance

- AI output is legal assistance, not final legal advice
- Final decisions should be validated by a licensed advocate
