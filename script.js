// ==========================================
// CONFIGURATION & STATE
// ==========================================
const GOOGLE_CONFIG = {
    CLIENT_ID: '1040913543341-0vj52ims83dkcudpvh6rdtvrvr5da5nn.apps.googleusercontent.com',
    SPREADSHEET_ID: '15O-z40Jsy2PFs0XaXle07g_hJuwBCgpEi399TC9Yaic',
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

// --- INITIALIZATION & CORE APP LOGIC ---
window.gapiLoaded = () => gapi.load('client', initializeGapiClient);
window.gisLoaded = () => {
    tokenClient = google.accounts.oauth2.initTokenClient({ client_id: GOOGLE_CONFIG.CLIENT_ID, scope: GOOGLE_CONFIG.SCOPES, callback: handleAuthResponse });
    gisInited = true; checkAuthButton();
};
async function initializeGapiClient() {
    await gapi.client.init({ discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"] });
    gapiInited = true; checkAuthButton();
}
document.addEventListener('DOMContentLoaded', () => {
    loadCurrentUser();
    workoutProgress = JSON.parse(localStorage.getItem('workoutProgress')) || {};
    setupEventListeners();
    showPage('homeScreen');
    handleDateRangeChange();
});

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', e => { e.preventDefault(); showPage(link.dataset.page); }));
    document.getElementById('backToHomeBtn').addEventListener('click', () => showPage('homeScreen'));
    document.querySelectorAll('.day-card').forEach(card => card.addEventListener('click', () => startWorkout(card.dataset.day)));
    
    // User Management
    document.querySelectorAll('.user-card').forEach(card => card.addEventListener('click', () => selectUser(card.dataset.user)));
    
    // Auth and Sync
    document.getElementById('authorizeBtn').addEventListener('click', handleAuthClick);
    document.getElementById('globalSyncBtn').addEventListener('click', syncWorkoutData);
    
    // Workout Controls
    document.getElementById('resetWorkoutBtn').addEventListener('click', resetCurrentWorkout);
    document.getElementById('workoutNotes').addEventListener('input', saveNotes);

    // Dashboard Controls
    document.getElementById('analyzeProgressBtn').addEventListener('click', analyzeProgressWithAI);
    document.getElementById('clearSheetBtn').addEventListener('click', clearGoogleSheet);
    document.getElementById('dateRangeFilter').addEventListener('change', handleDateRangeChange);
    ['bodyPartFilter', 'exerciseFilter', 'startDateFilter', 'endDateFilter'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener('change', renderDashboard);
    });

    // AI Chat
    setupAIChatListeners();
}

// --- USER MANAGEMENT ---
function loadCurrentUser() {
    currentUser = localStorage.getItem('currentUser') || 'Harjas';
    document.querySelectorAll('.user-card').forEach(card => card.classList.toggle('active', card.dataset.user === currentUser));
    document.getElementById('workout-section-title').textContent = `Select Workout for ${currentUser}`;
}
function selectUser(user) {
    currentUser = user;
    localStorage.setItem('currentUser', user);
    loadCurrentUser();
    if (document.getElementById('dashboardScreen').classList.contains('active')) {
        fetchDashboardData();
    }
}

// --- UI & NAVIGATION ---
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.page === pageId));
    if (pageId === 'dashboardScreen' && sheetData.length === 0) {
        fetchDashboardData();
    }
}
function startWorkout(day) {
    currentDay = day;
    loadWorkoutUI();
    showPage('workoutScreen');
}
function loadWorkoutUI() {
    const workout = workoutData[currentDay];
    document.getElementById('currentWorkoutTitle').textContent = workout.name;
    const container = document.getElementById('exerciseListContainer');
    container.innerHTML = '';
    workout.exercises.forEach((exercise, i) => {
        const setsHtml = Array.from({ length: exercise.sets }, (_, j) => {
            const p = workoutProgress[currentDay]?.sets?.[i]?.[j] || {};
            return `<div class="set-row ${p.completed ? 'completed' : ''}" data-ex="${i}" data-set="${j}">
                <input type="checkbox" class="set-checkbox" ${p.completed ? 'checked' : ''}><span>Set ${j + 1}</span>
                <input type="number" class="set-input" placeholder="kg" value="${p.weight || ''}"><input type="number" class="set-input" placeholder="reps" value="${p.reps || ''}"></div>`;
        }).join('');
        container.innerHTML += `<div class="exercise-card"><h3>${exercise.name}</h3>${setsHtml}</div>`;
    });
    // Load notes for the current day
    document.getElementById('workoutNotes').value = workoutProgress[currentDay]?.notes || '';
    container.querySelectorAll('.set-checkbox, .set-input').forEach(el => el.addEventListener('change', handleSetChange));
}

