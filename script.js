'use strict';

window.gapiLoaded = gapiLoaded;
window.gisLoaded = gisLoaded;

// Config & Global State
const GOOGLE_CONFIG = {
  CLIENT_ID:
    '1040913543341-0vj52ims83dkcudpvh6rdtvrvr5da5nn.apps.googleusercontent.com',
  SPREADSHEET_ID: '15O-z40Jsy2PFs0XaXle07g_hJuwBCgpEi399TC9Yaic',
  SCOPES: 'https://www.googleapis.com/auth/spreadsheets',
};

const workoutData = {
  1: { name: 'Push Day 1', bodyPart: 'Push', exercises: [
    { name: 'BB Flat Bench Press', sets: 4, reps: '10, 8, 6, 4', alternatives: ['Machine bench press', 'incline bench press', 'db flat bench press'] },
    { name: 'DB Incline Press', sets: 3, reps: '12, 8, 6', alternatives: ['Incline bench press', 'machine incline bench press', 'flat db bench press'] },
    { name: 'DB Shoulder Press', sets: 4, reps: '15, 12, 10, 6', alternatives: ['Machine shoulder press', 'barbell shoulder press', 'shoulder front raises'] },
    { name: 'Cable Straight Pushdown', sets: 3, reps: '15, 12, 10 + drop', alternatives: ['Rope pushdowns', 'single hand cable pushdowns', 'skull crushers'] },
    { name: 'DB Lateral Raises', sets: 4, reps: '12, 10, 8, complex', alternatives: ['Upright rows', 'laying lateral raises'] },
    { name: 'Overhead Tricep Extension', sets: 3, reps: '15, 12, 10', alternatives: ['Rope pushdowns', 'skull crushers'] },
    { name: 'Cable Chest Fly', sets: 3, reps: '20, 16, 12', alternatives: ['Machine fly', 'db fly'] },
  ]},
  2: { name: 'Pull Day 1', bodyPart: 'Pull', exercises: [
    { name: 'Lat Pulldown', sets: 4, reps: '12, 10, 6, 6 peak', alternatives: ['DB row', 'barbell row', 'pull ups'] },
    { name: 'Deadlift', sets: 4, reps: '10, 8, 6, 4', alternatives: ['Back extension', 'db deadlift'] },
    { name: 'Seated Close Grip Row', sets: 4, reps: '12, 10, 10, 10 peak', alternatives: ['Row with narrow bar', 'row with wide bar', 'db and bb row'] },
    { name: 'Rope Pull Overs', sets: 3, reps: '16, 12, 10', alternatives: ['Pull over with db'] },
    { name: 'DB Hammer Curls', sets: 3, reps: '15, 12, 10', alternatives: ['DB curls', 'preacher curls'] },
    { name: 'Preacher Curls', sets: 4, reps: '16, 12, 10, 8', alternatives: ['DB curls', 'seated curls'] },
    { name: 'Barbell Curls', sets: 2, reps: '20, 15', alternatives: ['Supinated curls', 'cable curls'] },
  ]},
  3: { name: 'Leg Day', bodyPart: 'Legs', exercises: [
    { name: 'BB Squat', sets: 4, reps: '15, 10, 6, 4', alternatives: ['Hack squats', 'leg press'] },
    { name: 'Lunges', sets: 3, reps: '8 strides/leg', alternatives: ['Reverse squat', 'romanian deadlift'] },
    { name: 'Sumo Stance Leg Press', sets: 3, reps: '12, 10, 8', alternatives: ['Glute bridges', 'goblet squat', 'sumo squat'] },
    { name: 'Hamstring Curls', sets: 3, reps: '15, 12, 10', alternatives: ['Reverse hamstring curls'] },
    { name: 'Legs Extension', sets: 3, reps: '15, 12, 10', alternatives: ['Adductors', 'hack squat full depth'] },
    { name: 'Calf Raises', sets: 4, reps: '25, 20, 20, 15', alternatives: ['Seated calf raises'] },
  ]},
  4: { name: 'Push Day 2', bodyPart: 'Push', exercises: [
    { name: 'BB Incline Bench', sets: 2, reps: '12, 10', alternatives: ['Machine bench press', 'db flat bench press'] },
    { name: 'Cambered Bar Front Raise', sets: 3, reps: '15, 12, 10', alternatives: ['DB front raise', 'plate front raise'] },
    { name: 'Cable Rope Face Pulls w/ Rear Delt Fly', sets: 3, reps: '12, 10, 8 each', alternatives: ['Bent over delt fly'] },
    { name: 'Lowest Angle Chest Fly', sets: 3, reps: '15, 12, 10', alternatives: ['Machine fly', 'db fly'] },
    { name: 'Front Plate Raise', sets: 2, reps: '20, 16', alternatives: ['DB front raise'] },
    { name: 'Close Grip Bench Press', sets: 2, reps: '15, 12', alternatives: ['Tricep dips'] },
    { name: 'Lateral Raises on Machine/Cable', sets: 2, reps: '20, 16', alternatives: ['Upright rows', 'db lateral raises'] },
  ]},
  5: { name: 'Pull Day 2', bodyPart: 'Pull', exercises: [
    { name: 'Close Grip Lat Pulldown w/ V Bar', sets: 3, reps: '15, 12, 10', alternatives: ['DB row', 'barbell row', 'pull ups'] },
    { name: 'BB Row', sets: 3, reps: '12, 10, 8', alternatives: ['Single hand db row', 'machine row'] },
    { name: 'Reverse Hand Rowing', sets: 2, reps: '12, 10', alternatives: ['Single hand db row', 'machine row'] },
    { name: 'Hyper Extension', sets: 3, reps: '20, 16, 14', alternatives: ['Deadlift', 't-bar row'] },
    { name: 'Incline Curls', sets: 3, reps: '15, 12, 10', alternatives: ['Hammer curls', 'db curls'] },
    { name: 'Machine Rope Curls', sets: 3, reps: '15, 12, 10', alternatives: ['Hammer curls', 'db curls'] },
  ]},
  6: { name: 'Arms Day', bodyPart: 'Arms', exercises: [
    { name: 'Superset: Cable EZ Bar Curls / Tricep Pushdowns', sets: 4, reps: '15-15...', alternatives: [] },
    { name: 'Superset: Preacher Curls / Overhead Tricep Extension', sets: 3, reps: '12-12...', alternatives: [] },
    { name: 'Superset: Wide Grip Bar Curls / Rope Pushdowns', sets: 2, reps: '5p 10f - 10...', alternatives: [] },
    { name: 'Superset: Hammer Curls Drop Set / Single Arm Tricep', sets: 2, reps: '(15, 12, 10)...', alternatives: [] },
  ]},
};

