# Quick Start Guide - LegalTech Morocco

## ⚡ 30-Second Setup

### Step 1: Start Local Server
```bash
# Navigate to project directory
cd /path/to/legaltech-morocco

# Option A: Python (built-in)
python -m http.server 8000

# Option B: Node.js http-server
npx http-server

# Option C: PHP (built-in)
php -S localhost:8000

# Option D: Live Server (if using VS Code)
# Right-click on index.html → Open with Live Server
```

### Step 2: Open in Browser
```
http://localhost:8000
```

## 🧪 Test Flow (2 Minutes)

### 1. **Register as Client** (30 seconds)
- Click "Create one" on login page
- Enter email: `client@test.com`
- Enter password: `TestPass123`
- Select role: **Client**
- Click "Create Account"
- Redirects to login

### 2. **Login** (15 seconds)
- Email: `client@test.com`
- Password: `TestPass123`
- Role: **Client**
- Click "Sign In"
- Redirects to profile

### 3. **Analyze Contract** (45 seconds)
- Click "Contract Analysis" in nav
- Paste sample contract:
```
This Service Agreement ("Agreement") is entered into between Company A ("Client") and Company B ("Service Provider"). 

The Service Provider agrees to provide consulting services for a period of one year. Payment shall be made monthly based on invoice submission. There are no provisions for late payment penalties.

Either party may terminate this agreement without notice at any time. The Service Provider shall not be liable for any damages exceeding the total fees paid in the agreement. All disputes shall be resolved through litigation.

Confidential information must be protected indefinitely with no specific scope defined.
```
- Click "Analyze Contract"
- Wait for results (showing mock Gemini analysis)
- View risks table with severity badges
- Click "Save to History" 

### 4. **Browse Advocates** (30 seconds)
- Click "Advocates" in nav
- See 8 pre-loaded Moroccan advocates
- View their specialties, rates, experience, ratings
- Click "Request Reservation" on any advocate

### 5. **Submit Reservation** (30 seconds)
- Advocate pre-selected
- Optional: Select past analysis from dropdown
- Enter message: "I need help reviewing my service contract"
- Select contact method: Email
- Check agreement checkbox
- Click "Submit Reservation Request"
- Redirects to Chat History

### 6. **View History** (20 seconds)
- See "Contract Analyses" tab with saved analysis
- Click "Reservations" tab
- See pending reservation request
- View advocate name and status

### 7. **Logout** (5 seconds)
- Click "Logout" button
- Redirects to login page

**Total Time: ~2 minutes**

## 📝 Test Scenarios

### Scenario 1: Multiple Users
```javascript
// Register as Advocate
Email: advocate@test.com
Password: AdvocatePass123
Role: Advocate
```

### Scenario 2: Validation Testing
- Try registering with weak password
  - Results in error: "Password must be at least 8 characters"
- Try logging in with wrong password
  - Results in error: "Invalid email or password"
- Try submitting reservation without message
  - Form won't submit, shows validation error

### Scenario 3: Data Persistence
- Register user
- Close browser
- Reopen application
- Login with same credentials
- Data still available (stored in localStorage)

## 🎯 What's Working

✅ **Authentication**
- Register new users
- Login with role verification
- Logout and session clearing
- Password validation

✅ **Contract Analysis**
- Submit contract text
- Mock Gemini API response
- Display risk analysis
- Save to history

✅ **Advocate Marketplace**
- List all advocates
- Filter by specialty (in future versions)
- Request consultation

✅ **Reservations**
- Submit reservation requests
- Track status
- View history

✅ **Responsive Design**
- Mobile friendly
- Tablet optimized
- Desktop full-featured

## 🔧 Troubleshooting

### Issue: "Cannot load stylesheet"
**Solution**: Make sure you're serving through HTTP server, not opening file directly
```bash
❌ Don't: Open file://... in browser
✅ Do: Start HTTP server and access http://localhost:8000
```

### Issue: "localStorage is undefined"
**Solution**: This happens when opening file directly. Use HTTP server instead.

### Issue: "No advocates showing"
**Solution**: Refresh page. Advocates are seeded on first page load.

