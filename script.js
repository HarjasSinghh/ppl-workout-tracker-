// ==========================================
// CONFIGURATION & STATE
// ==========================================
const GOOGLE_CONFIG = {
    CLIENT_ID: 'YOUR_OAUTH_CLIENT_ID_HERE',
    SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',
    SCOPES: "https://www.googleapis.com/auth/spreadsheets",
};
const workoutData = {
    1: { name: "Push Day 1", bodyPart: "Push", exercises: [{ name: "BB Flat Bench Press", sets: 4 }, { name: "DB Incline Press", sets: 3 }, { name: "DB Shoulder Press", sets: 4 }, { name: "Cable Straight Pushdown", sets: 3 }, { name: "DB Lateral Raises", sets: 4 }, { name: "Overhead Tricep Extension", sets: 3 }] },
    2: { name: "Pull Day 1", bodyPart: "Pull", exercises: [{ name: "Lat Pulldown", sets: 4 }, { name: "Deadlift", sets: 4 }, { name: "Barbell Shrugs", sets: 4 }, { name: "Seated Cable Row", sets: 4 }, { name: "DB Hammer Curls", sets: 3 }] },
    3: { name: "Leg Day", bodyPart: "Legs", exercises: [{ name: "BB Squat", sets: 4 }, { name: "Lunges", sets: 3 }, { name: "Sumo Leg Press", sets: 3 }, { name: "Hamstring Curls", sets: 3 }, { name: "Calf Raises", sets: 4 }] },
    4: { name: "Push Day 2", bodyPart: "Push", exercises: [{ name: "BB Incline Bench", sets: 3 }, { name: "Cable Rope Face Pulls", sets: 3 }, { name: "Close Grip Bench Press", sets: 3 }, { name: "Front Plate Raise", sets: 2 }] },
    5: { name: "Pull Day 2", bodyPart: "Pull", exercises: [{ name: "Close Grip Lat Pulldown", sets: 3 }, { name: "BB Row", sets: 3 }, { name: "Face Pulls", sets: 3 }, { name: "Incline Curls", sets: 3 }] },
    6: { name: "Arms Day", bodyPart: "Arms", exercises: [{ name: "Cable EZ Bar Curls", sets: 4 }, { name: "Tricep Pushdowns", sets: 4 }, { name: "Preacher Curls", sets: 3 }, { name: "Wrist Curls", sets: 3 }, { name: "Farmer Walks", sets: 3 }] }
};
let currentUser = 'Harjas', currentDay = 1, workoutProgress = {}, gapiInited = false, gisInited = false, tokenClient, sheetData = [], chartInstances = {};

// --- INITIALIZATION ---
window.gapiLoaded = () => gapi.load('client', initializeGapiClient);
window.gisLoaded = () => {
    tokenClient = google.accounts.oauth2.initTokenClient({ client_id: GOOGLE_CONFIG.CLIENT_ID, scope: GOOGLE_CONFIG.SCOPES, callback: handleAuthResponse, });
    gisInited = true;
};
async function initializeGapiClient() {
    await gapi.client.init({ discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"] });
    gapiInited = true;
}
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadCurrentUser();
    workoutProgress = JSON.parse(localStorage.getItem('workoutProgress')) || {};
    updateSigninStatus(gapi.client.getToken() !== null);
});

// --- EVENT LISTENERS ---
function setupEventListeners() {
    document.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', e => { e.preventDefault(); showPage(link.dataset.page); }));
    document.querySelectorAll('.day-card').forEach(card => card.addEventListener('click', () => startWorkout(card.dataset.day)));
    document.querySelectorAll('.user-card').forEach(card => card.addEventListener('click', () => selectUser(card.dataset.user)));
    document.getElementById('backToHomeBtn').addEventListener('click', () => showPage('homeScreen'));
    document.getElementById('authorizeBtn').addEventListener('click', handleAuthClick);
    document.getElementById('globalSyncBtn').addEventListener('click', syncWorkoutData);
    document.getElementById('resetWorkoutBtn').addEventListener('click', resetCurrentWorkout);
    document.getElementById('workoutNotes').addEventListener('input', saveNotes);
    document.getElementById('analyzeProgressBtn').addEventListener('click', analyzeProgressWithAI);
    document.getElementById('clearSheetBtn').addEventListener('click', clearGoogleSheet);
    document.getElementById('dateRangeFilter').addEventListener('change', handleDateRangeChange);
    ['bodyPartFilter', 'exerciseFilter', 'startDateFilter', 'endDateFilter'].forEach(id => document.getElementById(id)?.addEventListener('change', renderDashboard));
    setupAIChatListeners();
}

