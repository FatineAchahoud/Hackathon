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

## Step-by-Step Execution Plan (6 Hours)

1. Setup (45 min)
Create Next.js app, initialize Firebase project, install Firebase SDK, Firebase Functions, and Gemini SDK.

2. Auth (45 min)
Configure Firebase project, enable Email/Password auth, implement login/register.

3. Database (45 min)
Create Firestore collections: users, analyses, advocates, reservations, messages.

4. Contract Analysis (75 min)
Build Contract Analysis page, call Gemini through Firebase Functions, return structured risks with severity and short reason.

5. Advocate Flow (45 min)
Create Advocate Suggestions page with seeded advocates and reservation form.

6. Polish and Demo (45 min)
Add profile and chat history basics, legal disclaimer, test full flow, deploy app and functions.

## Suggested Improvements After Hackathon

1. Add Arabic/French/English support
2. Add advocate rating and reviews
3. Add OCR for scanned contracts
4. Add real payments and commission automation
5. Add admin moderation dashboard

## Compliance

- AI output is legal assistance, not final legal advice
- Final decisions should be validated by a licensed advocate
