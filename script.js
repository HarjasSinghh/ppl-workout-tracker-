'use strict';

/**
 * ===================================================================
 * FitTrack Pro - Main Application Script v3.0 (Stable & Refined UI)
 * ===================================================================
 */

// 1. GLOBAL ATTACHMENTS & CONFIGURATION
window.gapiLoaded = gapiLoaded;
window.gisLoaded = gisLoaded;

const GOOGLE_CONFIG = {
  CLIENT_ID: '1040913543341-0vj52ims83dkcudpvh6rdtvrvr5da5nn.apps.googleusercontent.com',
  SPREADSHEET_ID: '15O-z40Jsy2PFs0XaXle07g_hJuwBCgpEi399TC9Yaic',
  SCOPES: 'https://www.googleapis.com/auth/spreadsheets',
};

const workoutData = {
    1: { name: 'Push Day 1', bodyPart: 'Push', exercises: [ { name: 'BB Flat Bench Press', sets: 4, reps: '10, 8, 6, 4', alternatives: ['Machine bench press', 'incline bench press', 'db flat bench press'] }, { name: 'DB Incline Press', sets: 3, reps: '12, 8, 6', alternatives: ['Incline bench press', 'machine incline bench press', 'flat db bench press'] }, { name: 'DB Shoulder Press', sets: 4, reps: '15, 12, 10, 6', alternatives: ['Machine shoulder press', 'barbell shoulder press', 'shoulder front raises'] }, { name: 'Cable Straight Pushdown', sets: 3, reps: '15, 12, 10 + drop', alternatives: ['Rope pushdowns', 'single hand cable pushdowns', 'skull crushers'] }, { name: 'DB Lateral Raises', sets: 4, reps: '12, 10, 8, complex', alternatives: ['Upright rows', 'laying lateral raises'] }, { name: 'Overhead Tricep Extension', sets: 3, reps: '15, 12, 10', alternatives: ['Rope pushdowns', 'skull crushers'] }, { name: 'Cable Chest Fly', sets: 3, reps: '20, 16, 12', alternatives: ['Machine fly', 'db fly'] }, ] },
    2: { name: 'Pull Day 1', bodyPart: 'Pull', exercises: [ { name: 'Lat Pulldown', sets: 4, reps: '12, 10, 6, 6 peak', alternatives: ['DB row', 'barbell row', 'pull ups'] }, { name: 'Deadlift', sets: 4, reps: '10, 8, 6, 4', alternatives: ['Back extension', 'db deadlift'] }, { name: 'Seated Close Grip Row', sets: 4, reps: '12, 10, 10, 10 peak', alternatives: ['Row with narrow bar', 'row with wide bar', 'db and bb row'] }, { name: 'Rope Pull Overs', sets: 3, reps: '16, 12, 10', alternatives: ['Pull over with db'] }, { name: 'DB Hammer Curls', sets: 3, reps: '15, 12, 10', alternatives: ['DB curls', 'preacher curls'] }, { name: 'Preacher Curls', sets: 4, reps: '16, 12, 10, 8', alternatives: ['DB curls', 'seated curls'] }, { name: 'Barbell Curls', sets: 2, reps: '20, 15', alternatives: ['Supinated curls', 'cable curls'] }, ] },
    3: { name: 'Leg Day', bodyPart: 'Legs', exercises: [ { name: 'BB Squat', sets: 4, reps: '15, 10, 6, 4', alternatives: ['Hack squats', 'leg press'] }, { name: 'Lunges', sets: 3, reps: '8 strides/leg', alternatives: ['Reverse squat', 'romanian deadlift'] }, { name: 'Sumo Stance Leg Press', sets: 3, reps: '12, 10, 8', alternatives: ['Glute bridges', 'goblet squat', 'sumo squat'] }, { name: 'Hamstring Curls', sets: 3, reps: '15, 12, 10', alternatives: ['Reverse hamstring curls'] }, { name: 'Legs Extension', sets: 3, reps: '15, 12, 10', alternatives: ['Adductors', 'hack squat full depth'] }, { name: 'Calf Raises', sets: 4, reps: '25, 20, 20, 15', alternatives: ['Seated calf raises'] }, ] },
    4: { name: 'Push Day 2', bodyPart: 'Push', exercises: [ { name: 'BB Incline Bench', sets: 2, reps: '12, 10', alternatives: ['Machine bench press', 'db flat bench press'] }, { name: 'Cambered Bar Front Raise', sets: 3, reps: '15, 12, 10', alternatives: ['DB front raise', 'plate front raise'] }, { name: 'Cable Rope Face Pulls w/ Rear Delt Fly', sets: 3, reps: '12, 10, 8 each', alternatives: ['Bent over delt fly'] }, { name: 'Lowest Angle Chest Fly', sets: 3, reps: '15, 12, 10', alternatives: ['Machine fly', 'db fly'] }, { name: 'Front Plate Raise', sets: 2, reps: '20, 16', alternatives: ['DB front raise'] }, { name: 'Close Grip Bench Press', sets: 2, reps: '15, 12', alternatives: ['Tricep dips'] }, { name: 'Lateral Raises on Machine/Cable', sets: 2, reps: '20, 16', alternatives: ['Upright rows', 'db lateral raises'] }, ] },
    5: { name: 'Pull Day 2', bodyPart: 'Pull', exercises: [ { name: 'Close Grip Lat Pulldown w/ V Bar', sets: 3, reps: '15, 12, 10', alternatives: ['DB row', 'barbell row', 'pull ups'] }, { name: 'BB Row', sets: 3, reps: '12, 10, 8', alternatives: ['Single hand db row', 'machine row'] }, { name: 'Reverse Hand Rowing', sets: 2, reps: '12, 10', alternatives: ['Single hand db row', 'machine row'] }, { name: 'Hyper Extension', sets: 3, reps: '20, 16, 14', alternatives: ['Deadlift', 't-bar row'] }, { name: 'Incline Curls', sets: 3, reps: '15, 12, 10', alternatives: ['Hammer curls', 'db curls'] }, { name: 'Machine Rope Curls', sets: 3, reps: '15, 12, 10', alternatives: ['Hammer curls', 'db curls'] }, ] },
    6: { name: 'Arms Day', bodyPart: 'Arms', exercises: [ { name: 'Superset: Cable EZ Bar Curls / Tricep Pushdowns', sets: 4, reps: '15-15...', alternatives: [] }, { name: 'Superset: Preacher Curls / Overhead Tricep Extension', sets: 3, reps: '12-12...', alternatives: [] }, { name: 'Superset: Wide Grip Bar Curls / Rope Pushdowns', sets: 2, reps: '5p 10f - 10...', alternatives: [] }, { name: 'Superset: Hammer Curls Drop Set / Single Arm Tricep', sets: 2, reps: '(15, 12, 10)...', alternatives: [] }, ] },
};