// --- USER & AUTH ---
function loadCurrentUser() { /* ... unchanged ... */ }
function selectUser(user) { /* ... unchanged ... */ }
function handleAuthClick() { if (gapiInited && gisInited) tokenClient.requestAccessToken({ prompt: 'consent' }); }
function handleAuthResponse(resp) { if (resp.error) { console.error('Auth Error:', resp); showNotification("Authorization failed.", "error"); return; } updateSigninStatus(true); }
function updateSigninStatus(isSignedIn) {
    document.getElementById('authSection').classList.toggle('hidden', isSignedIn);
    document.getElementById('mainAppContent').classList.toggle('hidden', !isSignedIn);
    document.getElementById('globalSyncBtn').classList.toggle('hidden', !isSignedIn);
    if(isSignedIn) fetchDashboardData();
}

// --- UI & WORKOUT LOGIC ---
function showPage(pageId) { /* ... unchanged ... */ }
function startWorkout(day) { /* ... unchanged ... */ }
function loadWorkoutUI() { /* ... unchanged ... */ }
function handleSetChange(e) { /* ... unchanged ... */ }
function saveNotes(e) { /* ... unchanged ... */ }
function resetCurrentWorkout() { /* ... unchanged ... */ }

// --- DATA & SYNC ---
async function syncWorkoutData() { /* ... unchanged ... */ }
function prepareDataForSheets() {
    const rows = [];
    for (const dayKey in workoutProgress) {
        const workout = workoutData[dayKey];
        const progress = workoutProgress[dayKey];
        if (!workout || !progress.sets) continue;
        let hasCompletedSets = false;
        Object.keys(progress.sets).forEach(exIndex => {
            Object.keys(progress.sets[exIndex]).forEach(setIndex => {
                const set = progress.sets[exIndex][setIndex];
                if (set.completed) hasCompletedSets = true;
            });
        });
        if (hasCompletedSets) {
            Object.keys(progress.sets).forEach(exIndex => {
                Object.keys(progress.sets[exIndex]).forEach(setIndex => {
                    const set = progress.sets[exIndex][setIndex];
                    if (set.completed) {
                        rows.push([progress.date, workout.name, workout.bodyPart, workout.exercises[exIndex].name, set.weight || 0, set.reps || 0, currentUser, progress.notes || '']);
                    }
                });
            });
        }
    }
    return [...new Map(rows.map(item => [item.join(), item])).values()];
}
async function clearGoogleSheet() { /* ... unchanged, but ensure range is A2:H ... */ }

// --- DASHBOARD ---
async function fetchDashboardData() { /* ... unchanged, but ensure range is A2:H ... */ }
function handleDateRangeChange() { /* ... unchanged ... */ }
function populateBodyPartFilter() { /* ... unchanged ... */ }
function populateExerciseFilter() { /* ... unchanged ... */ }
function renderDashboard() { /* ... unchanged ... */ }
function renderProgressChart(data, canvasId) { /* ... unchanged ... */ }
function generateAITip(change, reps) { /* ... unchanged ... */ }

// --- AI FEATURES ---
async function analyzeProgressWithAI() { /* ... unchanged ... */ }
function setupAIChatListeners() { /* ... unchanged ... */ }
function addChatMessage(message, sender) { /* ... unchanged ... */ }
async function sendChatMessage() { /* ... unchanged ... */ }

// --- UTILITIES ---
function showNotification(message, type = 'info') { /* ... unchanged ... */ }
