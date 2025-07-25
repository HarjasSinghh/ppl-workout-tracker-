// ==========================================
// CONFIGURATION
// ==========================================
const GOOGLE_CONFIG = {
    CLIENT_ID: '1040913543341-0vj52ims83dkcudpvh6rdtvrvr5da5nn.apps.googleusercontent.com',
    SPREADSHEET_ID: '15O-z40Jsy2PFs0XaXle07g_hJuwBCgpEi399TC9Yaic',
    SCOPES: "https://www.googleapis.com/auth/spreadsheets",
};

const workoutData = {
    1: { name: "Push Day 1", bodyPart: "Push", exercises: [ { name: "BB Flat Bench Press", sets: 4 }, { name: "DB Incline Press", sets: 3 }, { name: "DB Shoulder Press", sets: 4 }, { name: "Cable Straight Pushdown", sets: 3 }, { name: "DB Lateral Raises", sets: 4 }, { name: "Overhead Tricep Extension", sets: 3 } ] },
    2: { name: "Pull Day 1", bodyPart: "Pull", exercises: [ { name: "Lat Pulldown", sets: 4 }, { name: "Deadlift", sets: 4 }, { name: "Barbell Shrugs", sets: 4 }, { name: "Seated Cable Row", sets: 4 }, { name: "DB Hammer Curls", sets: 3 } ] },
    3: { name: "Leg Day", bodyPart: "Legs", exercises: [ { name: "BB Squat", sets: 4 }, { name: "Lunges", sets: 3 }, { name: "Sumo Leg Press", sets: 3 }, { name: "Hamstring Curls", sets: 3 }, { name: "Calf Raises", sets: 4 } ] },
    4: { name: "Push Day 2", bodyPart: "Push", exercises: [ { name: "BB Incline Bench", sets: 3 }, { name: "Cable Rope Face Pulls", sets: 3 }, { name: "Close Grip Bench Press", sets: 3 }, { name: "Front Plate Raise", sets: 2 } ] },
    5: { name: "Pull Day 2", bodyPart: "Pull", exercises: [ { name: "Close Grip Lat Pulldown", sets: 3 }, { name: "BB Row", sets: 3 }, { name: "Face Pulls", sets: 3 }, { name: "Incline Curls", sets: 3 } ] },
    6: { name: "Arms Day", bodyPart: "Arms", exercises: [ { name: "Cable EZ Bar Curls", sets: 4 }, { name: "Tricep Pushdowns", sets: 4 }, { name: "Preacher Curls", sets: 3 }, { name: "Wrist Curls", sets: 3 }, { name: "Farmer Walks", sets: 3 } ] }
};

let currentDay = 1;
let workoutProgress = JSON.parse(localStorage.getItem('workoutProgress')) || {};
let gapiInited = false, gisInited = false, tokenClient, sheetData = [];
let chartInstances = {};

