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

// --- INITIALIZATION ---
window.gapiLoaded = () => gapi.load('client', initializeGapiClient);
window.gisLoaded = () => {
    tokenClient = google.accounts.oauth2.initTokenClient({ client_id: GOOGLE_CONFIG.CLIENT_ID, scope: GOOGLE_CONFIG.SCOPES, callback: handleAuthResponse, });
    gisInited = true; checkInitialAuth();
};
async function initializeGapiClient() {
    await gapi.client.init({ discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"] });
    gapiInited = true; checkInitialAuth();
}
function checkInitialAuth() {
    if (gapiInited && gisInited) {
        updateSigninStatus(gapi.client.getToken() !== null);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadCurrentUser();
    workoutProgress = JSON.parse(localStorage.getItem('workoutProgress')) || {};
});

// --- EVENT LISTENERS ---
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', e => { e.preventDefault(); showPage(link.dataset.page); }));
    document.querySelectorAll('.day-card').forEach(card => card.addEventListener('click', () => startWorkout(card.dataset.day)));
    document.getElementById('backToHomeBtn').addEventListener('click', () => showPage('homeScreen'));
    // User Management
    document.querySelectorAll('.user-card').forEach(card => card.addEventListener('click', () => selectUser(card.dataset.user)));
    // Auth and Sync
    document.querySelectorAll('[id^="authorizeBtn"]').forEach(btn => btn.addEventListener('click', handleAuthClick));
    document.getElementById('globalSyncBtn').addEventListener('click', syncWorkoutData);
    // Workout Controls
    document.getElementById('resetWorkoutBtn').addEventListener('click', resetCurrentWorkout);
    document.getElementById('workoutNotes').addEventListener('input', saveNotes);
    // Dashboard Controls
    document.getElementById('analyzeProgressBtn').addEventListener('click', analyzeProgressWithAI);
    document.getElementById('clearSheetBtn').addEventListener('click', clearGoogleSheet);
    document.getElementById('dateRangeFilter').addEventListener('change', handleDateRangeChange);
    ['bodyPartFilter', 'exerciseFilter', 'startDateFilter', 'endDateFilter'].forEach(id => document.getElementById(id)?.addEventListener('change', renderDashboard));
    // AI Chat
    setupAIChatListeners();
}

// --- USER & AUTH ---
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
        renderDashboard();
    }
}
function handleAuthClick() {
    if (gapiInited && gisInited) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        showNotification("Google API not ready. Please try again in a moment.", "error");
    }
}
function handleAuthResponse(resp) {
    if (resp.error) {
        console.error('Auth Error:', resp);
        showNotification("Authorization failed.", "error");
        return;
    }
    updateSigninStatus(true);
}
function updateSigninStatus(isSignedIn) {
    document.querySelectorAll('[id^="authorizeBtn"]').forEach(btn => btn.classList.toggle('hidden', isSignedIn));
    document.getElementById('globalSyncBtn').classList.toggle('hidden', !isSignedIn);
    ['analyzeProgressBtn', 'clearSheetBtn', 'globalSyncBtn'].forEach(id => {
        document.getElementById(id).disabled = !isSignedIn;
    });

    if (isSignedIn && document.getElementById('dashboardScreen').classList.contains('active')) {
        fetchDashboardData();
    }
}