// 2. APPLICATION STATE
let currentUser = 'Harjas';
let currentDay = 1;
let workoutProgress = {};
let gapiInited = false, gisInited = false, isApiReady = false, silentAuthTried = false;
let tokenClient;
let sheetData = [];
let chartInstance = null;

// 3. GOOGLE API & AUTHENTICATION
function gapiLoaded() {
  gapi.load('client', async () => {
    try {
      await gapi.client.init({ discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'] });
      gapiInited = true;
      checkApiReady();
    } catch (e) {
      console.error('GAPI Init Error:', e);
      showNotification('Google API failed. Please refresh.', 'error');
      enableAuthorizeButtons(true, 'Retry Auth');
    }
  });
}

function gisLoaded() {
  try {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CONFIG.CLIENT_ID,
      scope: GOOGLE_CONFIG.SCOPES,
      callback: handleAuthResponse,
    });
    gisInited = true;
    checkApiReady();
  } catch (e) {
    console.error('GIS Init Error:', e);
    showNotification('Sign-In failed. Please refresh.', 'error');
    enableAuthorizeButtons(true, 'Retry Auth');
  }
}

function checkApiReady() {
  if (gapiInited && gisInited && !isApiReady) {
    isApiReady = true;
    enableAuthorizeButtons(true, 'Authorize');
    if (!silentAuthTried) {
      silentAuthTried = true;
      trySilentAuth();
    }
  }
}

function trySilentAuth() {
  if (tokenClient) tokenClient.requestAccessToken({ prompt: 'none' });
}

function handleAuthClick() {
  if (!isApiReady) return showNotification('Google API is not ready.', 'error');
  tokenClient.requestAccessToken({ prompt: 'consent' });
}

