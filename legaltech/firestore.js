// firestore.js - Firestore Helper Functions and Mock Database
// Note: This is a mock implementation. In production, integrate with Firebase Firestore.

// Mock database
const db = {
    contractAnalyses: [],
    advocates: [],
    reservations: [],
    chatHistory: []
};

// Seed advocates data
function seedAdvocates() {
    const advocatesData = [
        {
            id: 'advocate_1',
            name: 'Dr. Mohamed Bennani',
            specialty: 'Corporate Law',
            rate: 1000,
            experience: 15,
            rating: 4.8
        },
        {
            id: 'advocate_2',
            name: 'Fatima Al-Idrissi',
            specialty: 'Family Law',
            rate: 800,
            experience: 12,
            rating: 4.7
        },
        {
            id: 'advocate_3',
            name: 'Hassan Oukili',
            specialty: 'Commercial Law',
            rate: 950,
            experience: 18,
            rating: 4.9
        },
        {
            id: 'advocate_4',
            name: 'Nadia Tazi',
            specialty: 'Employment Law',
            rate: 750,
            experience: 10,
            rating: 4.6
        },
        {
            id: 'advocate_5',
            name: 'Karim El-Kharraz',
            specialty: 'Real Estate Law',
            rate: 850,
            experience: 14,
            rating: 4.8
        },
        {
            id: 'advocate_6',
            name: 'Amina Bouazza',
            specialty: 'Intellectual Property',
            rate: 900,
            experience: 11,
            rating: 4.7
        },
        {
            id: 'advocate_7',
            name: 'Youssef Aziz',
            specialty: 'Tax Law',
            rate: 1100,
            experience: 20,
            rating: 5.0
        },
        {
            id: 'advocate_8',
            name: 'Leila Mahfouz',
            specialty: 'Contract Law',
            rate: 850,
            experience: 13,
            rating: 4.8
        }
    ];

    db.advocates = advocatesData;
    localStorage.setItem('db_advocates', JSON.stringify(advocatesData));
}

// Initialize database
function initFirestore() {
    try {
        const stored = localStorage.getItem('db_contractAnalyses');
        if (stored) db.contractAnalyses = JSON.parse(stored);

        const advocatesStored = localStorage.getItem('db_advocates');
        if (advocatesStored) {
            db.advocates = JSON.parse(advocatesStored);
        } else {
            seedAdvocates();
        }

        const reservationsStored = localStorage.getItem('db_reservations');
        if (reservationsStored) db.reservations = JSON.parse(reservationsStored);

        const chatStored = localStorage.getItem('db_chatHistory');
        if (chatStored) db.chatHistory = JSON.parse(chatStored);
    } catch (e) {
        console.error('Error initializing Firestore:', e);
        seedAdvocates();
    }
}

/**
 * Save a contract analysis
 */
async function saveContractAnalysis(analysisData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            try {
                const analysis = {
                    id: 'analysis_' + Math.random().toString(36).substr(2, 9),
                    ...analysisData
                };
                db.contractAnalyses.push(analysis);
                localStorage.setItem('db_contractAnalyses', JSON.stringify(db.contractAnalyses));
                resolve({ success: true, data: analysis });
            } catch (error) {
                resolve({ success: false, error: error.message });
            }
        }, 300);
    });
}

/**
 * Get all contract analyses for a user
 */
async function getContractAnalyses(userId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const userAnalyses = db.contractAnalyses.filter(a => a.userId === userId);
            resolve(userAnalyses.reverse()); // Most recent first
        }, 200);
    });
}

/**
 * Get contract analyses count for a user
 */
async function getContractAnalysesCount(userId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const count = db.contractAnalyses.filter(a => a.userId === userId).length;
            resolve(count);
        }, 100);
    });
}

/**
 * Get all advocates
 */
async function getAdvocates() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...db.advocates]);
        }, 200);
    });
}

/**
 * Get a specific advocate by ID
 */
