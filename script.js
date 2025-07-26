// === CONFIGURATION & STATE ===
const GOOGLE_CONFIG = {
  CLIENT_ID:
    '1040913543341-0vj52ims83dkcudpvh6rdtvrvr5da5nn.apps.googleusercontent.com',
  SPREADSHEET_ID: '15O-z40Jsy2PFs0XaXle07g_hJuwBCgpEi399TC9Yaic',
  SCOPES: 'https://www.googleapis.com/auth/spreadsheets',
};

// Workout data structure
const workoutData = {
  1: { name: 'Push Day 1', bodyPart: 'Push' },
  2: { name: 'Pull Day 1', bodyPart: 'Pull' },
  3: { name: 'Leg Day', bodyPart: 'Legs' },
  4: { name: 'Push Day 2', bodyPart: 'Push' },
  5: { name: 'Pull Day 2', bodyPart: 'Pull' },
  6: { name: 'Arms Day', bodyPart: 'Arms' },
};
const exercisesByDay = {
    1: [{ name: "BB Flat Bench Press", sets: 4 }, { name: "DB Incline Press", sets: 3 }, { name: "DB Shoulder Press", sets: 4 }, { name: "Cable Straight Pushdown", sets: 3 }, { name: "DB Lateral Raises", sets: 4 }, { name: "Overhead Tricep Extension", sets: 3 }],
    2: [{ name: "Lat Pulldown", sets: 4 }, { name: "Deadlift", sets: 4 }, { name: "Barbell Shrugs", sets: 4 }, { name: "Seated Cable Row", sets: 4 }, { name: "DB Hammer Curls", sets: 3 }],
    3: [{ name: "BB Squat", sets: 4 }, { name: "Lunges", sets: 3 }, { name: "Sumo Leg Press", sets: 3 }, { name: "Hamstring Curls", sets: 3 }, { name: "Calf Raises", sets: 4 }],
    4: [{ name: "Push Day 2", bodyPart: "Push", exercises: [{ name: "BB Incline Bench", sets: 3 }, { name: "Cable Rope Face Pulls", sets: 3 }, { name: "Close Grip Bench Press", sets: 3 }, { name: "Front Plate Raise", sets: 2 }] }],
    5: [{ name: "Pull Day 2", bodyPart: "Pull", exercises: [{ name: "Close Grip Lat Pulldown", sets: 3 }, { name: "BB Row", sets: 3 }, { name: "Face Pulls", sets: 3 }, { name: "Incline Curls", sets: 3 }] }],
    6: [{ name: "Arms Day", bodyPart: "Arms", exercises: [{ name: "Cable EZ Bar Curls", sets: 4 }, { name: "Tricep Pushdowns", sets: 4 }, { name: "Preacher Curls", sets: 3 }, { name: "Wrist Curls", sets: 3 }, { name: "Farmer Walks", sets: 3 }] }]
};

let currentUser = 'Harjas';
let currentDay = 1;
let workoutProgress = {};
let gapiInited = false;
let gisInited = false;
let tokenClient;
let sheetData = [];
let chartInstances = {};
let isApiReady = false;

// === ELEMENT REFERENCES ===
const allAuthorizeBtns = document.querySelectorAll('[id^="authorizeBtn"]');
const allSyncBtns = document.querySelectorAll('[id^="syncBtn"], #globalSyncBtn');

// === INITIALIZATION ===
window.gapiLoaded = () => {
    console.log("DEBUG: gapiLoaded() called - GAPI script has loaded.");
    gapi.load('client', initializeGapiClient);
};

window.gisLoaded = () => {
    console.log("DEBUG: gisLoaded() called - GIS script has loaded.");
    try {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CONFIG.CLIENT_ID,
            scope: GOOGLE_CONFIG.SCOPES,
            callback: handleAuthResponse,
        });
        gisInited = true;
        console.log("DEBUG: GIS client initialized successfully.");
        checkApiReady();
    } catch (e) {
        console.error("DEBUG: FATAL - Error initializing GIS client.", e);
        showNotification("Critical Error: Could not initialize Google Sign-In.", "error");
    }
};

async function initializeGapiClient() {
    try {
        await gapi.client.init({
            discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
        });
        gapiInited = true;
        console.log("DEBUG: GAPI client initialized successfully.");
        checkApiReady();
    } catch (e) {
        console.error("DEBUG: FATAL - Error initializing GAPI client.", e);
        showNotification("Critical Error: Could not initialize Google Sheets API.", "error");
    }
}

function checkApiReady() {
    if (gapiInited && gisInited) {
        console.log("DEBUG: SUCCESS - Both GAPI and GIS are initialized and ready.");
        isApiReady = true;
        updateAuthorizeButtons(true, "Authorize"); // Enable buttons with "Authorize" text
        const token = gapi.client.getToken();
        updateSigninStatus(token !== null);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DEBUG: DOMContentLoaded. Setting up event listeners and initial UI state.");
    updateAuthorizeButtons(false, "Loading..."); // Initially disable buttons
    setupEventListeners();
    loadCurrentUser();
    loadWorkoutProgress();
    renderHome();
});