### Issue: "Can't login after register"
**Solution**: Make sure email and password match exactly. Passwords are case-sensitive.

## 📱 Mobile Testing

Open `http://localhost:8000` on mobile device:
```
From same network:
http://YOUR_COMPUTER_IP:8000
```

On Mac:
```bash
ifconfig | grep inet
# Use the en0 inet address
```

On Windows:
```bash
ipconfig
# Use IPv4 Address
```

## 🗄️ Data Location

All data stored in browser localStorage:
- Users: `localStorage.getItem('users')`
- Analyses: `localStorage.getItem('db_contractAnalyses')`
- Reservations: `localStorage.getItem('db_reservations')`
- Advocates: `localStorage.getItem('db_advocates')`

Clear data:
```javascript
// Open browser console (F12) and run:
localStorage.clear();
```

## 🔗 File Mapping

| Page | File | Route |
|------|------|-------|
| Login | `index.html` | `/` |
| Register | `register.html` | `/register.html` |
| Profile | `profile.html` | `/profile.html` |
| Contract Analysis | `analyze.html` | `/analyze.html` |
| Advocates | `advocates.html` | `/advocates.html` |
| Reservation | `reservation.html` | `/reservation.html` |
| Chat History | `chat-history.html` | `/chat-history.html` |

## 🎨 Quick Styling Reference

### Color Classes
```css
bg-blue-600       /* Primary button */
bg-green-600      /* Success button */
bg-red-600        /* Danger/logout button */
bg-yellow-600     /* Medium risk */
```

### Responsive Classes
```css
grid-cols-1          /* Mobile */
md:grid-cols-2       /* Tablet */
lg:grid-cols-3       /* Desktop */
```

## 🚀 Production Deployment Steps

1. **Replace mock auth.js** with Firebase Authentication
2. **Replace mock firestore.js** with Firebase Firestore
3. **Replace mock analyzeContract** with Firebase Functions call to Gemini API
4. **Deploy to Vercel** or Firebase Hosting
5. **Set up SSL certificate**
6. **Configure Firestore security rules**
7. **Configure CORS for Gemini API**

## 📊 Advocate Seeding

Pre-loaded advocates (can be viewed in browser console):
```javascript
console.log(db.advocates);
```

Current advocates:
1. **Dr. Mohamed Bennani** - Corporate Law (1000 MAD/hr, 15 yrs, 4.8★)
2. **Fatima Al-Idrissi** - Family Law (800 MAD/hr, 12 yrs, 4.7★)
3. **Hassan Oukili** - Commercial Law (950 MAD/hr, 18 yrs, 4.9★)
4. **Nadia Tazi** - Employment Law (750 MAD/hr, 10 yrs, 4.6★)
5. **Karim El-Kharraz** - Real Estate Law (850 MAD/hr, 14 yrs, 4.8★)
6. **Amina Bouazza** - Intellectual Property (900 MAD/hr, 11 yrs, 4.7★)
7. **Youssef Aziz** - Tax Law (1100 MAD/hr, 20 yrs, 5.0★)
8. **Leila Mahfouz** - Contract Law (850 MAD/hr, 13 yrs, 4.8★)

## 🐛 Known Limitations

1. **Authentication**: Uses localStorage (not secure for production)
2. **Gemini Analysis**: Mock response (needs Firebase Function integration)
3. **Chat**: No real-time messaging (would need Firebase Realtime DB)
4. **Payments**: Not implemented (would need Stripe/PayPal)
5. **Email**: No email notifications (would need SendGrid/Firebase)
6. **OCR**: No document scanning (would need Google Cloud Vision)

## ✨ Next Steps

1. ✅ Complete frontend (DONE)
2. ⏭️ Integrate Firebase Auth
3. ⏭️ Integrate Firebase Firestore
4. ⏭️ Create Cloud Functions for Gemini API
5. ⏭️ Set up Firestore security rules
6. ⏭️ Deploy to Vercel + Firebase
7. ⏭️ Add email notifications
8. ⏭️ Implement real chat system

---

**Happy Testing! 🚀**