function handleSetChange(e) {
    const row = e.target.closest('.set-row');
    const { ex, set } = row.dataset;
    workoutProgress[currentDay] = workoutProgress[currentDay] || { date: new Date().toISOString().split('T')[0], sets: {}, notes: '' };
    workoutProgress[currentDay].sets = workoutProgress[currentDay].sets || {};
    workoutProgress[currentDay].sets[ex] = workoutProgress[currentDay].sets[ex] || {};
    workoutProgress[currentDay].sets[ex][set] = {
        completed: row.querySelector('.set-checkbox').checked,
        weight: row.querySelector('input[placeholder="kg"]').value,
        reps: row.querySelector('input[placeholder="reps"]').value,
    };
    row.classList.toggle('completed', workoutProgress[currentDay].sets[ex][set].completed);
    localStorage.setItem('workoutProgress', JSON.stringify(workoutProgress));
}

function saveNotes(e) {
    if (!currentDay) return;
    workoutProgress[currentDay] = workoutProgress[currentDay] || { date: new Date().toISOString().split('T')[0], sets: {}, notes: '' };
    workoutProgress[currentDay].notes = e.target.value;
    localStorage.setItem('workoutProgress', JSON.stringify(workoutProgress));
}

function resetCurrentWorkout() {
    if (!confirm("Are you sure you want to reset all entries for this workout session? This will not affect your Google Sheet.")) return;
    if (workoutProgress[currentDay]) {
        delete workoutProgress[currentDay];
        localStorage.setItem('workoutProgress', JSON.stringify(workoutProgress));
        loadWorkoutUI();
        showNotification("Workout session has been reset.", "info");
    }
}

// --- AUTHENTICATION & SYNC ---
function checkAuthButton() { if (gapiInited && gisInited) document.getElementById('authorizeBtn').style.visibility = 'visible'; }
function handleAuthClick() { if (gapi.client.getToken() === null) tokenClient.requestAccessToken({ prompt: 'consent' }); }
function handleAuthResponse(resp) {
    if (resp.error) throw resp;
    updateSigninStatus(true);
}
function updateSigninStatus(isSignedIn) {
    document.getElementById('authorizeBtn').style.display = isSignedIn ? 'none' : 'block';
    document.getElementById('globalSyncBtn').style.display = isSignedIn ? 'flex' : 'none';
}

async function syncWorkoutData() {
    if (!gapi.client.getToken()) return showNotification("Please authorize first.", "error");
    const dataToSync = prepareDataForSheets();
    if (dataToSync.length === 0) return showNotification("No pending workouts to sync.", "info");
    showNotification("Syncing workout...", "info");
    try {
        await gapi.client.sheets.spreadsheets.values.append({ spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID, range: 'WorkoutLog!A1', valueInputOption: 'USER_ENTERED', insertDataOption: 'INSERT_ROWS', resource: { values: dataToSync }, });
        showNotification("Workouts synced successfully!", "success");
        // Clear only the workouts that were synced
        const syncedDays = [...new Set(dataToSync.map(row => Object.keys(workoutData).find(day => workoutData[day].name === row[1])))];
        syncedDays.forEach(day => {
            if (day && workoutProgress[day]) delete workoutProgress[day];
        });
        localStorage.setItem('workoutProgress', JSON.stringify(workoutProgress));
    } catch (error) { console.error('Sync Error:', error); showNotification("Sync failed. Check console.", "error"); }
}

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
                if (set.completed) {
                    rows.push([progress.date, workout.name, workout.bodyPart, workout.exercises[exIndex].name, set.weight || 0, set.reps || 0, currentUser, progress.notes || '']);
                    hasCompletedSets = true;
                }
            });
        });
        // Ensure notes are only synced if there are completed sets
        if (hasCompletedSets) {
            rows.forEach(row => {
                if (workoutData[dayKey].name === row[1]) row[7] = progress.notes || '';
            });
        }
    }
    // Remove duplicate entries before returning
    return [...new Map(rows.map(item => [item.join(), item])).values()];
}