function handleAuthResponse(resp) {
  if (resp.error) {
    console.error("Authorization failed:", resp);
    showNotification('Authorization failed. Please try again.', 'error');
    updateAuthorizationUI(false);
    return;
  }
  showNotification('Authorization successful!', 'success');
  updateAuthorizationUI(true);
}

function enableAuthorizeButtons(enabled, text) {
  document.querySelectorAll('[id^="authorizeBtn"]').forEach(btn => {
    if (btn) {
      btn.disabled = !enabled;
      btn.innerHTML = `<i class="fab fa-google"></i> ${text}`;
    }
  });
}

function updateAuthorizationUI(isSignedIn) {
  document.querySelectorAll('[id^="authorizeBtn"]').forEach(btn => btn.classList.toggle('hidden', isSignedIn));
  document.querySelectorAll('[id^="syncBtn"], #globalSyncBtn').forEach(btn => btn.classList.toggle('hidden', !isSignedIn));

  const hasPending = checkPendingWorkoutData();
  const globalSyncBtn = document.getElementById('globalSyncBtn');
  if (globalSyncBtn) globalSyncBtn.disabled = !hasPending;
  document.querySelectorAll('#syncBtnHome, #syncBtnWorkout').forEach(btn => { if (btn) btn.disabled = !hasPending; });

  ['analyzeProgressBtn', 'clearSheetBtn', 'syncBtnDashboard'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = !isSignedIn;
  });

  if (isSignedIn && document.getElementById('dashboardScreen')?.classList.contains('active')) {
    fetchDashboardData(false);
  } else if (!isSignedIn) {
    const dashContent = document.getElementById('dashboardContent');
    if (dashContent) dashContent.innerHTML = `<div class="dashboard-card"><p>Please authorize to view dashboard.</p></div>`;
  }
}

// 4. UTILITY & HELPER FUNCTIONS
function showNotification(message, type = 'info') {
  const el = document.createElement('div');
  el.className = `notification ${type}`;
  el.style.opacity = '0';
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '1'; }, 10);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 500); }, 3500);
}

function parseSheetDate(d) {
  if (!d) return new Date();
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return new Date(d + 'T00:00:00');
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(d)) return new Date(d);
  const dt = new Date(d);
  return isNaN(dt) ? new Date() : dt;
}

function saveWorkoutProgress() {
  localStorage.setItem('workoutProgress', JSON.stringify(workoutProgress));
  if (gapi.client?.getToken()) updateAuthorizationUI(true);
}

function loadWorkoutProgress() {
  try {
    workoutProgress = JSON.parse(localStorage.getItem('workoutProgress')) || {};
  } catch {
    workoutProgress = {};
  }
}

function checkPendingWorkoutData() {
  for (const day of Object.values(workoutProgress)) {
    if (day?.sets) {
      for (const ex of Object.values(day.sets)) {
        if (ex) {
            for(const set of Object.values(ex)) {
                if(typeof set === 'object' && (set.weight || set.reps)) return true;
            }
        }
      }
    }
  }
  return false;
}

// 5. UI RENDERING & WORKOUT LOGIC (NEW COMPACT UI)
function renderHome() {
  const grid = document.getElementById('workoutGrid');
  if (!grid) return;
  grid.innerHTML = '';
  Object.entries(workoutData).forEach(([day, workout]) => {
    const card = document.createElement('div');
    card.className = 'day-card';
    card.dataset.day = day;
    card.innerHTML = `<i class="fas fa-dumbbell"></i><h3>${workout.name}</h3>`;
    card.addEventListener('click', () => {
      currentDay = day;
      showPage('workoutScreen');
      loadWorkoutUI();
    });
    grid.appendChild(card);
  });
}