let currentUser = localStorage.getItem('currentUser') || 'Harjas';
let currentDay = 1;
let workoutProgress = {};
let gapiInited = false, gisInited = false, tokenClient, isApiReady = false, silentAuthTried = false;
let sheetData = [];
let chartInstance = null;

// API Load callbacks for global scope
function gapiLoaded() {
  gapi.load('client', async () => {
    try {
      await gapi.client.init({ discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'] });
      gapiInited = true;
      checkApiReady();
    } catch (e) {
      showNotification('Failed to initialize Google Sheets API.', 'error');
      console.error(e);
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
    showNotification('Failed to initialize Google Sign-In.', 'error');
    console.error(e);
  }
}
window.gapiLoaded = gapiLoaded;
window.gisLoaded = gisLoaded;

function checkApiReady() {
  if (gapiInited && gisInited) {
    isApiReady = true;
    updateAuthorizeButtons(true, 'Authorize');
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
  if (!isApiReady) {
    showNotification('Google API not ready yet. Please wait.', 'error');
    return;
  }
  tokenClient.requestAccessToken({ prompt: 'consent' });
}
function handleAuthResponse(resp) {
  if (resp.error) {
    showNotification('Authorization failed. Please try again.', 'error');
    updateSigninStatus(false);
    return;
  }
  updateSigninStatus(true);
}
function updateAuthorizeButtons(enabled, text) {
  document.querySelectorAll('[id^="authorizeBtn"]').forEach((btn) => {
    btn.disabled = !enabled;
    btn.innerHTML = `<i class="fab fa-google"></i> ${text}`;
  });
}
function updateSigninStatus(signedIn) {
  document.querySelectorAll('[id^="authorizeBtn"]').forEach(btn => btn.classList.toggle('hidden', signedIn));
  document.querySelectorAll('[id^="syncBtn"], #globalSyncBtn').forEach(btn => btn.classList.toggle('hidden', !signedIn));

  const pending = hasPendingData();
  document.getElementById('globalSyncBtn').disabled = !pending;
  document.querySelectorAll('#syncBtnHome, #syncBtnWorkout').forEach(btn => btn.disabled = !pending);

  ['analyzeProgressBtn', 'clearSheetBtn', 'syncBtnDashboard'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = !signedIn;
  });

  if (signedIn && document.getElementById('dashboardScreen')?.classList.contains('active')) {
    fetchDashboardData(false);
  } else if (!signedIn) {
    const dashContent = document.getElementById('dashboardContent');
    if (dashContent) dashContent.innerHTML = `<div class="dashboard-card"><p>Please authorize to view dashboard.</p></div>`;
  }
}

function hasPendingData() {
  for (const day of Object.values(workoutProgress)) {
    if (day.sets) {
      for (const exercise of Object.values(day.sets)) {
        for (const set of Object.values(exercise)) {
          if (typeof set === 'object' && set.completed) return true;
        }
      }
    }
  }
  return false;
}
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
    setTimeout(() => el.remove(), 4000);
  }, 4000);
}

// Load & Save workout progress locally
function saveWorkoutProgress() {
  localStorage.setItem('workoutProgress', JSON.stringify(workoutProgress));
  if (gapi.client.getToken()) updateSigninStatus(true);
}
function loadWorkoutProgress() {
  try { workoutProgress = JSON.parse(localStorage.getItem('workoutProgress'))||{}; } catch { workoutProgress = {}; }
}

// UI: Render Home workout list
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
// UI: Load workout detail UI
function loadWorkoutUI() {
  const workout = workoutData[currentDay];
  if (!workout) return;
  const titleEl = document.getElementById('currentWorkoutTitle');
  if (titleEl) titleEl.textContent = workout.name;

  const container = document.getElementById('exerciseListContainer');
  if (!container) return;
  container.innerHTML = '';

  const progress = workoutProgress[currentDay] || { date: new Date().toISOString().slice(0, 10), sets: {}, notes: '' };

  workout.exercises.forEach((exercise, exIndex) => {
    let optionsHtml = `<option value="${exercise.name}">${exercise.name}</option>`;
    exercise.alternatives?.forEach(a => optionsHtml += `<option value="${a}">${a}</option>`);

    const selectedEx = progress.sets?.[exIndex]?.selectedExercise || exercise.name;
    const selectHtml = `<select class="exercise-select" data-ex="${exIndex}">${optionsHtml.replace(`value="${selectedEx}"`, `value="${selectedEx}" selected`)}</select>`;

    let setsHtml = '';
    for (let setIndex = 0; setIndex < exercise.sets; setIndex++) {
      const setProg = progress.sets?.[exIndex]?.[setIndex] || {};
      setsHtml += `<div class="set-row ${setProg.completed ? 'completed' : ''}" data-ex="${exIndex}" data-set="${setIndex}">
        <input type="checkbox" class="set-checkbox" ${setProg.completed ? 'checked' : ''}><span>Set ${setIndex + 1}</span>
        <input type="number" class="set-input" placeholder="kg" value="${setProg.weight || ''}">
        <input type="number" class="set-input" placeholder="reps" value="${setProg.reps || ''}">
      </div>`;
    }
    container.innerHTML += `<div class="exercise-card"><div class="exercise-header">${selectHtml}<span class="rep-scheme">Target: ${exercise.reps}</span></div>${setsHtml}</div>`;
  });

  const notesEl = document.getElementById('workoutNotes');
  if (notesEl) notesEl.value = progress.notes || '';

  container.querySelectorAll('.set-checkbox, .set-input').forEach(el => el.addEventListener('change', handleSetChange));
  container.querySelectorAll('.exercise-select').forEach(s => s.addEventListener('change', handleExerciseChange));
}

function handleExerciseChange(e) {
  const ex = e.target.dataset.ex;
  if (!workoutProgress[currentDay]) workoutProgress[currentDay] = { date: new Date().toISOString().slice(0, 10), sets: {}, notes: '' };
  if (!workoutProgress[currentDay].sets[ex]) workoutProgress[currentDay].sets[ex] = {};
  workoutProgress[currentDay].sets[ex].selectedExercise = e.target.value;
  saveWorkoutProgress();
}

function handleSetChange(e) {
  const row = e.target.closest('.set-row');
  if (!row) return;
  const ex = row.dataset.ex;
  const set = row.dataset.set;
  if (!workoutProgress[currentDay]) workoutProgress[currentDay] = { date: new Date().toISOString().slice(0, 10), sets: {}, notes: '' };
  if (!workoutProgress[currentDay].sets[ex]) workoutProgress[currentDay].sets[ex] = {};
  const completed = row.querySelector('.set-checkbox').checked;
  workoutProgress[currentDay].sets[ex][set] = {
    completed,
    weight: row.querySelector('input[placeholder="kg"]').value,
    reps: row.querySelector('input[placeholder="reps"]').value,
  };
  row.classList.toggle('completed', completed);
  saveWorkoutProgress();
}

function saveNotes(e) {
  if (!workoutProgress[currentDay]) workoutProgress[currentDay] = { date: new Date().toISOString().slice(0, 10), sets: {}, notes: '' };
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

// Prepare data rows for Google Sheets sync
function prepareDataForSheets() {
  const rows = [];
  for (const dayKey in workoutProgress) {
    const workout = workoutData[dayKey];
    const progress = workoutProgress[dayKey];
    if (!workout || !progress.sets) continue;
    let noteAdded = false;
    for (const exIndex in progress.sets) {
      const exerciseDef = workout.exercises[exIndex];
      if (!exerciseDef) continue;
      const exName = progress.sets[exIndex].selectedExercise || exerciseDef.name;
      for (const setIndex in progress.sets[exIndex]) {
        if (setIndex === 'selectedExercise') continue;
        const set = progress.sets[exIndex][setIndex];
        if (set && set.completed && (set.weight || set.reps)) {
          rows.push([
            progress.date,
            workout.name,
            exName,
            parseInt(setIndex) + 1,
            set.weight || 0,
            set.reps || 0,
            currentUser,
            noteAdded ? '' : progress.notes || '',
          ]);
          noteAdded = true;
        }
      }
    }
  }
  return rows;
}

// Sync workout data to sheet
async function syncWorkoutData() {
  if (!gapi.client?.getToken()) {
    showNotification("Please authorize first.", "error");
    return;
  }
  const rows = prepareDataForSheets();
  if (rows.length === 0) {
    showNotification("No pending workouts to sync.", "info");
    return;
  }
  showNotification("Syncing workouts...", "info");
  try {
    const response = await gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
      range: 'WorkoutLog!A1',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: rows },
    });
    if (!response || (response.status && response.status >= 400)) {
      throw new Error("Google Sheets API error");
    }
    showNotification("Workouts synced successfully!", "success");
    const syncedDays = [...new Set(rows.map(row => Object.keys(workoutData).find(day => workoutData[day].name === row[1])))];
    syncedDays.forEach(day => { if (day && workoutProgress[day]) delete workoutProgress[day]; });
    saveWorkoutProgress();
  } catch (e) {
    showNotification("Sync failed. Please check the console.", "error");
    console.error(e);
  }
}