async function clearGoogleSheet() {
    if (!confirm(`This will delete ALL data for BOTH users from the Google Sheet. This action cannot be undone. Are you sure?`)) return;
    if (!gapi.client.getToken()) return showNotification("Please authorize first.", "error");
    showNotification("Clearing sheet data...", "info");
    try {
        await gapi.client.sheets.spreadsheets.values.clear({ spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID, range: 'WorkoutLog!A2:H' });
        sheetData = [];
        renderDashboard();
        showNotification("All data has been cleared from your Google Sheet.", "success");
    } catch (err) { console.error("Error clearing sheet:", err); showNotification("Failed to clear sheet data.", "error"); }
}

// --- DASHBOARD & ANALYTICS ---
async function fetchDashboardData() {
    if (!gapi.client.getToken()) { document.getElementById('dashboardContent').innerHTML = `<div class="dashboard-card"><p>Please authorize to view dashboard.</p></div>`; return; }
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({ spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID, range: 'WorkoutLog!A2:H' });
        sheetData = (response.result.values || []).map(row => ({ date: new Date(row[0]), bodyPart: row[2], exercise: row[3], weight: parseFloat(row[4]) || 0, reps: parseInt(row[5]) || 0, user: row[6], notes: row[7] }));
        populateBodyPartFilter();
        handleDateRangeChange();
    } catch (err) { console.error("Error fetching data:", err); }
}

function handleDateRangeChange() {
    const range = document.getElementById('dateRangeFilter').value;
    const customDateContainer = document.getElementById('customDateContainer');
    const startDateInput = document.getElementById('startDateFilter');
    const endDateInput = document.getElementById('endDateFilter');
    
    if (range === 'custom') {
        customDateContainer.classList.remove('hidden');
        renderDashboard();
        return;
    }
    customDateContainer.classList.add('hidden');
    
    const endDate = new Date();
    const startDate = new Date();
    if (range !== 'all') {
        startDate.setDate(endDate.getDate() - parseInt(range));
    }
    
    endDateInput.valueAsDate = endDate;
    startDateInput.valueAsDate = range === 'all' ? null : startDate;
    
    renderDashboard();
}
function populateBodyPartFilter() {
    const bodyParts = [...new Set(sheetData.filter(row => row.user === currentUser).map(row => row.bodyPart))].filter(Boolean);
    const filter = document.getElementById('bodyPartFilter'); filter.innerHTML = '<option value="all">All Body Parts</option>';
    bodyParts.forEach(bp => filter.innerHTML += `<option value="${bp}">${bp}</option>`);
    populateExerciseFilter();
}
function populateExerciseFilter() {
    const bodyPart = document.getElementById('bodyPartFilter').value;
    const exercises = [...new Set(sheetData.filter(row => row.user === currentUser && (bodyPart === 'all' || row.bodyPart === bodyPart)).map(row => row.exercise))].filter(Boolean);
    const filter = document.getElementById('exerciseFilter'); filter.innerHTML = '<option value="all">All Exercises</option>';
    exercises.forEach(ex => filter.innerHTML += `<option value="${ex}">${ex}</option>`);
    filter.disabled = false;
}