// === EVENT LISTENERS SETUP (Simplified for brevity) ===
// (The rest of your setupEventListeners function remains the same)
function setupEventListeners() {
    document.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', e => { e.preventDefault(); showPage(link.dataset.page); }));
    document.querySelectorAll('.user-card').forEach(card => card.addEventListener('click', () => selectUser(card.dataset.user)));
    document.getElementById('backToHomeBtn').addEventListener('click', () => showPage('homeScreen'));
    allAuthorizeBtns.forEach(btn => btn.addEventListener('click', handleAuthClick));
    allSyncBtns.forEach(btn => btn.addEventListener('click', syncOrFetchData));
    document.getElementById('resetWorkoutBtn').addEventListener('click', resetCurrentWorkout);
    document.getElementById('workoutNotes').addEventListener('input', saveNotes);
    document.getElementById('analyzeProgressBtn').addEventListener('click', analyzeProgressWithAI);
    document.getElementById('clearSheetBtn').addEventListener('click', clearGoogleSheet);
    document.getElementById('dateRangeFilter').addEventListener('change', handleDateRangeChange);
    ['bodyPartFilter', 'exerciseFilter', 'startDateFilter', 'endDateFilter'].forEach(id => document.getElementById(id)?.addEventListener('change', renderDashboard));
    setupAIChatListeners();
}

function syncOrFetchData(event) {
    if (event.currentTarget.id.includes('Dashboard')) {
        fetchDashboardData(true);
    } else {
        syncWorkoutData();
    }
}

// === AUTH & SIGN-IN STATUS ===
function updateAuthorizeButtons(enabled, text) {
    allAuthorizeBtns.forEach(btn => {
        btn.disabled = !enabled;
        btn.innerHTML = `<i class="fab fa-google"></i> ${text}`;
    });
}

function handleAuthClick() {
    if (!isApiReady) {
        showNotification("Google API is not ready yet. Please try again in a moment.", "error");
        console.warn("DEBUG: Authorize clicked before API was ready.");
        return;
    }
    console.log("DEBUG: Requesting access token...");
    tokenClient.requestAccessToken({ prompt: 'consent' });
}

function handleAuthResponse(resp) {
    if (resp.error) {
        console.error('DEBUG: Auth Error:', resp.error);
        showNotification("Authorization failed. Check console for details.", "error");
        updateSigninStatus(false);
        return;
    }
    console.log("DEBUG: Authorization successful.");
    updateSigninStatus(true);
}

function updateSigninStatus(isSignedIn) {
    allAuthorizeBtns.forEach(btn => btn.classList.toggle('hidden', isSignedIn));
    allSyncBtns.forEach(btn => btn.classList.toggle('hidden', !isSignedIn));

    // Enable/disable sync buttons based on data
    const hasData = hasPendingData();
    allSyncBtns.forEach(btn => {
        if(btn.id.includes('Dashboard')){ // Dashboard sync always enabled if signed in
             btn.disabled = !isSignedIn;
        } else {
             btn.disabled = !hasData || !isSignedIn;
        }
    });

    if (isSignedIn) {
        // Automatically fetch data for the dashboard if it's the active page
        if (document.getElementById('dashboardScreen').classList.contains('active')) {
            fetchDashboardData(false);
        }
    } else {
        document.getElementById('dashboardContent').innerHTML = `<div class="dashboard-card"><p>Please authorize to view dashboard.</p></div>`;
    }
}

// === DATA SYNC & FETCH (FIXED MAPPING) ===
async function syncWorkoutData() {
    if (!gapi.client.getToken()) return showNotification("Please authorize first.", "error");
    const dataToSync = prepareDataForSheets();
    if (dataToSync.length === 0) return showNotification("No pending workouts to sync.", "info");
    
    showNotification("Syncing workouts...", "info");
    try {
        await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
            range: 'WorkoutLog!A1',
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: { values: dataToSync },
        });
        showNotification("Workouts synced successfully!", "success");
        // Clear synced data from local storage
        const syncedDays = [...new Set(dataToSync.map(row => Object.keys(workoutData).find(day => workoutData[day].name === row[1])))];
        syncedDays.forEach(day => {
            if (day && workoutProgress[day]) delete workoutProgress[day];
        });
        saveWorkoutProgress();
        updateSigninStatus(true); // Re-check button states
    } catch (error) {
        console.error('DEBUG: Sync Error:', error);
        showNotification("Sync failed. Check console.", "error");
    }
}