// --- UI & WORKOUT LOGIC ---
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.page === pageId));
    if (pageId === 'dashboardScreen' && gapi.client.getToken()) {
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
    const container = document.getElementById('exerciseListContainer'); container.innerHTML = '';
    workout.exercises.forEach((exercise, i) => {
        const setsHtml = Array.from({ length: exercise.sets }, (_, j) => {
            const p = workoutProgress[currentDay]?.sets?.[i]?.[j] || {};
            return `<div class="set-row ${p.completed ? 'completed' : ''}" data-ex="${i}" data-set="${j}"><input type="checkbox" class="set-checkbox" ${p.completed ? 'checked' : ''}><span>Set ${j + 1}</span><input type="number" class="set-input" placeholder="kg" value="${p.weight || ''}"><input type="number" class="set-input" placeholder="reps" value="${p.reps || ''}"></div>`;
        }).join('');
        container.innerHTML += `<div class="exercise-card"><h3>${exercise.name}</h3>${setsHtml}</div>`;
    });
    document.getElementById('workoutNotes').value = workoutProgress[currentDay]?.notes || '';
    container.querySelectorAll('.set-checkbox, .set-input').forEach(el => el.addEventListener('change', handleSetChange));
}
function handleSetChange(e) {
    const row = e.target.closest('.set-row'); const { ex, set } = row.dataset;
    workoutProgress[currentDay] = workoutProgress[currentDay] || { date: new Date().toISOString().split('T')[0], sets: {}, notes: '' };
    workoutProgress[currentDay].sets = workoutProgress[currentDay].sets || {}; workoutProgress[currentDay].sets[ex] = workoutProgress[currentDay].sets[ex] || {};
    workoutProgress[currentDay].sets[ex][set] = { completed: row.querySelector('.set-checkbox').checked, weight: row.querySelector('input[placeholder="kg"]').value, reps: row.querySelector('input[placeholder="reps"]').value, };
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
    if (workoutProgress[currentDay]) { delete workoutProgress[currentDay]; localStorage.setItem('workoutProgress', JSON.stringify(workoutProgress)); loadWorkoutUI(); showNotification("Workout session has been reset.", "info"); }
}

// --- DATA & SYNC ---
async function syncWorkoutData() {
    if (!gapi.client.getToken()) return showNotification("Please authorize first.", "error");
    const dataToSync = prepareDataForSheets();
    if (dataToSync.length === 0) return showNotification("No pending workouts to sync.", "info");
    showNotification("Syncing workouts...", "info");
    try {
        await gapi.client.sheets.spreadsheets.values.append({ spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID, range: 'WorkoutLog!A1', valueInputOption: 'USER_ENTERED', insertDataOption: 'INSERT_ROWS', resource: { values: dataToSync }, });
        showNotification("Workouts synced successfully!", "success");
        const syncedDays = [...new Set(dataToSync.map(row => Object.keys(workoutData).find(day => workoutData[day].name === row[1])))];
        syncedDays.forEach(day => { if (day && workoutProgress[day]) delete workoutProgress[day]; });
        localStorage.setItem('workoutProgress', JSON.stringify(workoutProgress));
    } catch (error) { console.error('Sync Error:', error); showNotification("Sync failed. Check console.", "error"); }
}
function prepareDataForSheets() {
    const rows = [];
    for (const dayKey in workoutProgress) {
        const workout = workoutData[dayKey]; const progress = workoutProgress[dayKey]; if (!workout || !progress.sets) continue;
        let hasCompletedSets = false;
        Object.keys(progress.sets).forEach(exIndex => Object.keys(progress.sets[exIndex]).forEach(setIndex => { if (progress.sets[exIndex][setIndex].completed) hasCompletedSets = true; }));
        if (hasCompletedSets) {
            const workoutNotes = progress.notes || '';
            let noteAdded = false;
            Object.keys(progress.sets).forEach(exIndex => Object.keys(progress.sets[exIndex]).forEach(setIndex => {
                const set = progress.sets[exIndex][setIndex];
                if (set.completed) {
                    rows.push([progress.date, workout.name, workout.bodyPart, workout.exercises[exIndex].name, set.weight || 0, set.reps || 0, currentUser, noteAdded ? "" : workoutNotes]);
                    noteAdded = true;
                }
            }));
        }
    }
    return rows;
}
async function clearGoogleSheet() {
    if (!gapi.client.getToken()) return showNotification("Please authorize first.", "error");
    if (!confirm(`This will delete ALL data for BOTH users from the Google Sheet. This action cannot be undone. Are you sure?`)) return;
    showNotification("Clearing sheet data...", "info");
    try {
        await gapi.client.sheets.spreadsheets.values.clear({ spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID, range: 'WorkoutLog!A2:H' });
        sheetData = []; renderDashboard(); showNotification("All data has been cleared from your Google Sheet.", "success");
    } catch (err) { console.error("Error clearing sheet:", err); showNotification("Failed to clear sheet data.", "error"); }
}