// Fetch dashboard data
async function fetchDashboardData(showNotify = true) {
  if (!gapi.client?.getToken()) return;
  try {
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
      range: 'WorkoutLog!A2:H',
    });
    sheetData = (response.result.values || []).map(row => {
      const dayName = row[1];
      const dayKey = Object.keys(workoutData).find(d => workoutData[d].name === dayName);
      return {
        date: parseSheetDate(row[0]),
        day: dayName,
        exercise: row[2],
        set: parseInt(row[3]),
        weight: parseFloat(row[4]) || 0,
        reps: parseInt(row[5]) || 0,
        user: row[6],
        notes: row[7],
        bodyPart: dayKey ? workoutData[dayKey].bodyPart : 'Unknown',
      };
    });
    if (showNotify) showNotification("Dashboard data synced.", "success");
    populateBodyPartFilter();
    renderDashboard();
  } catch (e) {
    if (showNotify) showNotification("Failed to fetch dashboard data.", "error");
    console.error(e);
  }
}

function populateBodyPartFilter() {
  const bodyFilter = document.getElementById('bodyPartFilter');
  if (!bodyFilter) return;
  const bodyParts = [...new Set(sheetData.filter(r => r.user === currentUser).map(r => r.bodyPart))].filter(Boolean);
  bodyFilter.innerHTML = '<option value="all">All Body Parts</option>';
  bodyParts.forEach(bp => {
    bodyFilter.innerHTML += `<option value="${bp}">${bp}</option>`;
  });
  populateExerciseFilter();
}