function prepareDataForSheets() {
    const rows = [];
    for (const dayKey in workoutProgress) {
        const workout = workoutData[dayKey];
        const progress = workoutProgress[dayKey];
        if (!workout || !progress.sets) continue;
        
        const dayExercises = exercisesByDay[dayKey] || [];
        let noteAdded = false;

        Object.keys(progress.sets).forEach(exIndex => {
            const exercise = dayExercises[exIndex];
            if (!exercise) return;

            Object.keys(progress.sets[exIndex]).forEach(setIndex => {
                const set = progress.sets[exIndex][setIndex];
                if (set.completed && (set.weight || set.reps)) {
                    rows.push([
                        progress.date,            // Column A: Date
                        workout.name,             // Column B: Day
                        exercise.name,            // Column C: Excercise (Corrected Spelling)
                        parseInt(setIndex) + 1,   // Column D: Set
                        set.weight || 0,          // Column E: Weight
                        set.reps || 0,            // Column F: Reps
                        currentUser,              // Column G: User
                        noteAdded ? "" : (progress.notes || "") // Column H: Notes
                    ]);
                    noteAdded = true;
                }
            });
        });
    }
    return rows;
}

async function fetchDashboardData(showNotificationOnFail = true) {
    if (!gapi.client.getToken()) return;
    console.log("DEBUG: Fetching dashboard data from Google Sheet...");
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
            range: 'WorkoutLog!A2:H', // A to H to match your 8 columns
        });
        
        sheetData = (response.result.values || []).map(row => {
            // FIX: Map to your exact column structure
            const dayName = row[1];
            // Find the corresponding bodyPart from our workoutData config
            const dayKey = Object.keys(workoutData).find(d => workoutData[d].name === dayName);
            const bodyPart = dayKey ? workoutData[dayKey].bodyPart : 'Unknown';

            return {
                date: new Date(row[0] + 'T00:00:00'), // Column A
                day: dayName,                         // Column B
                exercise: row[2],                     // Column C (Excercise)
                set: parseInt(row[3]) || 0,           // Column D (Set)
                weight: parseFloat(row[4]) || 0,      // Column E
                reps: parseInt(row[5]) || 0,          // Column F
                user: row[6],                         // Column G
                notes: row[7],                        // Column H
                bodyPart: bodyPart                    // Derived property for filtering
            };
        });
        
        console.log(`DEBUG: Fetched ${sheetData.length} rows from the sheet.`);
        if (showNotificationOnFail) showNotification('Dashboard data synced.', 'success');
        
        populateBodyPartFilter();
        handleDateRangeChange(); // This will trigger renderDashboard

    } catch (err) {
        console.error("DEBUG: Error fetching data:", err);
        if (showNotificationOnFail) showNotification("Failed to fetch dashboard data.", "error");
    }
}

// === Other functions from your script (renderHome, showPage, etc.) remain unchanged ===
// You can copy the rest of the functions from the previous script.js I provided,
// as the core logic for UI rendering, workout tracking, etc., is sound.
// Below are the remaining functions for completeness.

function showPage(pageId){ /* ... same as before ... */ }
function renderHome(){ /* ... same as before ... */ }
function startWorkout(day){ /* ... same as before ... */ }
function loadWorkoutUI(){ /* ... same as before ... */ }
function handleSetChange(e){ /* ... same as before ... */ }
function saveNotes(e){ /* ... same as before ... */ }
function resetCurrentWorkout(){ /* ... same as before ... */ }
function saveWorkoutProgress(){ /* ... same as before ... */ }
function loadWorkoutProgress(){ /* ... same as before ... */ }
function hasPendingData(){ /* ... same as before ... */ }
function loadCurrentUser(){ /* ... same as before ... */ }
function selectUser(user){ /* ... same as before ... */ }
function updateUserCards(){ /* ... same as before ... */ }
function handleDateRangeChange(){ /* ... same as before ... */ }
function populateBodyPartFilter(){ /* ... same as before ... */ }
function populateExerciseFilter(){ /* ... same as before ... */ }
function renderDashboard(){ /* ... same as before ... */ }
function renderProgressChart(data, canvasId){ /* ... same as before ... */ }
function generateAITip(change, reps){ /* ... same as before ... */ }
async function analyzeProgressWithAI(){ /* ... same as before ... */ }
async function clearGoogleSheet(){ /* ... same as before ... */ }
function setupAIChatListeners(){ /* ... same as before ... */ }
function addChatMessage(message, sender){ /* ... same as before ... */ }
async function sendChatMessage(){ /* ... same as before ... */ }
function showNotification(message, type = 'info'){ /* ... same as before ... */ }

// Make sure to include all functions. The above are placeholders for brevity.
// Here's one of them fully fleshed out as an example:
function showNotification(message, type = 'info') {
    const el = document.createElement('div');
    el.className = `notification ${type}`;
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    }, 10);
    setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 400);
    }, 4000);
}

// NOTE: To get the full working script, take the script from my previous answer and ONLY replace
// the functions that are fully written out in THIS answer. All the stubbed out `/*...same as before...*/`
// functions should be copied from the previous full script.