function loadWorkoutUI() {
  const workout = workoutData[currentDay];
  if (!workout) return;
  document.getElementById('currentWorkoutTitle').textContent = workout.name;
  
  const container = document.getElementById('exerciseListContainer');
  if (!container) return;
  container.innerHTML = '';

  const progress = workoutProgress[currentDay] || { date: new Date().toISOString().slice(0, 10), sets: {}, notes: '' };

  workout.exercises.forEach((exercise, exIndex) => {
    const item = document.createElement('div');
    item.className = 'exercise-log-item';
    item.dataset.exIndex = exIndex;
    
    // Header for exercise and set selection
    const header = document.createElement('div');
    header.className = 'exercise-log-header';
    
    // Exercise Dropdown
    const exerciseSelect = document.createElement('select');
    exerciseSelect.className = 'exercise-select';
    let optionsHtml = `<option value="${exercise.name}">${exercise.name}</option>`;
    exercise.alternatives?.forEach(a => { optionsHtml += `<option value="${a}">${a}</option>`; });
    exerciseSelect.innerHTML = optionsHtml;
    exerciseSelect.value = progress.sets?.[exIndex]?.selectedExercise || exercise.name;
    
    // Set Dropdown
    const setSelect = document.createElement('select');
    setSelect.className = 'set-select';
    for (let i = 1; i <= exercise.sets; i++) {
      setSelect.innerHTML += `<option value="${i-1}">Set ${i}</option>`;
    }
    
    header.appendChild(exerciseSelect);
    header.appendChild(setSelect);
    item.appendChild(header);
    
    // Container for weight/reps inputs
    const inputsContainer = document.createElement('div');
    inputsContainer.className = 'set-inputs';
    item.appendChild(inputsContainer);

    // Function to render inputs for the selected set
    const renderSetInputs = (setIndex) => {
      const p = progress.sets?.[exIndex]?.[setIndex] || {};
      inputsContainer.innerHTML = `
        <input type="number" name="weight" placeholder="Weight (kg)" value="${p.weight || ''}">
        <input type="number" name="reps" placeholder="Reps" value="${p.reps || ''}">
      `;
      inputsContainer.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', () => handleSetChange(exIndex, setIndex));
      });
    };
    
    // Event listener for set selection
    setSelect.addEventListener('change', () => {
      renderSetInputs(setSelect.value);
    });
    
    // Event listener for exercise selection
    exerciseSelect.addEventListener('change', () => {
        handleExerciseChange(exIndex, exerciseSelect.value);
    });

    // Initial render for the first set
    renderSetInputs(0);
    
    container.appendChild(item);
  });

  document.getElementById('workoutNotes').value = progress.notes || '';
  document.getElementById('workoutNotes').addEventListener('change', saveNotes);
}

function handleExerciseChange(exIndex, newExerciseName) {
    if (!workoutProgress[currentDay]) workoutProgress[currentDay] = { date: new Date().toISOString().slice(0, 10), sets: {}, notes: '' };
    if (!workoutProgress[currentDay].sets[exIndex]) workoutProgress[currentDay].sets[exIndex] = {};
    workoutProgress[currentDay].sets[exIndex].selectedExercise = newExerciseName;
    saveWorkoutProgress();
}

function handleSetChange(exIndex, setIndex) {
  const item = document.querySelector(`.exercise-log-item[data-ex-index="${exIndex}"]`);
  if (!item) return;

  if (!workoutProgress[currentDay]) workoutProgress[currentDay] = { date: new Date().toISOString().slice(0, 10), sets: {}, notes: '' };
  if (!workoutProgress[currentDay].sets[exIndex]) workoutProgress[currentDay].sets[exIndex] = {};
  if (!workoutProgress[currentDay].sets[exIndex][setIndex]) workoutProgress[currentDay].sets[exIndex][setIndex] = {};

  const weightInput = item.querySelector('input[name="weight"]');
  const repsInput = item.querySelector('input[name="reps"]');

  workoutProgress[currentDay].sets[exIndex][setIndex] = {
    weight: weightInput.value,
    reps: repsInput.value,
  };
  
  // Also save the selected exercise name at the exercise level
  const exerciseSelect = item.querySelector('.exercise-select');
  workoutProgress[currentDay].sets[exIndex].selectedExercise = exerciseSelect.value;
  
  saveWorkoutProgress();
}

function saveNotes(e) {
  if (!workoutProgress[currentDay]) workoutProgress[currentDay] = { date: new Date().toISOString().slice(0, 10), sets: {}, notes: '' };
  workoutProgress[currentDay].notes = e.target.value;
  saveWorkoutProgress();
}

function resetCurrentWorkout() {
  if (confirm("Reset entries for this session? This won't affect synced data.") && workoutProgress[currentDay]) {
    delete workoutProgress[currentDay];
    saveWorkoutProgress();
    loadWorkoutUI();
    showNotification("Workout session has been reset.", "info");
  }
}

