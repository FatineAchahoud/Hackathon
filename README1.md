# LegalTech Morocco - Frontend Implementation

Complete frontend implementation for an AI-powered legal contract analysis platform serving Moroccan clients and advocates.

## 📁 Project Structure

```
/
├── index.html              # Login page
├── register.html           # Registration page
├── profile.html            # User profile & dashboard
├── analyze.html            # ⭐ Contract analysis (core feature)
├── advocates.html          # Browse available advocates
├── reservation.html        # Request advocate consultation
├── chat-history.html       # View past analyses & reservations
├── styles.css              # Complete Tailwind CSS stylesheet
├── auth.js                 # Authentication helper functions
├── firestore.js            # Mock Firestore database & operations
└── README.md               # This file
```

## 🎯 Core Features

### 1. **Authentication** (index.html + register.html)
- User registration with email/password and role selection (Client/Advocate)
- Login with role-based verification
- Password strength validation
- Form validation and error handling
- Secure session management

### 2. **User Profile** (profile.html)
- Display user information (email, role, account creation date)
- View account statistics (analyses count, reservations count)
- Logout functionality
- Responsive design

### 3. **Contract Analysis** (analyze.html) ⭐ **CORE FEATURE**
- Paste contract text into large textarea
- Submit for AI analysis via Gemini API (Firebase Function)
- Receive risk analysis with severity levels:
  - 🔴 High Risk
  - 🟡 Medium Risk
  - 🟢 Low Risk
- Display detailed risk table with:
  - Severity badge (color-coded)
  - Affected clause
  - Reason for flagging
- Save analysis to history
- Request advocate consultation
- Legal disclaimer banner

### 4. **Advocate Marketplace** (advocates.html)
- Browse all licensed advocates
- View advocate details:
  - Name and specialty
  - Hourly rate (MAD)
  - Years of experience
  - Star rating
- Request reservation button
- Responsive grid layout (1-3 columns)

### 5. **Reservation System** (reservation.html)
- Pre-selected advocate information
- Link to previous contract analysis (optional)
- Message to advocate (min 20 characters)
- Preferred contact method selection:
  - Email
  - Phone
  - Video call
- Terms agreement checkbox
- Confirmation message on success

### 6. **Chat History** (chat-history.html)
- Two-tab interface:
  - **Contract Analyses Tab**: View past analyses
    - Date, risk summary, view details
  - **Reservations Tab**: View past reservations
    - Date, advocate name, status (pending/accepted/rejected)
- Loading states and empty states
- Quick links to create new analysis or browse advocates

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (Tailwind utilities), JavaScript (ES6+)
- **Authentication**: Mock implementation with localStorage (integrate with Firebase Auth in production)
- **Database**: Mock Firestore with localStorage persistence (integrate with Firebase Firestore in production)
- **AI**: Gemini API mock (integrate with Firebase Cloud Functions in production)
- **Styling**: Custom CSS with Tailwind utility classes
- **Responsive**: Mobile-first design, fully responsive on all screen sizes

## 🎨 Design System