function renderDashboard() {
    // ... (This function is long, its logic remains the same. Included in full for completeness)
    const bodyPart = document.getElementById('bodyPartFilter').value, exercise = document.getElementById('exerciseFilter').value;
    const startDateVal = document.getElementById('startDateFilter').value, endDateVal = document.getElementById('endDateFilter').value;
    const startDate = startDateVal ? new Date(startDateVal) : null, endDate = endDateVal ? new Date(endDateVal) : null;
    if(startDate) startDate.setHours(0, 0, 0, 0);
    if (endDate) endDate.setHours(23, 59, 59, 999);
    
    const data = sheetData.filter(row => row.user === currentUser && (bodyPart === 'all' || row.bodyPart === bodyPart) && (exercise === 'all' || row.exercise === exercise) && (!startDate || new Date(row.date) >= startDate) && (!endDate || new Date(row.date) <= endDate));
    const container = document.getElementById('dashboardContent');
    if (data.length === 0) { container.innerHTML = `<div class="dashboard-card"><p>No data for this selection.</p></div>`; return; }
    const e1RM = (w, r) => r > 0 ? w * (1 + r / 30) : 0;
    data.forEach(row => row.e1RM = e1RM(row.weight, row.reps));
    const bestSet = data.reduce((max, row) => row.e1RM > max.e1RM ? row : max, { e1RM: 0 });
    const progressData = data.filter(row => row.exercise === bestSet.exercise).sort((a, b) => a.date - b.date);
    const strengthChange = progressData.length > 1 ? ((progressData[progressData.length - 1].e1RM - progressData[0].e1RM) / progressData[0].e1RM * 100).toFixed(1) : 0;
    container.innerHTML = `<div class="dashboard-card"><h3>Best Lift</h3><p style="font-size: 2rem; font-weight: 700;">${bestSet.weight} kg x ${bestSet.reps} reps</p><small>${bestSet.exercise}</small></div><div class="dashboard-card"><h3>Est. 1-Rep Max</h3><p style="font-size: 2rem; font-weight: 700;">${bestSet.e1RM.toFixed(1)} kg</p><small>Your estimated strength score.</small></div><div class="dashboard-card tip-card"><h3><i class="fas fa-lightbulb"></i>Quick Tip</h3><p>${generateAITip(strengthChange, bestSet.reps)}</p></div><div id="aiAnalysisCard" class="dashboard-card" style="grid-column: 1 / -1; display: none;"><h3>AI Analysis</h3><div id="aiAnalysisContent"></div></div><div class="dashboard-card" style="grid-column: 1 / -1;"><div class="chart-container"><canvas id="progressChart"></canvas></div></div>`;
    renderProgressChart(progressData, 'progressChart');
}

function renderProgressChart(data, canvasId) { /* ... same as before ... */ }
function generateAITip(change, reps) { /* ... same as before ... */ }

// --- AI FEATURES ---
async function analyzeProgressWithAI() {
    // ... logic remains the same, calling unified ask-ai function
    const exercise = document.getElementById('exerciseFilter').value;
    if (exercise === 'all') { showNotification("Please select a specific exercise to analyze.", "info"); return; }
    const analysisCard = document.getElementById('aiAnalysisCard'); const analysisContent = document.getElementById('aiAnalysisContent');
    analysisCard.style.display = 'block'; analysisContent.innerHTML = '<p>AI is analyzing your progress...</p>';
    const data = sheetData.filter(row => row.user === currentUser && row.exercise === exercise).sort((a, b) => a.date - b.date);
    const summary = `User: ${currentUser}. Exercise: ${exercise}. Performance History (last 5 sessions): ${data.slice(-5).map(d => `${d.date.toLocaleDateString()}: ${d.weight}kg x ${d.reps}reps`).join(', ')}`;
    try {
        const response = await fetch('/.netlify/functions/ask-ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'analysis', payload: summary }) });
        if (!response.ok) throw new Error('AI analysis failed.');
        const { message } = await response.json();
        analysisContent.innerHTML = message.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    } catch (error) { analysisContent.innerHTML = '<p>Sorry, the AI analysis could not be completed at this time.</p>'; }
}
function setupAIChatListeners() { /* ... same as before ... */ }
function addChatMessage(message, sender) { /* ... same as before ... */ }
async function sendChatMessage() { /* ... same as before ... */ }
function showNotification(message, type = 'info') { /* ... same as before ... */ }