// --- INITIALIZATION ---
window.gapiLoaded = () => gapi.load('client', initializeGapiClient);
window.gisLoaded = () => {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CONFIG.CLIENT_ID,
        scope: GOOGLE_CONFIG.SCOPES,
        callback: handleAuthResponse,
    });
    gisInited = true;
    checkAuthButton();
};
async function initializeGapiClient() {
    await gapi.client.init({ discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"] });
    gapiInited = true;
    checkAuthButton();
}
document.addEventListener('DOMContentLoaded', setupEventListeners);

// --- AUTHENTICATION & SYNC ---
function checkAuthButton() {
    if (gapiInited && gisInited) document.getElementById('authorizeBtn').style.visibility = 'visible';
}
function handleAuthClick() {
    if (gapi.client.getToken() === null) tokenClient.requestAccessToken({ prompt: 'consent' });
}
function handleAuthResponse(resp) {
    if (resp.error) throw resp;
    updateSigninStatus(true);
}
function updateSigninStatus(isSignedIn) {
    document.getElementById('authorizeBtn').style.display = isSignedIn ? 'none' : 'block';
    document.getElementById('syncDataBtn').style.display = isSignedIn ? 'block' : 'none';
}
async function syncWorkoutData() {
    if (!gapi.client.getToken()) return showNotification("Please authorize first.", "error");
    const dataToSync = prepareDataForSheets();
    if (dataToSync.length === 0) return showNotification("No completed sets to sync.", "info");
    try {
        await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
            range: 'WorkoutLog!A1',
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: { values: dataToSync },
        });
        showNotification("Workout synced successfully!", "success");
    } catch (error) {
        console.error('Sync Error:', error);
        showNotification("Sync failed. Check console.", "error");
    }
}
function prepareDataForSheets() {
    const rows = [];
    const workout = workoutData[currentDay];
    const progress = workoutProgress[currentDay];
    if (!progress) return [];
    const workoutDate = new Date().toISOString().split('T')[0];
    for (const exIndex in progress) {
        if (exIndex === 'notes') continue;
        for (const setIndex in progress[exIndex].sets) {
            const set = progress[exIndex].sets[setIndex];
            if (set.completed) {
                rows.push([workoutDate, workout.name, workout.bodyPart, workout.exercises[exIndex].name, set.weight || 0, set.reps || 0]);
            }
        }
    }
    return rows;
}

// --- UI & NAVIGATION ---
function setupEventListeners() {
    document.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', e => { e.preventDefault(); showPage(link.dataset.page); }));
    document.querySelectorAll('.day-card').forEach(card => card.addEventListener('click', () => startWorkout(card.dataset.day)));
    document.getElementById('backToHomeBtn').addEventListener('click', () => showPage('homeScreen'));
    document.getElementById('authorizeBtn').addEventListener('click', handleAuthClick);
    document.getElementById('syncDataBtn').addEventListener('click', syncWorkoutData);
    document.getElementById('refreshDataBtn').addEventListener('click', fetchDashboardData);
    document.getElementById('bodyPartFilter').addEventListener('change', populateExerciseFilter);
    document.getElementById('exerciseFilter').addEventListener('change', renderDashboard);
}
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.page === pageId));
    if (pageId === 'dashboardScreen' && sheetData.length === 0) fetchDashboardData();
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
        const sets = Array.from({ length: exercise.sets }, (_, j) => {
            const p = workoutProgress[currentDay]?.[i]?.sets?.[j] || {};
            return `<div class="set-row ${p.completed ? 'completed' : ''}" data-ex="${i}" data-set="${j}">
                <input type="checkbox" class="set-checkbox" ${p.completed ? 'checked' : ''}>
                <span>Set ${j + 1}</span>
                <input type="number" class="set-input" placeholder="kg" value="${p.weight || ''}">
                <input type="number" class="set-input" placeholder="reps" value="${p.reps || ''}">
            </div>`;
        }).join('');
        container.innerHTML += `<div class="exercise-card"><h3>${exercise.name}</h3>${sets}</div>`;
    });
    container.querySelectorAll('.set-checkbox, .set-input').forEach(el => el.addEventListener('change', handleSetChange));
}
function handleSetChange(e) {
    const row = e.target.closest('.set-row');
    const { ex, set } = row.dataset;
    const progress = workoutProgress[currentDay] = workoutProgress[currentDay] || {};
    progress[ex] = progress[ex] || { sets: {} };
    progress[ex].sets[set] = {
        completed: row.querySelector('.set-checkbox').checked,
        weight: row.querySelector('input[placeholder="kg"]').value,
        reps: row.querySelector('input[placeholder="reps"]').value,
    };
    row.classList.toggle('completed', progress[ex].sets[set].completed);
    localStorage.setItem('workoutProgress', JSON.stringify(workoutProgress));
}