function populateExerciseFilter() {
  const bodyFilter = document.getElementById('bodyPartFilter');
  const exerciseFilter = document.getElementById('exerciseFilter');
  if (!bodyFilter || !exerciseFilter) return;
  const bodyPart = bodyFilter.value;
  const exercises = [...new Set(sheetData.filter(r => r.user === currentUser && (bodyPart === 'all' || r.bodyPart === bodyPart)).map(r => r.exercise))].filter(Boolean);
  exerciseFilter.innerHTML = '<option value="all">All Exercises</option>';
  exercises.forEach(ex => {
    exerciseFilter.innerHTML += `<option value="${ex}">${ex}</option>`;
  });
  exerciseFilter.disabled = exercises.length === 0 || bodyPart === 'all';
}

function renderDashboard() {
  const bodyFilter = document.getElementById('bodyPartFilter');
  const exerciseFilter = document.getElementById('exerciseFilter');
  const dateRangeFilter = document.getElementById('dateRangeFilter');
  if (!bodyFilter || !exerciseFilter || !dateRangeFilter) return;

  const bodyPart = bodyFilter.value;
  const exercise = exerciseFilter.value;
  const dateRange = dateRangeFilter.value;

  let filteredData = sheetData.filter(row => {
    const userCheck = row.user === currentUser;
    const dateCheck = dateRange === 'all' || (new Date() - row.date) / 86400000 <= parseInt(dateRange);
    const bodyCheck = bodyPart === 'all' || row.bodyPart === bodyPart;
    return userCheck && dateCheck && bodyCheck;
  });
  if (exercise !== 'all') filteredData = filteredData.filter(row => row.exercise === exercise);

  if (filteredData.length === 0) {
    const dashContent = document.getElementById('dashboardContent');
    if (dashContent) dashContent.innerHTML = `<div class="dashboard-card"><p>No data found for this selection.</p></div>`;
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    return;
  }

  const e1RM = (w, r) => (r > 0 ? w * (1 + r / 30) : 0);
  filteredData.forEach(row => row.e1RM = e1RM(row.weight, row.reps));

  const bestSet = filteredData.reduce((max, row) => (row.e1RM > max.e1RM ? row : max), { e1RM: 0 });

  const dashContent = document.getElementById('dashboardContent');
  if (!dashContent) return;

  dashContent.innerHTML = `
    <div class="dashboard-card">
      <h3>Best Lift</h3>
      <p style="font-size: 2rem; font-weight: 700;">${bestSet.weight}kg x ${bestSet.reps} reps</p>
      <small>${bestSet.exercise}</small>
    </div>
    <div class="dashboard-card">
      <h3>Est. 1-Rep Max</h3>
      <p style="font-size: 2rem; font-weight: 700;">${bestSet.e1RM.toFixed(1)}kg</p>
    </div>
    <div class="dashboard-card" style="grid-column: 1 / -1;">
      <div class="chart-container">
        <canvas id="progressChart"></canvas>
      </div>
    </div>`;

  let chartData;
  let label = 'Estimated 1RM (kg)';

  if (exercise === 'all' && bodyPart !== 'all') {
    label = `Average 1RM for ${bodyPart}`;
    const grouped = filteredData.reduce((acc, cur) => {
      const dateKey = cur.date.toISOString().slice(0, 10);
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(cur.e1RM);
      return acc;
    }, {});
    chartData = Object.entries(grouped).map(([dateStr, vals]) => {
      return { date: new Date(dateStr + 'T00:00:00'), e1RM: vals.reduce((a,b)=>a+b,0)/vals.length };
    });
  } else {
    chartData = filteredData;
    if (exercise !== 'all') label = `1RM for ${exercise}`;
  }

  renderProgressChart(chartData, 'progressChart', label);
}