### Colors
- **Primary**: Blue (#1e40af)
- **Success**: Green (#16a34a)
- **Danger**: Red (#dc2626)
- **Warning**: Amber (#ea580c)

### Risk Severity Colors
- 🔴 **High**: Red (#dc2626)
- 🟡 **Medium**: Yellow (#ca8a04)
- 🟢 **Low**: Green (#16a34a)

### Spacing & Typography
- Consistent spacing scale (2px, 4px, 6px, 8px, 12px, 16px, 24px, 32px)
- Clear typography hierarchy
- Responsive font sizes
- Accessible contrast ratios

## 📱 Pages Overview

| Page | Purpose | Access | Features |
|------|---------|--------|----------|
| `index.html` | Login | Public | Email/password login, role selection |
| `register.html` | Registration | Public | Email signup, password strength, role selection |
| `profile.html` | Dashboard | Protected | User info, stats, logout |
| `analyze.html` | Analysis | Protected | Contract input, Gemini analysis, results display |
| `advocates.html` | Marketplace | Protected | Browse advocates, filter by specialty |
| `reservation.html` | Request | Protected | Send consultation request |
| `chat-history.html` | History | Protected | View past analyses and reservations |

## 🔐 Authentication Flow

```
Public Pages (No Auth Required)
    ↓
    Login/Register
    ↓
Session Stored (sessionStorage + localStorage)
    ↓
Protected Pages (Auth Required)
    ↓
    → Profile
    → Contract Analysis
    → Advocates
    → Reservations
    → Chat History
```

## 💾 Data Persistence

### Mock Database (firestore.js)
- Uses **localStorage** for persistence
- Collections:
  - `db_contractAnalyses`: User's analyses
  - `db_advocates`: Seeded advocate data (8 pre-loaded)
  - `db_reservations`: User's reservation requests
  - `db_chatHistory`: Chat messages

### Mock Auth (auth.js)
- Uses **localStorage** for user storage
- Uses **sessionStorage** for current session
- Stores: email, password (base64), role, uid, createdAt

## 🚀 Getting Started

### 1. **Local Development**
```bash
# Serve files locally (use any simple HTTP server)
python -m http.server 8000
# or
npx http-server
# or
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

### 2. **Test Accounts**
The system supports registration, so create test accounts:
- Email: test@example.com
- Password: TestPassword123
- Role: Client or Advocate

### 3. **Seed Data**
Advocates are pre-seeded on first load:
- 8 Moroccan advocates with specialties
- Rates: 750-1100 MAD/hour
- Experience: 10-20 years
- Ratings: 4.6-5.0 stars

## 🔗 Integration Points

### To Connect to Firebase (Production)

#### 1. **Authentication** (in auth.js)
Replace mock implementation with:
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth();
// Use Firebase auth methods
```

#### 2. **Firestore** (in firestore.js)
Replace mock implementation with:
```javascript
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const db = getFirestore();
// Use Firestore methods
```

#### 3. **Gemini API** (in analyze.html)
Replace mock with Firebase Functions call:
```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const analyzeContract = httpsCallable(functions, 'analyzeContract');
const result = await analyzeContract({ contractText });
```

## 📊 Analysis Result Format

```javascript
{
  success: true,
  data: {
    risks: [
      {
        severity: "High",      // or "Medium" or "Low"
        clause: "Payment Terms",
        reason: "No late payment penalties specified..."
      },
      // ... more risks
    ],
    summary: "Analysis complete: Found 2 high-risk, 2 medium-risk..."
  }
}
```

## ✅ Features Implemented

- ✅ User authentication (login/register)
- ✅ Role-based access (Client/Advocate)
- ✅ Profile management
- ✅ Contract analysis submission
- ✅ Risk analysis with severity levels
- ✅ Advocate marketplace
- ✅ Reservation system
- ✅ Chat history tracking
- ✅ Responsive design (mobile-friendly)
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states
- ✅ Empty states
- ✅ Legal disclaimer banner
- ✅ Session management
- ✅ Data persistence

## 🧪 Testing Checklist

- [ ] Register as new user (Client)
- [ ] Login with correct credentials
- [ ] Verify role selection works
- [ ] Upload contract and analyze
- [ ] View analysis results with risk levels
- [ ] Browse advocates list
- [ ] Select advocate and request reservation
- [ ] Submit reservation with message
- [ ] View chat history
- [ ] Test logout functionality
- [ ] Test responsive design on mobile
- [ ] Check form validation
- [ ] Verify error messages display correctly

## 📝 Legal Compliance

- All pages include legal disclaimer
- Disclaimer states: "AI analysis is not final legal advice"
- Users directed to consult licensed advocates
- Compliance banner on analysis page

## 🔒 Security Notes (For Production)

- ⚠️ Current implementation uses base64 for passwords (DO NOT USE IN PRODUCTION)
- Use Firebase Authentication for production
- Implement HTTPS
- Add CSRF protection
- Validate all inputs server-side
- Use secure session tokens
- Implement proper access control rules in Firestore

## 📈 Future Enhancements

- Add Arabic/French/English language support
- Add OCR for scanned contracts
- Implement real payment system
- Add advocate ratings and reviews
- Add chat functionality between clients and advocates
- Implement admin moderation dashboard
- Add export analysis reports as PDF
- Add calendar for scheduling consultations
- Implement email notifications

## 🤝 Contributing

This is a hackathon project. For production deployment:
1. Integrate with real Firebase services
2. Add backend validation and security rules
3. Implement proper error handling
4. Add comprehensive testing
5. Set up CI/CD pipeline
6. Deploy to production hosting

## 📞 Support

For questions or issues, please refer to:
- Firebase Documentation: https://firebase.google.com/docs
- Gemini API Documentation: https://ai.google.dev
- Tailwind CSS: https://tailwindcss.com/docs

## 📄 License

This project is part of the LegalTech Morocco Hackathon.

---

**Last Updated**: April 2026
**Version**: 1.0.0
**Status**: ✅ Complete Frontend Implementation