// --- DASHBOARD & ANALYTICS ---
async function fetchDashboardData() {
    if (!gapi.client.getToken()) return showNotification("Please authorize to view dashboard.", "error");
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID, range: 'WorkoutLog!A2:F',
        });
        sheetData = (response.result.values || []).map(row => ({
            date: new Date(row[0]), bodyPart: row[2], exercise: row[3],
            weight: parseFloat(row[4]) || 0, reps: parseInt(row[5]) || 0,
        }));
        populateExerciseFilter();
        renderDashboard();
    } catch (err) { console.error("Error fetching data:", err); }
}
function populateExerciseFilter() {
    const bodyPart = document.getElementById('bodyPartFilter').value;
    const exercises = [...new Set(sheetData
        .filter(row => bodyPart === 'all' || row.bodyPart === bodyPart)
        .map(row => row.exercise))];
    const filter = document.getElementById('exerciseFilter');
    filter.innerHTML = '<option value="all">All Exercises</option>';
    exercises.forEach(ex => filter.innerHTML += `<option value="${ex}">${ex}</option>`);
    filter.disabled = false;
    renderDashboard();
}
function renderDashboard() {
    const bodyPart = document.getElementById('bodyPartFilter').value;
    const exercise = document.getElementById('exerciseFilter').value;
    const data = sheetData.filter(row => (bodyPart === 'all' || row.bodyPart === bodyPart) && (exercise === 'all' || row.exercise === exercise));
    const container = document.getElementById('dashboardContent');
    if (data.length === 0) {
        container.innerHTML = `<div class="dashboard-card"><p>No data found for this selection. Try a different filter.</p></div>`;
        return;
    }

    const e1RM = weight => reps => reps > 0 ? weight * (1 + reps / 30) : 0;
    data.forEach(row => row.e1RM = e1RM(row.weight)(row.reps));
    const bestSet = data.reduce((max, row) => row.e1RM > max.e1RM ? row : max, { e1RM: 0 });
    const progressData = data.filter(row => row.exercise === bestSet.exercise);

    const firstSet = progressData[0] || {};
    const lastSet = progressData[progressData.length - 1] || {};
    const strengthChange = firstSet.e1RM > 0 ? ((lastSet.e1RM - firstSet.e1RM) / firstSet.e1RM * 100).toFixed(1) : 0;
    
    container.innerHTML = `
        <div class="dashboard-card"><h3>Best Lift</h3><p style="font-size: 2rem; font-weight: 700;">${bestSet.weight} kg x ${bestSet.reps} reps</p><small>${bestSet.exercise} on ${bestSet.date.toLocaleDateString()}</small></div>
        <div class="dashboard-card"><h3>Estimated 1RM</h3><p style="font-size: 2rem; font-weight: 700;">${bestSet.e1RM.toFixed(1)} kg</p><small>Your estimated max strength for one rep.</small></div>
        <div class="dashboard-card tip-card"><h3><i class="fas fa-lightbulb"></i>AI Tip</h3><p>${generateAITip(strengthChange, bestSet.reps)}</p></div>
        <div class="dashboard-card" style="grid-column: 1 / -1;"><div class="chart-container"><canvas id="progressChart"></canvas></div></div>
    `;
    renderProgressChart(progressData, 'progressChart');
}
function renderProgressChart(data, canvasId) {
    if (chartInstances[canvasId]) chartInstances[canvasId].destroy();
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.date.toLocaleDateString()),
            datasets: [{
                label: 'Estimated 1RM (kg)',
                data: data.map(d => d.e1RM.toFixed(1)),
                borderColor: 'var(--primary-color)',
                tension: 0.1, fill: true,
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}
function generateAITip(change, reps) {
    if (change > 5) return `Incredible progress! Your strength has increased by ${change}%. Consider increasing the weight slightly to continue this trend.`;
    if (change > 0) return `Nice work! You're making steady gains. Keep up the consistency.`;
    if (reps < 6) return "You're lifting heavy! To maximize muscle growth, ensure you're also incorporating sets in the 8-12 rep range.";
    if (reps > 15) return "Great endurance! To build more top-end strength, try increasing the weight so your reps fall in the 6-10 range.";
    return "Consistency is key. You're laying the foundation for future progress. Keep showing up!";
}
function showNotification(message, type = 'info') {
    const el = document.createElement('div');
    el.className = `notification ${type}`;
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}