function renderProgressChart(data, canvasId, label) {
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return;
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.date.toLocaleDateString('en-GB')),
      datasets: [{
        label,
        data: data.map(d => d.e1RM.toFixed(1)),
        borderColor: 'var(--primary-color)',
        fill: true,
        backgroundColor: 'rgba(11, 87, 208, 0.1)',
        tension: 0.15,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { maxRotation: 45, minRotation: 30 } },
        y: { beginAtZero: true },
      },
      plugins: { legend: { labels: { font: { size: 14 } } } },
    },
  });
}

// AI Analysis Implementation
async function analyzeProgressWithAI() {
  const analyzeBtn = document.getElementById('analyzeProgressBtn');
  if (analyzeBtn) analyzeBtn.disabled = true;

  showNotification('Analyzing progress...', 'info');

  if (!sheetData || sheetData.length === 0) {
    showNotification('No workout data found to analyze.', 'error');
    if (analyzeBtn) analyzeBtn.disabled = false;
    return;
  }

  try {
    // Build summary text for AI prompt
    let summary = `User: ${currentUser}\nWorkout sessions: ${sheetData.length}\n\nBest Lifts:\n`;

    const e1RM = (w, r) => (r > 0 ? w * (1 + r / 30) : 0);
    const bestLifts = {};

    sheetData.forEach(row => {
      if (row.user !== currentUser) return;
      const key = row.bodyPart + ' - ' + row.exercise;
      const curBest = bestLifts[key];
      let est1RM = e1RM(row.weight, row.reps);
      if (!curBest || est1RM > curBest.e1RM) {
        bestLifts[key] = {
          weight: row.weight, reps: row.reps, e1RM: est1RM,
          date: row.date.toLocaleDateString('en-GB'),
        };
      }
    });
    for (const [key, val] of Object.entries(bestLifts)) {
      summary += `${key}: ${val.weight}kg x ${val.reps} reps (estimated 1RM: ${val.e1RM.toFixed(1)}kg) on ${val.date}\n`;
    }
    summary += "\nProvide a summary of this user's fitness progress and tips for improvement.";

    const response = await fetch('/.netlify/functions/ask-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'analyze', payload: summary }),
    });

    if (!response.ok) throw new Error('AI analysis failed');
    const data = await response.json();

    alert(`AI Analysis:\n\n${data.message}`);

  } catch (e) {
    console.error('AI analysis error:', e);
    showNotification('Failed to perform AI analysis. Please try later.', 'error');
  } finally {
    if (analyzeBtn) analyzeBtn.disabled = false;
  }
}