// --- DASHBOARD ---
async function fetchDashboardData() {
    if (!gapi.client.getToken()) { document.getElementById('dashboardContent').innerHTML = `<div class="dashboard-card"><p>Please authorize to view dashboard.</p></div>`; return; }
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({ spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID, range: 'WorkoutLog!A2:H' });
        sheetData = (response.result.values || []).map(row => ({ date: new Date(row[0]), bodyPart: row[2], exercise: row[3], weight: parseFloat(row[4]) || 0, reps: parseInt(row[5]) || 0, user: row[6], notes: row[7] }));
        populateBodyPartFilter(); handleDateRangeChange();
    } catch (err) { console.error("Error fetching data:", err); }
}
function handleDateRangeChange() {
    const range = document.getElementById('dateRangeFilter').value;
    const customContainer = document.getElementById('customDateContainer');
    customContainer.classList.toggle('hidden', range !== 'custom');
    if (range !== 'custom') {
        const endDate = new Date();
        const startDate = new Date();
        if (range !== 'all') startDate.setDate(endDate.getDate() - parseInt(range));
        document.getElementById('endDateFilter').valueAsDate = endDate;
        document.getElementById('startDateFilter').valueAsDate = range === 'all' ? null : startDate;
    }
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
    const bodyPart = document.getElementById('bodyPartFilter').value; const exercise = document.getElementById('exerciseFilter').value;
    const startDateVal = document.getElementById('startDateFilter').value; const endDateVal = document.getElementById('endDateFilter').value;
    const startDate = startDateVal ? new Date(startDateVal) : null; const endDate = endDateVal ? new Date(endDateVal) : null;
    if (startDate) startDate.setHours(0, 0, 0, 0); if (endDate) endDate.setHours(23, 59, 59, 999);
    const data = sheetData.filter(row => row.user === currentUser && (bodyPart === 'all' || row.bodyPart === bodyPart) && (exercise === 'all' || row.exercise === exercise) && (!startDate || new Date(row.date) >= startDate) && (!endDate || new Date(row.date) <= endDate));
    const container = document.getElementById('dashboardContent');
    if (data.length === 0) { container.innerHTML = `<div class="dashboard-card"><p>No data for this selection.</p></div>`; return; }
    const e1RM = (w, r) => r > 0 ? w * (1 + r / 30) : 0; data.forEach(row => row.e1RM = e1RM(row.weight, row.reps));
    const bestSet = data.reduce((max, row) => row.e1RM > max.e1RM ? row : max, { e1RM: 0 });
    const progressData = data.filter(row => row.exercise === bestSet.exercise).sort((a, b) => a.date - b.date);
    const strengthChange = progressData.length > 1 ? ((progressData[progressData.length - 1].e1RM - progressData[0].e1RM) / progressData[0].e1RM * 100).toFixed(1) : 0;
    container.innerHTML = `<div class="dashboard-card"><h3>Best Lift</h3><p style="font-size: 2rem; font-weight: 700;">${bestSet.weight} kg x ${bestSet.reps} reps</p><small>${bestSet.exercise}</small></div><div class="dashboard-card"><h3>Est. 1-Rep Max</h3><p style="font-size: 2rem; font-weight: 700;">${bestSet.e1RM.toFixed(1)} kg</p><small>Your estimated strength score.</small></div><div class="dashboard-card tip-card"><h3><i class="fas fa-lightbulb"></i>Quick Tip</h3><p>${generateAITip(strengthChange, bestSet.reps)}</p></div><div id="aiAnalysisCard" class="dashboard-card" style="grid-column: 1 / -1; display: none;"><h3>AI Analysis</h3><div id="aiAnalysisContent"></div></div><div class="dashboard-card" style="grid-column: 1 / -1;"><div class="chart-container"><canvas id="progressChart"></canvas></div></div>`;
    renderProgressChart(progressData, 'progressChart');
}
function renderProgressChart(data, canvasId) { if (chartInstances[canvasId]) chartInstances[canvasId].destroy(); const ctx = document.getElementById(canvasId)?.getContext('2d'); if (!ctx) return; chartInstances[canvasId] = new Chart(ctx, { type: 'line', data: { labels: data.map(d => d.date.toLocaleDateString()), datasets: [{ label: 'Estimated 1RM (kg)', data: data.map(d => d.e1RM.toFixed(1)), borderColor: 'var(--primary-color)', tension: 0.1, fill: true, }] }, options: { responsive: true, maintainAspectRatio: false } }); }
function generateAITip(change, reps) { if (change > 5) return `Incredible progress! Your strength has increased by ${change}%. Consider a slight weight increase to continue this trend.`; if (change > 0) return `Nice work, you're making steady gains. Keep up the consistency.`; if (reps < 6) return "You're lifting heavy! To maximize muscle growth, ensure you're also incorporating sets in the 8-12 rep range."; if (reps > 15) return "Great endurance! To build more top-end strength, try increasing the weight so your reps fall in the 6-10 range."; return "Consistency is key. You're laying the foundation for future progress. Keep showing up!"; }

