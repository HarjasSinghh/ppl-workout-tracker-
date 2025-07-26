// === CONFIGURATION & STATE ===
const GOOGLE_CONFIG = {
  CLIENT_ID:
    '1040913543341-0vj52ims83dkcudpvh6rdtvrvr5da5nn.apps.googleusercontent.com',
  SPREADSHEET_ID: '15O-z40Jsy2PFs0XaXle07g_hJuwBCgpEi399TC9Yaic',
  SCOPES: 'https://www.googleapis.com/auth/spreadsheets',
};

// =================================================================================
// FIXED & COMPLETE: WORKOUT DATA FROM YOUR PDF (FIXES EXERCISES NOT SHOWING)
// This object now contains the full workout regime, including alternatives.
// =================================================================================
const workoutData = {
    1: { name: "Push Day 1", bodyPart: "Push", exercises: [
        { name: "BB Flat Bench Press", sets: 4, reps: "10, 8, 6, 4", alternatives: ["Machine bench press", "incline bench press", "db flat bench press"] },
        { name: "DB Incline Press", sets: 3, reps: "12, 8, 6", alternatives: ["Incline bench press", "machine incline bench press", "flat db bench press"] },
        { name: "DB Shoulder Press", sets: 4, reps: "15, 12, 10, 6", alternatives: ["Machine shoulder press", "barbell shoulder press", "shoulder front raises"] },
        { name: "Cable Straight Pushdown", sets: 3, reps: "15, 12, 10 + 1 drop set", alternatives: ["Rope pushdowns", "single hand cable pushdowns", "skull crushers"] },
        { name: "DB Lateral Raises", sets: 4, reps: "12, 10, 8, (5 peak hold, 10 full, 10 partial, 5 full)", alternatives: ["Upright rows", "laying lateral raises"] },
        { name: "Overhead Tricep Extension", sets: 3, reps: "15, 12, 10", alternatives: ["Rope pushdowns", "single hand cable pushdowns", "skull crushers"] },
        { name: "Cable Chest Fly (slow reps)", sets: 3, reps: "20, 16, 12", alternatives: ["Machine fly", "db fly"] }
    ]},
    2: { name: "Pull Day 1", bodyPart: "Pull", exercises: [
        { name: "Lat Pulldown", sets: 4, reps: "12, 10, 6, 6 peak contraction", alternatives: ["DB row", "barbell row", "pull ups"] },
        { name: "Deadlift", sets: 4, reps: "10, 8, 6, 4", alternatives: ["Back extension", "db deadlift"] },
        { name: "Seated Close Grip Row", sets: 4, reps: "12, 10, 10, 10 peak holds", alternatives: ["Row with narrow bar", "row with wide bar", "db and bb row"] },
        { name: "Rope Pull Overs", sets: 3, reps: "16, 12, 10", alternatives: ["Pull over with db"] },
        { name: "DB Hammer Curls", sets: 3, reps: "15, 12, 10", alternatives: ["DB curls", "preacher curls"] },
        { name: "Preacher Curls", sets: 4, reps: "16, 12, 10, 8", alternatives: ["DB curls", "seated curls"] },
        { name: "Barbell Curls", sets: 2, reps: "20, 15", alternatives: ["Supinated curls", "cable curls"] }
    ]},
    3: { name: "Leg Day", bodyPart: "Legs", exercises: [
        { name: "BB Squat", sets: 4, reps: "15, 10, 6, 4", alternatives: ["Hack squats", "leg press"] },
        { name: "Lunges", sets: 3, reps: "8 strides per leg", alternatives: ["Reverse squat", "romanian deadlift"] },
        { name: "Sumo Stance Leg Press", sets: 3, reps: "12, 10, 8", alternatives: ["Glute bridges", "goblet squat", "sumo squat"] },
        { name: "Hamstring Curls", sets: 3, reps: "15, 12, 10", alternatives: ["Reverse hamstring curls"] },
        { name: "Legs Extension", sets: 3, reps: "15, 12, 10", alternatives: ["Adductors", "hack squat full depth"] },
        { name: "Calf Raises", sets: 4, reps: "25, 20, 20, 15", alternatives: ["Seated calf raises"] }
    ]},
    4: { name: "Push Day 2", bodyPart: "Push", exercises: [
        { name: "BB Incline Bench", sets: 2, reps: "12, 10", alternatives: ["Machine bench press", "db flat bench press"] },
        { name: "Cambered Bar Front Raise", sets: 3, reps: "15, 12, 10", alternatives: ["DB front raise", "plate front raise"] },
        { name: "Cable Rope Face Pulls w/ Rear Delt Fly", sets: 3, reps: "12, 10, 8 for both", alternatives: ["Bent over delt fly"] },
        { name: "Lowest Angle Chest Fly", sets: 3, reps: "15, 12, 10", alternatives: ["Machine fly", "db fly"] },
        { name: "Front Plate Raise", sets: 2, reps: "20, 16", alternatives: ["DB front raise"] },
        { name: "Close Grip Bench Press", sets: 2, reps: "15, 12", alternatives: ["Tricep dips"] },
        { name: "Lateral Raises on Machine/Cable", sets: 2, reps: "20, 16", alternatives: ["Upright rows", "db lateral raises"] }
    ]},
    5: { name: "Pull Day 2", bodyPart: "Pull", exercises: [
        { name: "Close Grip Lat Pulldown w/ V Bar", sets: 3, reps: "15, 12, 10", alternatives: ["DB row", "barbell row", "pull ups"] },
        { name: "BB Row", sets: 3, reps: "12, 10, 8", alternatives: ["Single hand db row", "machine row"] },
        { name: "Reverse Hand Rowing", sets: 2, reps: "12, 10", alternatives: ["Single hand db row", "machine row"] },
        { name: "Hyper Extension", sets: 3, reps: "20, 16, 14", alternatives: ["Deadlift", "t-bar row"] },
        { name: "Incline Curls", sets: 3, reps: "15, 12, 10", alternatives: ["Hammer curls", "db curls"] },
        { name: "Machine Rope Curls", sets: 3, reps: "15, 12, 10", alternatives: ["Hammer curls", "db curls"] }
    ]},
    6: { name: "Arms Day", bodyPart: "Arms", exercises: [
        { name: "Superset: Cable EZ Bar Curls / Tricep Pushdowns", sets: 4, reps: "15-15, 12-12, 10-10, 8-8", alternatives: [] },
        { name: "Superset: Preacher Curls / Overhead Tricep Extension", sets: 3, reps: "12-12, 10-10, 8-8", alternatives: [] },
        { name: "Superset: Wide Grip Bar Curls / Rope Pushdowns", sets: 2, reps: "5p 10f - 10, 5p 10f - 10", alternatives: [] },
        { name: "Superset: Hammer Curls Drop Set / Single Arm Tricep", sets: 2, reps: "(15, 12, 10) - 10", alternatives: [] }
    ]}
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
const workoutGrid = document.getElementById('workoutGrid');
const dashboardContent = document.getElementById('dashboardContent');

// === INITIALIZATION ===
window.gapiLoaded = () => gapi.load('client', initializeGapiClient);
window.gisLoaded = () => {
    try {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CONFIG.CLIENT_ID, scope: GOOGLE_CONFIG.SCOPES, callback: handleAuthResponse,
        });
        gisInited = true; checkApiReady();
    } catch (e) { showNotification("Critical Error: Could not initialize Google Sign-In.", "error"); }
};
async function initializeGapiClient() {
    try {
        await gapi.client.init({ discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"] });
        gapiInited = true; checkApiReady();
    } catch (e) { showNotification("Critical Error: Could not initialize Google Sheets API.", "error"); }
}
function checkApiReady() {
    if (gapiInited && gisInited) {
        isApiReady = true;
        updateAuthorizeButtons(true, "Authorize");
        const token = gapi.client.getToken();
        updateSigninStatus(token !== null);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    updateAuthorizeButtons(false, "Loading...");
    setupEventListeners();
    loadCurrentUser();
    loadWorkoutProgress();
    renderHome();
});

// === EVENT LISTENERS ===
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
    if (event.currentTarget.id.includes('Dashboard')) { fetchDashboardData(true); } else { syncWorkoutData(); }
}

// === AUTH & SIGN-IN ===
function updateAuthorizeButtons(enabled, text) {
    allAuthorizeBtns.forEach(btn => {
        btn.disabled = !enabled;
        btn.innerHTML = `<i class="fab fa-google"></i> ${text}`;
    });
}
function handleAuthClick() {
    if (!isApiReady) { showNotification("Google API is not ready. Please try again.", "error"); return; }
    tokenClient.requestAccessToken({ prompt: 'consent' });
}
function handleAuthResponse(resp) {
    if (resp.error) { showNotification("Authorization failed. Check console.", "error"); updateSigninStatus(false); return; }
    updateSigninStatus(true);
}
function updateSigninStatus(isSignedIn) {
    allAuthorizeBtns.forEach(btn => btn.classList.toggle('hidden', isSignedIn));
    allSyncBtns.forEach(btn => btn.classList.toggle('hidden', !isSignedIn));
    const hasData = hasPendingData();
    document.getElementById('globalSyncBtn').disabled = !hasData;
    document.querySelectorAll('#syncBtnHome, #syncBtnWorkout').forEach(btn => btn.disabled = !hasData);
    document.getElementById('analyzeProgressBtn').disabled = !isSignedIn;
    document.getElementById('clearSheetBtn').disabled = !isSignedIn;
    document.getElementById('syncBtnDashboard').disabled = !isSignedIn;
    if (isSignedIn && document.getElementById('dashboardScreen').classList.contains('active')) {
        fetchDashboardData(false);
    } else if (!isSignedIn) {
        dashboardContent.innerHTML = `<div class="dashboard-card"><p>Please authorize to view dashboard.</p></div>`;
    }
}

// =================================================================================
// FIXED: WORKOUT UI RENDERING
// This function now builds the exercise list with dropdowns for alternatives.
// =================================================================================
function loadWorkoutUI() {
    const workout = workoutData[currentDay];
    document.getElementById('currentWorkoutTitle').textContent = workout.name;
    const container = document.getElementById('exerciseListContainer');
    container.innerHTML = '';

    const progress = workoutProgress[currentDay] || { date: new Date().toISOString().split('T')[0], sets: {}, notes: '' };

    workout.exercises.forEach((exercise, exIndex) => {
        // Create the dropdown for alternatives
        let optionsHtml = `<option value="${exercise.name}">${exercise.name}</option>`;
        if (exercise.alternatives && exercise.alternatives.length > 0) {
            exercise.alternatives.forEach(alt => {
                optionsHtml += `<option value="${alt}">${alt}</option>`;
            });
        }
        
        // Check if a different exercise was previously selected and stored
        const selectedExerciseName = progress.sets?.[exIndex]?.selectedExercise || exercise.name;
        // Update the select dropdown to show the correct selected value
        const selectHtml = `<select class="exercise-select" data-ex="${exIndex}">${optionsHtml.replace(`value="${selectedExerciseName}"`, `value="${selectedExerciseName}" selected`)}</select>`;
        
        // Create the set rows
        let setsHtml = '';
        for (let setIndex = 0; setIndex < exercise.sets; setIndex++) {
            const p = progress.sets?.[exIndex]?.[setIndex] || {};
            setsHtml += `<div class="set-row ${p.completed ? 'completed' : ''}" data-ex="${exIndex}" data-set="${setIndex}">
                <input type="checkbox" class="set-checkbox" ${p.completed ? 'checked' : ''}>
                <span>Set ${setIndex + 1}</span>
                <input type="number" class="set-input" placeholder="kg" value="${p.weight || ''}">
                <input type="number" class="set-input" placeholder="reps" value="${p.reps || ''}">
            </div>`;
        }

        // Combine everything into the exercise card
        container.innerHTML += `<div class="exercise-card">
            <div class="exercise-header">
                ${selectHtml}
                <span class="rep-scheme">Target: ${exercise.reps}</span>
            </div>
            ${setsHtml}
        </div>`;
    });

    document.getElementById('workoutNotes').value = progress.notes || '';
    // Add event listeners to newly created elements
    container.querySelectorAll('.set-checkbox, .set-input').forEach(el => el.addEventListener('change', handleSetChange));
    container.querySelectorAll('.exercise-select').forEach(sel => sel.addEventListener('change', handleExerciseChange));
}

// NEW: Event handler for the exercise dropdown
function handleExerciseChange(e) {
    const selectElement = e.target;
    const exIndex = selectElement.dataset.ex;
    const selectedExercise = selectElement.value;
    
    if (!workoutProgress[currentDay]) {
        workoutProgress[currentDay] = { date: new Date().toISOString().split('T')[0], sets: {}, notes: '' };
    }
    if (!workoutProgress[currentDay].sets[exIndex]) {
        workoutProgress[currentDay].sets[exIndex] = {};
    }
    // Store the selected exercise name in our progress object
    workoutProgress[currentDay].sets[exIndex].selectedExercise = selectedExercise;
    saveWorkoutProgress();
}


function handleSetChange(e) {
    const row = e.target.closest('.set-row');
    const { ex, set } = row.dataset;
    if (!workoutProgress[currentDay]) { workoutProgress[currentDay] = { date: new Date().toISOString().split('T')[0], sets: {}, notes: '' }; }
    if (!workoutProgress[currentDay].sets[ex]) { workoutProgress[currentDay].sets[ex] = {}; }
    
    workoutProgress[currentDay].sets[ex][set] = {
        completed: row.querySelector('.set-checkbox').checked,
        weight: row.querySelector('input[placeholder="kg"]').value,
        reps: row.querySelector('input[placeholder="reps"]').value,
    };
    row.classList.toggle('completed', workoutProgress[currentDay].sets[ex][set].completed);
    saveWorkoutProgress();
}
function saveNotes(e) {
    if (!workoutProgress[currentDay]) { workoutProgress[currentDay] = { date: new Date().toISOString().split('T')[0], sets: {}, notes: '' }; }
    workoutProgress[currentDay].notes = e.target.value;
    saveWorkoutProgress();
}
function resetCurrentWorkout() {
    if (!confirm("Are you sure you want to reset all entries for this workout session?")) return;
    if (workoutProgress[currentDay]) {
        delete workoutProgress[currentDay];
        saveWorkoutProgress();
        loadWorkoutUI();
        showNotification("Workout session has been reset.", "info");
    }
}

// === DATA SYNC, FETCH & STORAGE ===
function saveWorkoutProgress() {
    localStorage.setItem('workoutProgress', JSON.stringify(workoutProgress));
    const token = gapi.client.getToken();
    if(token) updateSigninStatus(true);
}
function loadWorkoutProgress() {
    const stored = localStorage.getItem('workoutProgress');
    workoutProgress = stored ? JSON.parse(stored) : {};
}
function hasPendingData() {
    return Object.values(workoutProgress).some(day => day.sets && Object.values(day.sets).some(ex => Object.values(ex).some(set => set.completed)));
}
async function syncWorkoutData() {
    if (!gapi.client.getToken()) return showNotification("Please authorize first.", "error");
    const dataToSync = prepareDataForSheets();
    if (dataToSync.length === 0) { return showNotification("No pending workouts to sync.", "info"); }
    showNotification("Syncing workouts...", "info");
    try {
        await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID, range: 'WorkoutLog!A1',
            valueInputOption: 'USER_ENTERED', insertDataOption: 'INSERT_ROWS',
            resource: { values: dataToSync },
        });
        showNotification("Workouts synced successfully!", "success");
        const syncedDays = [...new Set(dataToSync.map(row => Object.keys(workoutData).find(day => workoutData[day].name === row[1])))];
        syncedDays.forEach(day => { if (day && workoutProgress[day]) delete workoutProgress[day]; });
        saveWorkoutProgress();
    } catch (error) { showNotification("Sync failed. Check console.", "error"); }
}

// FIXED: This function now correctly gets the selected exercise name for syncing
function prepareDataForSheets() {
    const rows = [];
    for (const dayKey in workoutProgress) {
        const workout = workoutData[dayKey];
        const progress = workoutProgress[dayKey];
        if (!workout || !progress.sets) continue;
        
        let noteAdded = false;
        Object.keys(progress.sets).forEach(exIndex => {
            const defaultExercise = workout.exercises[exIndex];
            if (!defaultExercise) return;
            // Use the selected exercise if it exists, otherwise use the default
            const exerciseName = progress.sets[exIndex].selectedExercise || defaultExercise.name;

            Object.keys(progress.sets[exIndex]).forEach(setIndex => {
                if (setIndex === 'selectedExercise') return; // Skip our custom