// Clear Google Sheet data
async function clearGoogleSheet() {
  if (!gapi.client?.getToken()) {
    showNotification("Please authorize first.", "error");
    return;
  }
  if (!confirm("Are you sure you want to delete ALL data from the Google Sheet? This action cannot be undone.")) return;
  showNotification("Clearing sheet data...", "info");
  try {
    await gapi.client.sheets.spreadsheets.values.clear({
      spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
      range: "WorkoutLog!A2:H",
    });
    sheetData = [];
    populateBodyPartFilter();
    renderDashboard();
    showNotification("All data cleared from Google Sheet.", "success");
  } catch (err) {
    showNotification("Failed to clear sheet data.", "error");
    console.error("Clear sheet error:", err);
  }
}

// User functions
function loadCurrentUser() {
  document.querySelectorAll('.user-card').forEach(c =>
    c.classList.toggle('active', c.dataset.user === currentUser));
  const wsTitle = document.getElementById('workout-section-title');
  if (wsTitle) wsTitle.textContent = `Select Workout for ${currentUser}`;
}

function selectUser(user) {
  if (!user) return;
  currentUser = user;
  localStorage.setItem('currentUser', user);
  loadCurrentUser();
  if (document.getElementById('dashboardScreen')?.classList.contains('active') &&
      isApiReady && gapi.client?.getToken()) {
    fetchDashboardData(false);
  }
}