async function getAdvocateById(advocateId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const advocate = db.advocates.find(a => a.id === advocateId);
            resolve(advocate || null);
        }, 100);
    });
}

/**
 * Create a reservation
 */
async function createReservation(reservationData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            try {
                const reservation = {
                    id: 'reservation_' + Math.random().toString(36).substr(2, 9),
                    ...reservationData
                };
                db.reservations.push(reservation);
                localStorage.setItem('db_reservations', JSON.stringify(db.reservations));
                resolve({ success: true, data: reservation });
            } catch (error) {
                resolve({ success: false, error: error.message });
            }
        }, 300);
    });
}

/**
 * Get all reservations for a user
 */
async function getReservations(userId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const userReservations = db.reservations.filter(r => r.clientId === userId);
            resolve(userReservations.reverse()); // Most recent first
        }, 200);
    });
}

/**
 * Get reservations count for a user
 */
async function getReservationsCount(userId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const count = db.reservations.filter(r => r.clientId === userId).length;
            resolve(count);
        }, 100);
    });
}

/**
 * Analyze contract with Gemini API (Mock)
 * In production, this would call a Firebase Function
 */
async function analyzeContract(contractText) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Mock Gemini API response
            // In production, this would call: 
            // const functions = getFunctions();
            // const analyzeContract = httpsCallable(functions, 'analyzeContract');
            // const result = await analyzeContract({ contractText });

            const mockRisks = [
                {
                    severity: 'High',
                    clause: 'Payment Terms',
                    reason: 'No late payment penalties specified. Consider adding interest charges.'
                },
                {
                    severity: 'High',
                    clause: 'Liability Limitation',
                    reason: 'Unlimited liability clause could expose your business to significant risk.'
                },
                {
                    severity: 'Medium',
                    clause: 'Termination Conditions',
                    reason: 'Termination clause lacks specific notice period. Recommend 30-day notice.'
                },
                {
                    severity: 'Medium',
                    clause: 'Dispute Resolution',
                    reason: 'Missing arbitration clause. Consider adding for smoother conflict resolution.'
                },
                {
                    severity: 'Low',
                    clause: 'Confidentiality',
                    reason: 'Scope of confidentiality could be more precisely defined.'
                }
            ];

            const response = {
                success: true,
                data: {
                    risks: mockRisks,
                    summary: 'Analysis complete: Found 2 high-risk, 2 medium-risk, and 1 low-risk issues. Review payment terms and liability clauses carefully.'
                }
            };

            resolve(response);
        }, 1500); // Simulate API delay
    });
}

/**
 * Add message to chat history
 */
async function addChatMessage(userId, analysisId, advocateId, message, sender) {
    return new Promise((resolve) => {
        setTimeout(() => {
            try {
                const chatMessage = {
                    id: 'msg_' + Math.random().toString(36).substr(2, 9),
                    userId,
                    analysisId,
                    advocateId,
                    message,
                    sender, // 'client' or 'advocate'
                    timestamp: new Date().toISOString()
                };
                db.chatHistory.push(chatMessage);
                localStorage.setItem('db_chatHistory', JSON.stringify(db.chatHistory));
                resolve({ success: true, data: chatMessage });
            } catch (error) {
                resolve({ success: false, error: error.message });
            }
        }, 200);
    });
}

/**
 * Get chat history
 */
async function getChatHistory(userId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const messages = db.chatHistory.filter(m => m.userId === userId);
            resolve(messages);
        }, 200);
    });
}

/**
 * Clear all data (for testing)
 */
async function clearDatabase() {
    return new Promise((resolve) => {
        setTimeout(() => {
            db.contractAnalyses = [];
            db.reservations = [];
            db.chatHistory = [];
            localStorage.removeItem('db_contractAnalyses');
            localStorage.removeItem('db_reservations');
            localStorage.removeItem('db_chatHistory');
            seedAdvocates();
            resolve({ success: true });
        }, 100);
    });
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFirestore);
} else {
    initFirestore();
}