// 6. GOOGLE SHEETS INTEGRATION
function prepareDataForSheets() {
  const rows = [];
  for (const dayKey in workoutProgress) {
    const workout = workoutData[dayKey];
    const progress = workoutProgress[dayKey];
    if (!workout?.sets) continue;
    let noteAdded = false;
    for (const exIndex in progress.sets) {
      const exDef = workout.exercises[exIndex];
      if (!exDef) continue;
      const exName = progress.sets[exIndex].selectedExercise || exDef.name;
      for (const setIndex in progress.sets[exIndex]) {
        if (setIndex === 'selectedExercise') continue;
        const set = progress.sets[exIndex][setIndex];
        if (set && (set.weight || set.reps)) {
          rows.push([progress.date, workout.name, exName, parseInt(setIndex) + 1, set.weight || 0, set.reps || 0, currentUser, noteAdded ? '' : progress.notes || '']);
          noteAdded = true;
        }
      }
    }
  }
  return rows;
}

async function syncWorkoutData() {
  if (!gapi.client?.getToken()) return showNotification("Please authorize first.", "error");
  const rows = prepareDataForSheets();
  if (rows.length === 0) return showNotification("No pending workouts to sync.", "info");
  
  showNotification("Syncing workouts...", "info");
  try {
    const response = await gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID, range: 'WorkoutLog!A1', valueInputOption: 'USER_ENTERED', insertDataOption: 'INSERT_ROWS', resource: { values: rows },
    });
    if (response.status !== 200) throw new Error(`Google Sheets API error: ${response.result.error.message}`);
    showNotification("Workouts synced successfully!", "success");
    const syncedDays = [...new Set(rows.map(row => Object.keys(workoutData).find(day => workoutData[day].name === row[1])))];
    syncedDays.forEach(day => { if (day && workoutProgress[day]) delete workoutProgress[day]; });
    saveWorkoutProgress();
  } catch (error) {
    showNotification("Sync failed. Check console for details.", "error");
    console.error("Sync Error:", error);
  }
}

async function fetchDashboardData(showNotify = true) {
  if (!gapi.client?.getToken()) return;
  try {
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID, range: 'WorkoutLog!A2:H',
    });
    const values = Array.isArray(response.result?.values) ? response.result.values : [];
    sheetData = values.map(row => {
      const dayName = row[1];
      const dayKey = Object.keys(workoutData).find(d => workoutData[d].name === dayName);
      return { date: parseSheetDate(row[0]), day: dayName, exercise: row[2], set: parseInt(row[3]), weight: parseFloat(row[4]) || 0, reps: parseInt(row[5]) || 0, user: row[6], notes: row[7], bodyPart: dayKey ? workoutData[dayKey].bodyPart : 'Unknown', };
    });
    if (showNotify) showNotification("Dashboard data synced.", "success");
    populateBodyPartFilter();
    renderDashboard();
  } catch (e) {
    if (showNotify) showNotification("Failed to fetch dashboard data.", "error");
    console.error("Dashboard Fetch Error:", e);
  }
}

function populateBodyPartFilter() {
    const filter = document.getElementById('bodyPartFilter');
    if (!filter) return;
    const bodyParts = [...new Set(sheetData.filter(r => r.user === currentUser).map(r => r.bodyPart))].filter(Boolean);
    filter.innerHTML = '<option value="all">All Body Parts</option>';
    bodyParts.forEach(bp => { filter.innerHTML += `<option value="${bp}">${bp}</option>`; });
    populateExerciseFilter();
}

function populateExerciseFilter() {
    const bodyFilter = document.getElementById('bodyPartFilter');
    const exFilter = document.getElementById('exerciseFilter');
    if (!bodyFilter || !exFilter) return;
    const bodyPart = bodyFilter.value;
    const exercises = [...new Set(sheetData.filter(r => r.user === currentUser && (bodyPart === 'all' || r.bodyPart === bodyPart)).map(r => r.exercise))].filter(Boolean);
    exFilter.innerHTML = '<option value="all">All Exercises</option>';
    exercises.forEach(ex => { exFilter.innerHTML += `<option value="${ex}">${ex}</option>`; });
    exFilter.disabled = exercises.length === 0 || bodyPart === 'all';
}