// Page navigation and event handling
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId)?.classList.add('active');
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === pageId);
  });
  if (pageId === 'dashboardScreen' && isApiReady && gapi.client?.getToken()) fetchDashboardData(false);
}

function syncOrFetchData(e) {
  if (e.currentTarget.id.includes('Dashboard')) fetchDashboardData(true);
  else syncWorkoutData();
}

// Setup event listeners on DOM ready
function setupEventListeners() {
  document.querySelectorAll('.nav-link').forEach(link =>
    link.addEventListener('click', e => {
      e.preventDefault();
      showPage(link.dataset.page);
    }));

  document.querySelectorAll('.user-card').forEach(card =>
    card.addEventListener('click', () => selectUser(card.dataset.user)));

  document.getElementById('backToHomeBtn')?.addEventListener('click', () => showPage('homeScreen'));
  document.querySelectorAll('[id^="authorizeBtn"]').forEach(btn => btn.addEventListener('click', handleAuthClick));
  document.querySelectorAll('[id^="syncBtn"], #globalSyncBtn').forEach(btn => btn.addEventListener('click', syncOrFetchData));
  document.getElementById('resetWorkoutBtn')?.addEventListener('click', resetCurrentWorkout);
  document.getElementById('workoutNotes')?.addEventListener('input', saveNotes);
  document.getElementById('analyzeProgressBtn')?.addEventListener('click', analyzeProgressWithAI);
  document.getElementById('clearSheetBtn')?.addEventListener('click', clearGoogleSheet);
  document.getElementById('dateRangeFilter')?.addEventListener('change', renderDashboard);
  document.getElementById('bodyPartFilter')?.addEventListener('change', () => {
    populateExerciseFilter();
    renderDashboard();
  });
  document.getElementById('exerciseFilter')?.addEventListener('change', renderDashboard);
  document.getElementById('chatToggleBtn')?.addEventListener('click', () => document.getElementById('aiChatModal')?.classList.add('active'));
  document.getElementById('closeChatBtn')?.addEventListener('click', () => document.getElementById('aiChatModal')?.classList.remove('active'));
  document.getElementById('sendChatBtn')?.addEventListener('click', sendChatMessage);
  document.getElementById('chatInput')?.addEventListener('keypress', e => { if (e.key === 'Enter') sendChatMessage(); });
}

// AI chat function
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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'chat', payload: message }),
    });
    if (!response.ok) throw new Error('AI response failed');
    const data = await response.json();
    document.querySelector('.ai-message:last-child')?.remove();
    addChatMessage(data.message.replace(/\n/g, '<br>').replace(/\*\*/g, '<strong>'), 'ai');
  } catch (e) {
    document.querySelector('.ai-message:last-child')?.remove();
    addChatMessage('Sorry, I\'m having trouble connecting right now.', 'ai');
    console.error(e);
  }
}

function addChatMessage(msg, sender) {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  const div = document.createElement('div');
  div.className = `${sender}-message`;
  div.innerHTML = `<p>${msg}</p>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

// Initial setup on page load
document.addEventListener('DOMContentLoaded', () => {
  loadCurrentUser();
  loadWorkoutProgress();
  renderHome();
  setupEventListeners();
});
