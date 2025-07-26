'use strict';

// === 1. CONFIGURATION & GLOBAL STATE ===
const GOOGLE_CONFIG = {
    CLIENT_ID: '1040913543341-0vj52ims83dkcudpvh6rdtvrvr5da5nn.apps.googleusercontent.com',
    SPREADSHEET_ID: '15O-z40Jsy2PFs0XaXle07g_hJuwBCgpEi399TC9Yaic',
    SCOPES: 'https://www.googleapis.com/auth/spreadsheets',
};

const workoutData = {
    1: { name: "Push Day 1", bodyPart: "Push", exercises: [
        { name: "BB Flat Bench Press", sets: 4, reps: "10, 8, 6, 4", alternatives: ["Machine bench press", "incline bench press", "db flat bench press"] },
        { name: "DB Incline Press", sets: 3, reps: "12, 8, 6", alternatives: ["Incline bench press", "machine incline bench press", "flat db bench press"] },
        { name: "DB Shoulder Press", sets: 4, reps: "15, 12, 10, 6", alternatives: ["Machine shoulder press", "barbell shoulder press", "shoulder front raises"] },
        { name: "Cable Straight Pushdown", sets: 3, reps: "15, 12, 10 + drop", alternatives: ["Rope pushdowns", "single hand cable pushdowns", "skull crushers"] },
        { name: "DB Lateral Raises", sets: 4, reps: "12, 10, 8, complex", alternatives: ["Upright rows", "laying lateral raises"] },
        { name: "Overhead Tricep Extension", sets: 3, reps: "15, 12, 10", alternatives: ["Rope pushdowns", "skull crushers"] },
        { name: "Cable Chest Fly", sets: 3, reps: "20, 16, 12", alternatives: ["Machine fly", "db fly"] }
    ]},
    2: { name: "Pull Day 1", bodyPart: "Pull", exercises: [
        { name: "Lat Pulldown", sets: 4, reps: "12, 10, 6, 6 peak", alternatives: ["DB row", "barbell row", "pull ups"] },
        { name: "Deadlift", sets: 4, reps: "10, 8, 6, 4", alternatives: ["Back extension", "db deadlift"] },
        { name: "Seated Close Grip Row", sets: 4, reps: "12, 10, 10, 10 peak", alternatives: ["Row with narrow bar", "row with wide bar", "db and bb row"] },
        { name: "Rope Pull Overs", sets: 3, reps: "16, 12, 10", alternatives: ["Pull over with db"] },
        { name: "DB Hammer Curls", sets: 3, reps: "15, 12, 10", alternatives: ["DB curls", "preacher curls"] },
        { name: "Preacher Curls", sets: 4, reps: "16, 12, 10, 8", alternatives: ["DB curls", "seated curls"] },
        { name: "Barbell Curls", sets: 2, reps: "20, 15", alternatives: ["Supinated curls", "cable curls"] }
    ]},
    3: { name: "Leg Day", bodyPart: "Legs", exercises: [
        { name: "BB Squat", sets: 4, reps: "15, 10, 6, 4", alternatives: ["Hack squats", "leg press"] },
        { name: "Lunges", sets: 3, reps: "8 strides/leg", alternatives: ["Reverse squat", "romanian deadlift"] },
        { name: "Sumo Stance Leg Press", sets: 3, reps: "12, 10, 8", alternatives: ["Glute bridges", "goblet squat", "sumo squat"] },
        { name: "Hamstring Curls", sets: 3, reps: "15, 12, 10", alternatives: ["Reverse hamstring curls"] },
        { name: "Legs Extension", sets: 3, reps: "15, 12, 10", alternatives: ["Adductors", "hack squat full depth"] },
        { name: "Calf Raises", sets: 4, reps: "25, 20, 20, 15", alternatives: ["Seated calf raises"] }
    ]},
    4: { name: "Push Day 2", bodyPart: "Push", exercises: [
        { name: "BB Incline Bench", sets: 2, reps: "12, 10", alternatives: ["Machine bench press", "db flat bench press"] },
        { name: "Cambered Bar Front Raise", sets: 3, reps: "15, 12, 10", alternatives: ["DB front raise", "plate front raise"] },
        { name: "Cable Rope Face Pulls w/ Rear Delt Fly", sets: 3, reps: "12, 10, 8 each", alternatives: ["Bent over delt fly"] },
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
        { name: "Superset: Cable EZ Bar Curls / Tricep Pushdowns", sets: 4, reps: "15-15...", alternatives: [] },
        { name: "Superset: Preacher Curls / Overhead Tricep Extension", sets: 3, reps: "12-12...", alternatives: [] },
        { name: "Superset: Wide Grip Bar Curls / Rope Pushdowns", sets: 2, reps: "5p 10f - 10...", alternatives: [] },
        { name: "Superset: Hammer Curls Drop Set / Single Arm Tricep", sets: 2, reps: "(15, 12, 10)...", alternatives: [] }
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

// === 2. GOOGLE API INITIALIZATION (GLOBAL SCOPE) ===
window.gapiLoaded = () => {
    gapi.load('client', initializeGapiClient);
};

window.gisLoaded = () => {
    try {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CONFIG.CLIENT_ID,
            scope: GOOGLE_CONFIG.SCOPES,
            callback: handleAuthResponse,
        });
        gisInited = true;
        checkApiReady();
    } catch (e) {
        showNotification("Critical Error: Could not initialize Google Sign-In.", "error");
    }
};

async function initializeGapiClient() {
    try {
        await gapi.client.init({
            discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
        });
        gapiInited = true;
        checkApiReady();
    } catch (e) {
        showNotification("Critical Error: Could not initialize Google Sheets API.", "error");
    }
}

function checkApiReady() {
    if (gapiInited && gisInited) {
        isApiReady = true;
        updateAuthorizeButtons(true, "Authorize");
        const token = gapi.client.getToken();
        updateSigninStatus(token !== null);
    }
}

// === 3. MAIN APP LOGIC (RUNS AFTER DOM IS READY) ===
document.addEventListener('DOMContentLoaded', () => {

    const elements = {
        navLinks: document.querySelectorAll('.nav-link'),
        userCards: document.querySelectorAll('.user-card'),
        pages: document.querySelectorAll('.page'),
        workoutGrid: document.getElementById('workoutGrid'),
        exerciseListContainer: document.getElementById('exerciseListContainer'),
        currentWorkoutTitle: document.getElementById('currentWorkoutTitle'),
        workoutNotes: document.getElementById('workoutNotes'),
        dashboardContent: document.getElementById('dashboardContent'),
        dateRangeFilter: document.getElementById('dateRangeFilter'),
        bodyPartFilter: document.getElementById('bodyPartFilter'),
        exerciseFilter: document.getElementById('exerciseFilter'),
        workoutSectionTitle: document.getElementById('workout-section-title'),
        aiChatModal: document.getElementById('aiChatModal'),
        chatInput: document.getElementById('chatInput'),
        chatMessages: document.getElementById('chatMessages')
    };

    function setupEventListeners() {
        elements.navLinks.forEach(link => link.addEventListener('click', e => { e.preventDefault(); showPage(link.dataset.page); }));
        elements.userCards.forEach(card => card.addEventListener('click', () => selectUser(card.dataset.user)));
        document.getElementById('backToHomeBtn').addEventListener('click', () => showPage('homeScreen'));
        document.querySelectorAll('[id^="authorizeBtn"]').forEach(btn => btn.addEventListener('click', handleAuthClick));
        document.querySelectorAll('[id^="syncBtn"], #globalSyncBtn').forEach(btn => btn.addEventListener('click', syncOrFetchData));
        document.getElementById('resetWorkoutBtn').addEventListener('click', resetCurrentWorkout);
        elements.workoutNotes.addEventListener('input', saveNotes);
        document.getElementById('analyzeProgressBtn').addEventListener('click', analyzeProgressWithAI);
        document.getElementById('clearSheetBtn').addEventListener('click', clearGoogleSheet); // Event listener for the clear button
        elements.dateRangeFilter.addEventListener('change', renderDashboard);
        elements.bodyPartFilter.addEventListener('change', () => {
            populateExerciseFilter();
            renderDashboard();
        });
        elements.exerciseFilter.addEventListener('change', renderDashboard);
        document.getElementById('chatToggleBtn').addEventListener('click', () => elements.aiChatModal.classList.add('active'));
        document.getElementById('closeChatBtn').addEventListener('click', () => elements.aiChatModal.classList.remove('active'));
        document.getElementById('sendChatBtn').addEventListener('click', sendChatMessage);
        elements.chatInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendChatMessage(); });
    }

    // === 4. AUTHENTICATION & UI STATE (GLOBAL ACCESS) ===
    window.handleAuthClick = function() {
        if (!isApiReady) { showNotification("Google API is not ready. Please try again.", "error"); return; }
        tokenClient.requestAccessToken({ prompt: 'consent' });
    };

    window.handleAuthResponse = function(resp) {
        if (resp.error) { showNotification("Authorization failed. Check console.", "error"); updateSigninStatus(false); return; }
        updateSigninStatus(true);
    };

    window.updateSigninStatus = function(isSignedIn) {
        document.querySelectorAll('[id^="authorizeBtn"]').forEach(btn => btn.classList.toggle('hidden', isSignedIn));
        document.querySelectorAll('[id^="syncBtn"], #globalSyncBtn').forEach(btn => btn.classList.toggle('hidden', !isSignedIn));

        const hasData = hasPendingData();
        document.getElementById('globalSyncBtn').disabled = !hasData;
        document.querySelectorAll('#syncBtnHome, #syncBtnWorkout').forEach(btn => btn.disabled = !hasData);
        
        document.getElementById('analyzeProgressBtn').disabled = !isSignedIn;
        document.getElementById('clearSheetBtn').disabled = !isSignedIn;
        document.getElementById('syncBtnDashboard').disabled = !isSignedIn;

        if (isSignedIn && document.getElementById('dashboardScreen').classList.contains('active')) {
            fetchDashboardData(false);
        } else if (!isSignedIn) {
            elements.dashboardContent.innerHTML = `<div class="dashboard-card"><p>Please authorize to view dashboard.</p></div>`;
        }
    };
    
    // === 5. CORE APP LOGIC ===
    function showPage(pageId) {
        elements.pages.forEach(p => p.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
        elements.navLinks.forEach(l => l.classList.toggle('active', l.dataset.page === pageId));
        if (pageId === 'dashboardScreen' && gapi.client?.getToken()) {
            fetchDashboardData(false);
        }
    }

    function renderHome() {
        elements.workoutGrid.innerHTML = '';
        Object.entries(workoutData).forEach(([day, workout]) => {
            const card = document.createElement('div');
            card.className = 'day-card';
            card.dataset.day = day;
            card.innerHTML = `<i class="fas fa-dumbbell"></i><h3>${workout.name}</h3>`;
            card.addEventListener('click', () => startWorkout(day));
            elements.workoutGrid.appendChild(card);
        });
    }

    function startWorkout(day) {
        currentDay = day;
        showPage('workoutScreen');
        loadWorkoutUI();
    }

    function loadWorkoutUI() {
        const workout = workoutData[currentDay];
        elements.currentWorkoutTitle.textContent = workout.name;
        elements.exerciseListContainer.innerHTML = '';
        const progress = workoutProgress[currentDay] || { date: new Date().toISOString().split('T')[0], sets: {}, notes: '' };

        workout.exercises.forEach((exercise, exIndex) => {
            let optionsHtml = `<option value="${exercise.name}">${exercise.name}</option>`;
            exercise.alternatives?.forEach(alt => { optionsHtml += `<option value="${alt}">${alt}</option>`; });
            
            const selectedEx = progress.sets?.[exIndex]?.selectedExercise || exercise.name;
            const selectHtml = `<select class="exercise-select" data-ex="${exIndex}">${optionsHtml.replace(`value="${selectedEx}"`, `value="${selectedEx}" selected`)}</select>`;
            
            let setsHtml = '';
            for (let setIndex = 0; setIndex < exercise.sets; setIndex++) {
                const p = progress.sets?.[exIndex]?.[setIndex] || {};
                setsHtml += `<div class="set-row ${p.completed ? 'completed' : ''}" data-ex="${exIndex}" data-set="${setIndex}">
                    <input type="checkbox" class="set-checkbox" ${p.completed ? 'checked' : ''}><span>Set ${setIndex + 1}</span>
                    <input type="number" class="set-input" placeholder="kg" value="${p.weight || ''}"><input type="number" class="set-input" placeholder="reps" value="${p.reps || ''}">
                </div>`;
            }
            elements.exerciseListContainer.innerHTML += `<div class="exercise-card"><div class="exercise-header">${selectHtml}<span class="rep-scheme">Target: ${exercise.reps}</span></div>${setsHtml}</div>`;
        });
        elements.workoutNotes.value = progress.notes || '';
        elements.exerciseListContainer.querySelectorAll('.set-checkbox, .set-input').forEach(el => el.addEventListener('change', handleSetChange));
        elements.exerciseListContainer.querySelectorAll('.exercise-select').forEach(sel => sel.addEventListener('change', handleExerciseChange));
    }

    function handleExerciseChange(e) {
        const { ex } = e.target.dataset;
        if (!workoutProgress[currentDay]) { workoutProgress[currentDay] = { date: new Date().toISOString().split('T')[0], sets: {}, notes: '' }; }
        if (!workoutProgress[currentDay].sets[ex]) { workoutProgress[currentDay].sets[ex] = {}; }
        workoutProgress[currentDay].sets[ex].selectedExercise = e.target.value;
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
        if (confirm("Reset all entries for this session? This won't affect saved data in Google Sheets.") && workoutProgress[currentDay]) {
            delete workoutProgress[currentDay];
            saveWorkoutProgress(); 
            loadWorkoutUI();
            showNotification("Workout session has been reset.", "info");
        }
    }

    // === 6. DATA SYNC, FETCH & STORAGE ===
    function saveWorkoutProgress() {
        localStorage.setItem('workoutProgress', JSON.stringify(workoutProgress));
        if (gapi.client?.getToken()) {
            updateSigninStatus(true);
        }
    }

    function loadWorkoutProgress() {
        workoutProgress = JSON.parse(localStorage.getItem('workoutProgress') || '{}');
    }

    function hasPendingData() {
        return Object.values(workoutProgress).some(day => day.sets && Object.values(day.sets).some(ex => Object.values(ex).some(set => set.completed)));
    }

    async function syncWorkoutData() {
        if (!gapi.client?.getToken()) return showNotification("Please authorize first.", "error");
        const dataToSync = prepareDataForSheets();
        if (dataToSync.length === 0) return showNotification("No pending workouts to sync.", "info");
        showNotification("Syncing workouts...", "info");
        try {
            await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID, range: 'WorkoutLog!A1', valueInputOption: 'USER_ENTERED', insertDataOption: 'INSERT_ROWS', resource: { values: dataToSync },
            });
            showNotification("Workouts synced successfully!", "success");
            const syncedDays = [...new Set(dataToSync.map(row => Object.keys(workoutData).find(day => workoutData[day].name === row[1])))];
            syncedDays.forEach(day => { if (day && workoutProgress[day]) delete workoutProgress[day]; });
            saveWorkoutProgress();
        } catch (error) { showNotification("Sync failed. Check console.", "error"); }
    }

    function prepareDataForSheets() {
        const rows = [];
        for (const dayKey in workoutProgress) {
            const workout = workoutData[dayKey]; const progress = workoutProgress[dayKey];
            if (!workout || !progress.sets) continue;
            let noteAdded = false;
            Object.keys(progress.sets).forEach(exIndex => {
                const defaultExercise = workout.exercises[exIndex];
                if (!defaultExercise) return;
                const exerciseName = progress.sets[exIndex].selectedExercise || defaultExercise.name;
                Object.keys(progress.sets[exIndex]).forEach(setIndex => {
                    if (setIndex === 'selectedExercise') return;
                    const set = progress.sets[exIndex][setIndex];
                    if (set.completed && (set.weight || set.reps)) {
                        rows.push([progress.date, workout.name, exerciseName, parseInt(setIndex) + 1, set.weight || 0, set.reps || 0, currentUser, noteAdded ? "" : (progress.notes || "")]);
                        noteAdded = true;
                    }
                });
            });
        }
        return rows;
    }

    async function fetchDashboardData(showNotificationOnFail = true) {
        if (!gapi.client?.getToken()) return;
        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({ spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID, range: 'WorkoutLog!A2:H' });
            sheetData = (response.result.values || []).map(row => {
                const dayName = row[1], dayKey = Object.keys(workoutData).find(d => workoutData[d].name === dayName);
                return {
                    date: new Date(row[0] + 'T00:00:00'), day: dayName, exercise: row[2], set: parseInt(row[3]),
                    weight: parseFloat(row[4]) || 0, reps: parseInt(row[5]) || 0, user: row[6], notes: row[7],
                    bodyPart: dayKey ? workoutData[dayKey].bodyPart : 'Unknown',
                };
            });
            if (showNotificationOnFail) showNotification('Dashboard data synced.', 'success');
            populateBodyPartFilter();
            renderDashboard();
        } catch (err) { if (showNotificationOnFail) showNotification("Failed to fetch dashboard data.", "error"); }
    }

    // === 7. DASHBOARD RENDERING & FILTERS ===
    function populateBodyPartFilter() {
        const bodyParts = [...new Set(sheetData.filter(row => row.user === currentUser).map(row => row.bodyPart))].filter(Boolean);
        elements.bodyPartFilter.innerHTML = '<option value="all">All Body Parts</option>';
        bodyParts.forEach(bp => {
            const option = document.createElement('option');
            option.value = bp;
            option.textContent = bp;
            elements.bodyPartFilter.appendChild(option);
        });
        populateExerciseFilter();
    }

    function populateExerciseFilter() {
        const bodyPart = elements.bodyPartFilter.value;
        const exercises = [...new Set(sheetData.filter(row => row.user === currentUser && (bodyPart === 'all' || row.bodyPart === bodyPart)).map(row => row.exercise))].filter(Boolean);
        elements.exerciseFilter.innerHTML = '<option value="all">All Exercises</option>';
        exercises.forEach(ex => {
            const option = document.createElement('option');
            option.value = ex;
            option.textContent = ex;
            elements.exerciseFilter.appendChild(option);
        });
        elements.exerciseFilter.disabled = exercises.length === 0;
    }

    function renderDashboard() {
        const bodyPart = elements.bodyPartFilter.value;
        const exercise = elements.exerciseFilter.value;
        const dateRange = elements.dateRangeFilter.value;

        const data = sheetData.filter(row => {
            const isUser = row.user === currentUser;
            const isBodyPart = bodyPart === 'all' || row.bodyPart === bodyPart;
            const isExercise = exercise === 'all' || row.exercise === exercise;
            const isDate = dateRange === 'all' || (new Date() - row.date) / 86400000 <= parseInt(dateRange);
            return isUser && isBodyPart && isExercise && isDate;
        });

        if (data.length === 0) { elements.dashboardContent.innerHTML = `<div class="dashboard-card"><p>No data found for this selection.</p></div>`; return; }
        
        const e1RM = (w, r) => r > 0 ? w * (1 + r / 30) : 0; data.forEach(row => row.e1RM = e1RM(row.weight, row.reps));
        const bestSet = data.reduce((max, row) => row.e1RM > max.e1RM ? row : max, { e1RM: 0 });
        
        elements.dashboardContent.innerHTML = `<div class="dashboard-card"><h3>Best Lift</h3><p style="font-size: 2rem; font-weight: 700;">${bestSet.weight}kg x ${bestSet.reps} reps</p><small>${bestSet.exercise}</small></div><div class="dashboard-card"><h3>Est. 1-Rep Max</h3><p style="font-size: 2rem; font-weight: 700;">${bestSet.e1RM.toFixed(1)}kg</p></div><div class="dashboard-card" style="grid-column: 1 / -1;"><div class="chart-container"><canvas id="progressChart"></canvas></div></div>`;
        
        const chartData = exercise === 'all' ? data : data.filter(d => d.exercise === exercise);
        renderProgressChart(chartData.sort((a, b) => a.date - b.date), "progressChart");
    }

    function renderProgressChart(data, canvasId) { 
        if (chartInstances[canvasId]) chartInstances[canvasId].destroy(); 
        const ctx = document.getElementById(canvasId)?.getContext('2d'); 
        if (ctx) chartInstances[canvasId] = new Chart(ctx, { type: 'line', data: { labels: data.map(d => d.date.toLocaleDateString()), datasets: [{ label: 'Estimated 1RM (kg)', data: data.map(d => d.e1RM.toFixed(1)), borderColor: 'var(--primary-color)', tension: 0.1, fill: true }] }, options: { responsive: true, maintainAspectRatio: false } }); 
    }
    
    // === 8. OTHER HELPER FUNCTIONS ===
    async function clearGoogleSheet() {
        if (!gapi.client?.getToken()) { return showNotification("Please authorize first.", "error"); }
        if (!confirm("Are you sure you want to delete ALL data from the Google Sheet? This action cannot be undone.")) { return; }
        
        showNotification("Clearing sheet data...", "info");
        try {
            await gapi.client.sheets.spreadsheets.values.clear({
                spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
                range: 'WorkoutLog!A2:H',
            });
            sheetData = [];
            renderDashboard();
            showNotification("All data has been cleared from your Google Sheet.", "success");
        } catch (err) {
            showNotification("Failed to clear sheet data. Check console.", "error");
        }
    }

    function loadCurrentUser() { currentUser = localStorage.getItem('currentUser') || 'Harjas'; elements.userCards.forEach(c => c.classList.toggle('active', c.dataset.user === currentUser)); elements.workoutSectionTitle.textContent = `Select Workout for ${currentUser}`; }
    function selectUser(user) { currentUser = user; localStorage.setItem('currentUser', user); loadCurrentUser(); if (document.getElementById('dashboardScreen').classList.contains('active')) fetchDashboardData(false); }
    async function analyzeProgressWithAI() { showNotification("AI Analysis coming soon!", "info"); }
    async function sendChatMessage() {
        const userMessage = elements.chatInput.value.trim(); if (!userMessage) return;
        addChatMessage(userMessage, 'user'); elements.chatInput.value = ''; addChatMessage("<i>AI is thinking...</i>", 'ai');
        try {
            const response = await fetch('/.netlify/functions/ask-ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'chat', payload: userMessage }) });
            if (!response.ok) throw new Error('Function Error');
            const data = await response.json();
            elements.chatMessages.querySelector('.ai-message:last-child').remove();
            addChatMessage(data.message.replace(/\n/g, '<br>').replace(/\*\*/g, '<strong>'), 'ai');
        } catch (error) { elements.chatMessages.querySelector('.ai-message:last-child').remove(); addChatMessage("Sorry, I'm having trouble connecting right now.", 'ai'); }
    }
    function addChatMessage(message, sender) { const msgDiv = document.createElement('div'); msgDiv.className = `${sender}-message`; msgDiv.innerHTML = `<p>${message}</p>`; elements.chatMessages.appendChild(msgDiv); elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight; }
    function showNotification(message, type = 'info') { const el = document.createElement('div'); el.className = `notification ${type}`; el.textContent = message; document.body.appendChild(el); setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, 10); setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 4000); }, 4000); }
    function updateAuthorizeButtons(enabled, text) { document.querySelectorAll('[id^="authorizeBtn"]').forEach(btn => { btn.disabled = !enabled; btn.innerHTML = `<i class="fab fa-google"></i> ${text}`; }); }

    // Initial setup call
    setupEventListeners();
    loadCurrentUser();
    loadWorkoutProgress();
    renderHome();
    updateAuthorizeButtons(false, "Loading...");
});
