// firestore.js - Firestore Helper Functions and Mock Database
// Note: This is a mock implementation. In production, integrate with Firebase Firestore.

// Mock database
const db = {
    contractAnalyses: [],
    advocates: [],
    reservations: [],
    chatHistory: []
};

const DEMO_CLIENT_ID = 'client_demo_1';
const DEMO_LAWYER_ID = 'lawyer_demo_1';

const LAWYER_ADVOCATE_ASSIGNMENTS = {
    [DEMO_LAWYER_ID]: ['advocate_3', 'advocate_8']
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

        seedDemoDataIfNeeded();
    } catch (e) {
        console.error('Error initializing Firestore:', e);
        seedAdvocates();
        seedDemoDataIfNeeded();
    }
}

function seedDemoDataIfNeeded() {
    if (db.contractAnalyses.length === 0) {
        db.contractAnalyses = [
            {
                id: 'analysis_demo_1',
                userId: DEMO_CLIENT_ID,
                contractText: 'Service agreement between Atlas Commerce and NorthSoft with payment and termination clauses.',
                risks: [
                    { severity: 'High', clause: 'Late payment clause', reason: 'No explicit late-payment penalty or grace period.' },
                    { severity: 'Medium', clause: 'Termination notice', reason: 'Notice period is vague and creates dispute risk.' },
                    { severity: 'Low', clause: 'Confidentiality scope', reason: 'Scope can be clarified with a tighter definition.' }
                ],
                summary: '2 key legal risks detected: payment enforceability and ambiguous termination notice.',
                createdAt: '2026-04-10T10:20:00.000Z'
            },
            {
                id: 'analysis_demo_2',
                userId: DEMO_CLIENT_ID,
                contractText: 'Employment contract draft with probation, non-compete, and dismissal conditions.',
                risks: [
                    { severity: 'High', clause: 'Non-compete duration', reason: 'Duration appears excessive and may be unenforceable.' },
                    { severity: 'Medium', clause: 'Dismissal process', reason: 'Procedure does not reference documented cause.' },
                    { severity: 'Low', clause: 'Probation wording', reason: 'Language can be tightened for consistency.' }
                ],
                summary: 'Employment draft is workable but needs revision of restrictive clauses and dismissal process.',
                createdAt: '2026-04-10T15:45:00.000Z'
            }
        ];
        localStorage.setItem('db_contractAnalyses', JSON.stringify(db.contractAnalyses));
    }

    if (db.reservations.length === 0) {
        db.reservations = [
            {
                id: 'reservation_demo_1',
                clientId: DEMO_CLIENT_ID,
                advocateId: 'advocate_3',
                contractAnalysisId: 'analysis_demo_1',
                message: 'Need urgent review of payment default and dispute resolution clauses before signing this week.',
                contactMethod: 'video',
                status: 'pending',
                createdAt: '2026-04-10T17:00:00.000Z'
            },
            {
                id: 'reservation_demo_2',
                clientId: DEMO_CLIENT_ID,
                advocateId: 'advocate_8',
                contractAnalysisId: 'analysis_demo_2',
                message: 'Please validate the non-compete and termination language for compliance with Moroccan labor law.',
                contactMethod: 'email',
                status: 'accepted',
                createdAt: '2026-04-09T11:15:00.000Z'
            }
        ];
        localStorage.setItem('db_reservations', JSON.stringify(db.reservations));
    }
}

function resolveReservationsForUser(userId) {
    const asClient = db.reservations.filter((r) => r.clientId === userId);
    const assignedAdvocates = LAWYER_ADVOCATE_ASSIGNMENTS[userId] || [];
    const asLawyer = assignedAdvocates.length > 0
        ? db.reservations.filter((r) => assignedAdvocates.includes(r.advocateId))
        : [];

    const merged = [...asClient, ...asLawyer];
    const uniqueById = new Map();
    merged.forEach((item) => uniqueById.set(item.id, item));
    return Array.from(uniqueById.values());
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
            const userReservations = resolveReservationsForUser(userId);
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
            const count = resolveReservationsForUser(userId).length;
            resolve(count);
        }, 100);
    });
}

/**
 * Analyze contract via backend API with local fallback
 */
async function analyzeContract(contractText) {
    const backendBaseUrls = [
        'http://localhost:8080',
        'http://127.0.0.1:8080'
    ];

    let lastBackendError = null;
    let hadReachableBackend = false;

    for (const baseUrl of backendBaseUrls) {
        try {
            const response = await fetch(`${baseUrl}/api/chatbot/analyze-contract`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contractText,
                    language: 'en'
                })
            });

            hadReachableBackend = true;

            const payload = await response.json();

            if (!response.ok || !payload?.ok || !payload?.analysis) {
                lastBackendError = payload?.error || 'Backend analysis failed';
                continue;
            }

            const analysis = payload.analysis;
            const mappedRisks = Array.isArray(analysis.risks)
                ? analysis.risks.map((item) => ({
                    severity: item.severity || 'Medium',
                    clause: item.clause || 'Unspecified clause',
                    reason: item.reason || 'Potential legal uncertainty detected.'
                }))
                : [];

            return {
                success: true,
                data: {
                    risks: mappedRisks,
                    summary: analysis.summary || 'Contract analysis completed.'
                }
            };
        } catch (error) {
            if (error?.name === 'TypeError' || error?.name === 'AbortError') {
                console.warn(`Analysis backend request failed for ${baseUrl}`, error);
                continue;
            }

            lastBackendError = error?.message || 'Backend analysis failed';
        }
    }

    if (hadReachableBackend && lastBackendError) {
        return {
            success: false,
            error: lastBackendError
        };
    }

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
            reason: 'Termination clause lacks specific notice period. Recommend a fixed notice period.'
        },
        {
            severity: 'Medium',
            clause: 'Dispute Resolution',
            reason: 'Missing arbitration or mediation clause. Consider adding one for smoother conflict resolution.'
        },
        {
            severity: 'Low',
            clause: 'Confidentiality',
            reason: 'Scope of confidentiality could be defined more precisely.'
        }
    ];

    return {
        success: true,
        data: {
            risks: mockRisks,
            summary: 'Backend is unreachable. Displaying local fallback analysis based on common contract risks.'
        }
    };
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