// --- AI FEATURES ---
async function analyzeProgressWithAI() {
    if (!gapi.client.getToken()) return showNotification("Please authorize first.", "error");
    const exercise = document.getElementById('exerciseFilter').value;
    if (exercise === 'all') { showNotification("Please select a specific exercise to analyze.", "info"); return; }
    const analysisCard = document.getElementById('aiAnalysisCard'); const analysisContent = document.getElementById('aiAnalysisContent');
    analysisCard.style.display = 'block'; analysisContent.innerHTML = '<p>AI is analyzing your progress...</p>';
    const data = sheetData.filter(row => row.user === currentUser && row.exercise === exercise).sort((a, b) => a.date - b.date);
    if(data.length < 2) { analysisContent.innerHTML = '<p>Not enough data to analyze. Please complete at least two sessions for this exercise.</p>'; return; }
    const summary = `User: ${currentUser}. Exercise: ${exercise}. Performance History (last 5 sessions): ${data.slice(-5).map(d => `${d.date.toLocaleDateString()}: ${d.weight}kg x ${d.reps}reps`).join(', ')}`;
    try {
        const response = await fetch('/.netlify/functions/ask-ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'analysis', payload: summary }) });
        if (!response.ok) throw new Error('AI analysis failed.');
        const { message } = await response.json();
        analysisContent.innerHTML = message.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    } catch (error) { analysisContent.innerHTML = '<p>Sorry, the AI analysis could not be completed at this time.</p>'; }
}
function setupAIChatListeners() {
    const chatModal = document.getElementById('aiChatModal');
    document.getElementById('chatToggleBtn').addEventListener('click', () => chatModal.classList.add('active'));
    document.getElementById('closeChatBtn').addEventListener('click', () => chatModal.classList.remove('active'));
    document.getElementById('sendChatBtn').addEventListener('click', sendChatMessage);
    document.getElementById('chatInput').addEventListener('keypress', e => { if (e.key === 'Enter') sendChatMessage(); });
}
function addChatMessage(message, sender) { const container = document.getElementById('chatMessages'); const msgDiv = document.createElement('div'); msgDiv.className = `${sender}-message`; msgDiv.innerHTML = `<p>${message}</p>`; container.appendChild(msgDiv); container.scrollTop = container.scrollHeight; }
async function sendChatMessage() {
    const input = document.getElementById('chatInput'), userMessage = input.value.trim(); if (!userMessage) return;
    addChatMessage(userMessage, 'user'); input.value = ''; addChatMessage("<i>AI is thinking...</i>", 'ai');
    try {
        const response = await fetch('/.netlify/functions/ask-ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'chat', payload: userMessage }), });
        if (!response.ok) throw new Error(`Function Error: ${response.statusText}`);
        const data = await response.json(); document.querySelector('.ai-message:last-child').remove(); addChatMessage(data.message.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'), 'ai');
    } catch (error) { console.error('AI Chat Error:', error); document.querySelector('.ai-message:last-child').remove(); addChatMessage("Sorry, I'm having trouble connecting right now.", 'ai'); }
}

// --- UTILITIES ---
function showNotification(message, type = 'info') { const el = document.createElement('div'); el.className = `notification ${type}`; el.textContent = message; el.style.cssText = `position: fixed; top: 20px; right: 20px; background-color: ${type === 'error' ? 'var(--danger-color)' : type === 'success' ? '#0F9D58' : 'var(--primary-color)'}; color: white; padding: 12px 24px; border-radius: 8px; box-shadow: var(--shadow); z-index: 2000; opacity: 0; transition: all 0.3s; transform: translateY(-10px);`; document.body.appendChild(el); setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, 10); setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 4000); }