function renderDashboard() {
    const content = document.getElementById('dashboardContent');
    if (!content) return;
    const dateRange = document.getElementById('dateRangeFilter').value;
    const bodyPart = document.getElementById('bodyPartFilter').value;
    const exercise = document.getElementById('exerciseFilter').value;

    let filtered = sheetData.filter(row => row.user === currentUser && (dateRange === 'all' || (new Date() - row.date) / 86400000 <= parseInt(dateRange)) && (bodyPart === 'all' || row.bodyPart === bodyPart));
    if (exercise !== 'all') filtered = filtered.filter(row => row.exercise === exercise);

    if (filtered.length === 0) {
        content.innerHTML = `<div class="dashboard-card"><p>No data found for this selection.</p></div>`;
        if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
        return;
    }
    const e1RM = (w, r) => (r > 0 ? w * (1 + r / 30) : 0);
    filtered.forEach(row => row.e1RM = e1RM(row.weight, row.reps));
    const bestSet = filtered.reduce((max, row) => (row.e1RM > max.e1RM ? row : max), { e1RM: 0 });

    content.innerHTML = `<div class="dashboard-card"><h3>Best Lift</h3><p style="font-size: 2rem; font-weight: 700;">${bestSet.weight}kg x ${bestSet.reps} reps</p><small>${bestSet.exercise}</small></div><div class="dashboard-card"><h3>Est. 1-Rep Max</h3><p style="font-size: 2rem; font-weight: 700;">${bestSet.e1RM.toFixed(1)}kg</p></div><div class="dashboard-card" style="grid-column: 1 / -1;"><div class="chart-container"><canvas id="progressChart"></canvas></div></div>`;
    renderProgressChart(filtered, 'progressChart', exercise !== 'all' ? `1RM for ${exercise}` : 'Est. 1RM (kg)');
}

function renderProgressChart(data, canvasId, label) {
    if (chartInstance) chartInstance.destroy();
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (ctx) {
        chartInstance = new Chart(ctx, {
            type: 'line',
            data: { labels: data.map(d => d.date.toLocaleDateString('en-GB')), datasets: [{ label: label, data: data.map(d => d.e1RM.toFixed(1)), borderColor: 'var(--primary-color)', tension: 0.1, fill: true, backgroundColor: 'rgba(11, 87, 208, 0.1)' }] },
            options: { responsive: true, maintainAspectRatio: false, scales: { x: { ticks: { maxRotation: 45, minRotation: 30 } }, y: { beginAtZero: true } } },
        });
    }
}

// 7. USER MANAGEMENT & NAVIGATION
function loadCurrentUser() {
  currentUser = localStorage.getItem('currentUser') || 'Harjas';
  document.querySelectorAll('.user-card').forEach(c => c.classList.toggle('active', c.dataset.user === currentUser));
  document.getElementById('workout-section-title').textContent = `Select Workout for ${currentUser}`;
}

function selectUser(user) {
  if (!user) return;
  currentUser = user;
  localStorage.setItem('currentUser', user);
  loadCurrentUser();
  if (document.getElementById('dashboardScreen')?.classList.contains('active') && isApiReady && gapi.client?.getToken()) {
    fetchDashboardData(false);
  }
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId)?.classList.add('active');
  document.querySelectorAll('.nav-link').forEach(link => link.classList.toggle('active', link.dataset.page === pageId));
  if (pageId === 'dashboardScreen' && isApiReady && gapi.client?.getToken()) fetchDashboardData(false);
}

function syncOrFetchData(e) {
  if (e.currentTarget.id.includes('Dashboard')) fetchDashboardData(true);
  else syncWorkoutData();
}

// 8. AI & EXTRA FEATURES
async function analyzeProgressWithAI() {
  const btn = document.getElementById('analyzeProgressBtn');
  if (btn) btn.disabled = true;
  showNotification('Analyzing your progress with AI...', 'info');

  if (!sheetData || sheetData.length === 0) {
    showNotification('No workout data available to analyze.', 'error');
    if (btn) btn.disabled = false;
    return;
  }

  try {
    let summary = `User: ${currentUser}\nWorkout sessions logged: ${sheetData.length}\n\nBest lifts:\n`;
    const e1RM = (w, r) => (r > 0 ? w * (1 + r / 30) : 0);
    const bestLifts = {};
    sheetData.forEach(row => {
      if (row.user !== currentUser) return;
      const key = `${row.bodyPart} - ${row.exercise}`;
      const currentBest = bestLifts[key];
      const currentE1RM = e1RM(row.weight, row.reps);
      if (!currentBest || currentE1RM > currentBest.e1RM) {
        bestLifts[key] = { weight: row.weight, reps: row.reps, e1RM: currentE1RM, date: row.date.toLocaleDateString('en-GB') };
      }
    });
    for (const [key, val] of Object.entries(bestLifts)) {
      summary += `${key}: ${val.weight}kg x ${val.reps} reps (1RM est: ${val.e1RM.toFixed(1)}kg) on ${val.date}\n`;
    }
    summary += "\nProvide a friendly, insightful summary of this user's fitness progress and 2-3 actionable training tips based on this data.";

    const response = await fetch('/.netlify/functions/ask-ai', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'analyze', payload: summary }),
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI analysis failed: ${response.status} ${response.statusText}. Details: ${errorText}`);
    }
    const data = await response.json();
    
    document.getElementById('aiChatModal')?.classList.add('active');
    addChatMessage(`Here is an analysis of your progress, ${currentUser}:`, 'ai');
    addChatMessage(data.message.replace(/\n/g, '<br>'), 'ai');

  } catch (error) {
    showNotification('Failed to get AI analysis. Check console.', 'error');
    console.error('AI Analyze Error:', error);
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function clearGoogleSheet() {
    if (!gapi.client?.getToken()) return showNotification('Please authorize first.', 'error');
    if (!confirm('Are you sure you want to delete ALL data from the Google Sheet? This cannot be undone.')) return;
    
    showNotification('Clearing sheet data...', 'info');
    try {
        await gapi.client.sheets.spreadsheets.values.clear({ spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID, range: 'WorkoutLog!A2:H' });
        sheetData = [];
        populateBodyPartFilter();
        renderDashboard();
        showNotification('All data cleared from Google Sheet.', 'success');
    } catch (err) {
        showNotification('Failed to clear sheet data.', 'error');
        console.error('Clear sheet error:', err);
    }
}

function addChatMessage(message, sender) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = `${sender}-message`;
    div.innerHTML = `<p>${message}</p>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    const message = input.value.trim();
    if (!message) return;
    addChatMessage(message, 'user');
    input.value = '';
    addChatMessage('<i>AI is thinking...</i>', 'ai');
    try {
        const response = await fetch('/.netlify/functions/ask-ai', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'chat', payload: message }),
        });
        if (!response.ok) throw new Error('AI response failed');
        const data = await response.json();
        document.querySelector('.ai-message:last-child')?.remove();
        addChatMessage(data.message.replace(/\n/g, '<br>'), 'ai');
    } catch (e) {
        document.querySelector('.ai-message:last-child')?.remove();
        addChatMessage('Sorry, I am having trouble connecting.', 'ai');
        console.error('AI chat error:', e);
    }
}

// 9. INITIALIZATION
function setupEventListeners() {
  document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', e => { e.preventDefault(); showPage(l.dataset.page); }));
  document.querySelectorAll('.user-card').forEach(c => c.addEventListener('click', () => selectUser(c.dataset.user)));
  document.getElementById('backToHomeBtn')?.addEventListener('click', () => showPage('homeScreen'));
  document.querySelectorAll('[id^="authorizeBtn"]').forEach(b => b.addEventListener('click', handleAuthClick));
  document.querySelectorAll('[id^="syncBtn"], #globalSyncBtn').forEach(b => b.addEventListener('click', syncOrFetchData));
  document.getElementById('resetWorkoutBtn')?.addEventListener('click', resetCurrentWorkout);
  document.getElementById('analyzeProgressBtn')?.addEventListener('click', analyzeProgressWithAI);
  document.getElementById('clearSheetBtn')?.addEventListener('click', clearGoogleSheet);
  document.getElementById('dateRangeFilter')?.addEventListener('change', renderDashboard);
  document.getElementById('bodyPartFilter')?.addEventListener('change', () => { populateExerciseFilter(); renderDashboard(); });
  document.getElementById('exerciseFilter')?.addEventListener('change', renderDashboard);
  document.getElementById('chatToggleBtn')?.addEventListener('click', () => document.getElementById('aiChatModal')?.classList.add('active'));
  document.getElementById('closeChatBtn')?.addEventListener('click', () => document.getElementById('aiChatModal')?.classList.remove('active'));
  document.getElementById('sendChatBtn')?.addEventListener('click', sendChatMessage);
  document.getElementById('chatInput')?.addEventListener('keypress', e => { if (e.key === 'Enter') sendChatMessage(); });
}

document.addEventListener('DOMContentLoaded', () => {
  loadCurrentUser();
  loadWorkoutProgress();
  renderHome();
  setupEventListeners();
});
