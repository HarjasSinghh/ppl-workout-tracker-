'use strict';

// === CONFIGURATION & GLOBAL STATE ===
const GOOGLE_CONFIG = {
  CLIENT_ID: '1040913543341-0vj52ims83dkcudpvh6rdtvrvr5da5nn.apps.googleusercontent.com',
  SPREADSHEET_ID: '15O-z40Jsy2PFs0XaXle07g_hJuwBCgpEi399TC9Yaic',
  SCOPES: 'https://www.googleapis.com/auth/spreadsheets',
};

let gapiInited = false;
let gisInited = false;
let isApiReady = false;
let tokenClient;

let currentUser = 'Harjas';
let workoutProgress = {};
let sheetData = [];
let chartInstance = null;

// --- UTILITY: check if any completed sets pending to sync ---
function hasPendingData() {
  for (const dayProgress of Object.values(workoutProgress)) {
    if (dayProgress.sets) {
      for (const ex of Object.values(dayProgress.sets)) {
        for (const set of Object.values(ex)) {
          if (typeof set === 'object' && set.completed) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

// === GOOGLE API INITIALIZATION ===

// Called when gapi script loads
window.gapiLoaded = () => {
  gapi.load('client', async () => {
    try {
      await gapi.client.init({
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
      });
      gapiInited = true;
      tryEnableAuthorize();
    } catch {
      showNotification('Error initializing Google Sheets API', 'error');
    }
  });
};

// Called when Google Identity Services script loads
window.gisLoaded = () => {
  try {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CONFIG.CLIENT_ID,
      scope: GOOGLE_CONFIG.SCOPES,
      callback: handleAuthResponse,
    });
    gisInited = true;
    tryEnableAuthorize();
  } catch {
    showNotification('Error initializing Google Sign-In', 'error');
  }
};

function tryEnableAuthorize() {
  if (gapiInited && gisInited) {
    isApiReady = true;
    updateAuthorizeButtons(true, 'Authorize');
    const token = gapi.client.getToken();
    updateSigninStatus(token !== null);
  }
}

// Trigger Google OAuth flow when user clicks authorize
function handleAuthClick() {
  if (!isApiReady) {
    showNotification('Google API is not ready, please wait.', 'error');
    return;
  }
  tokenClient.requestAccessToken({ prompt: 'consent' });
}

// Handle OAuth response
function handleAuthResponse(resp) {
  if (resp.error) {
    showNotification('Authorization failed. Please try again.', 'error');
    updateSigninStatus(false);
    return;
  }
  updateSigninStatus(true);
}

// Update UI based on signin status
function updateSigninStatus(isSignedIn) {
  document.querySelectorAll('[id^="authorizeBtn"]').forEach((btn) => {
    btn.classList.toggle('hidden', isSignedIn);
  });
  document.querySelectorAll('[id^="syncBtn"], #globalSyncBtn').forEach((btn) => {
    btn.classList.toggle('hidden', !isSignedIn);
  });

  const pending = hasPendingData();
  document.getElementById('globalSyncBtn').disabled = !pending;
  document.querySelectorAll('#syncBtnHome, #syncBtnWorkout').forEach((btn) => {
    btn.disabled = !pending;
  });

  const analyzeBtn = document.getElementById('analyzeProgressBtn');
  if (analyzeBtn) analyzeBtn.disabled = !isSignedIn;
  const clearBtn = document.getElementById('clearSheetBtn');
  if (clearBtn) clearBtn.disabled = !isSignedIn;
  const syncDashboardBtn = document.getElementById('syncBtnDashboard');
  if(syncDashboardBtn) syncDashboardBtn.disabled = !isSignedIn;

  if (isSignedIn && document.getElementById('dashboardScreen').classList.contains('active')) {
    fetchDashboardData(false);
  } else if (!isSignedIn) {
    const dashContent = document.getElementById('dashboardContent');
    if (dashContent) dashContent.innerHTML = `<div class="dashboard-card"><p>Please authorize to view dashboard.</p></div>`;
  }
}

// Enable or disable authorize buttons with updated text
function updateAuthorizeButtons(enabled, text) {
  document.querySelectorAll('[id^="authorizeBtn"]').forEach((btn) => {
    btn.disabled = !enabled;
    btn.innerHTML = `<i class="fab fa-google"></i> ${text}`;
  });
}

// === STORAGE & SYNC FUNCTIONS ===

function saveWorkoutProgress() {
  localStorage.setItem('workoutProgress', JSON.stringify(workoutProgress));
  // Update sync buttons state if signed in
  if (gapi.client?.getToken()) {
    updateSigninStatus(true);
  }
}

function loadWorkoutProgress() {
  try {
    workoutProgress = JSON.parse(localStorage.getItem('workoutProgress') || '{}');
  } catch {
    workoutProgress = {};
  }
}

// Prepare data for Google Sheets append
function prepareDataForSheets() {
  const rows = [];
  const todayISO = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  for (const dayKey in workoutProgress) {
    const workoutDef = workoutData[dayKey];
    if (!workoutDef) continue;
    const progress = workoutProgress[dayKey];
    if (!progress.sets) continue;
    let noteAdded = false;
    for (const exIndex in progress.sets) {
      const exerciseDef = workoutDef.exercises[exIndex];
      if (!exerciseDef) continue;
      const exName = progress.sets[exIndex].selectedExercise || exerciseDef.name;
      for (const setIndex in progress.sets[exIndex]) {
        if (setIndex === 'selectedExercise') continue;
        const set = progress.sets[exIndex][setIndex];
        if (set && set.completed && (set.weight || set.reps)) {
          rows.push([
            progress.date || todayISO,
            workoutDef.name,
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

// Sync workout data to Google Sheets
async function syncWorkoutData() {
  if (!gapi.client?.getToken()) {
    showNotification('Please authorize before syncing.', 'error');
    return;
  }
  const valuesToSync = prepareDataForSheets();
  if (valuesToSync.length === 0) {
    showNotification('No pending workouts to sync.', 'info');
    return;
  }
  showNotification('Syncing workouts...', 'info');
  try {
    const response = await gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
      range: 'WorkoutLog!A1',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: valuesToSync },
    });
    if (!response || (response.status && response.status >= 400)) {
      throw new Error('Google Sheets API returned error');
    }
    showNotification('Workouts synced successfully!', 'success');
    // Clear synced local data for days synced
    const syncedDays = [...new Set(valuesToSync.map(row => Object.keys(workoutData).find(day => workoutData[day].name === row[1])))];
    syncedDays.forEach(day => {
      if (day && workoutProgress[day]) delete workoutProgress[day];
    });
    saveWorkoutProgress();
  } catch (err) {
    showNotification('Sync failed. Please check the console.', 'error');
    console.error('Sync error:', err);
  }
}

// Parse date from sheet, handle multiple formats gracefully
function parseSheetDate(d) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return new Date(d + 'T00:00:00');
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(d)) return new Date(d);
  const dt = new Date(d);
  return isNaN(dt) ? new Date() : dt;
}

// Fetch and parse Google Sheets data for dashboard
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
    if (showNotify) showNotification('Dashboard data synced.', 'success');
    populateDashboardFilters();
    renderDashboard();
  } catch (err) {
    if (showNotify) showNotification('Failed to fetch dashboard data.', 'error');
    console.error(err);
  }
}

// Populate body part & exercise filters on dashboard
function populateDashboardFilters() {
  const bodyParts = [...new Set(sheetData.filter(r => r.user === currentUser).map(r => r.bodyPart))].filter(Boolean);
  const bodyFilter = document.getElementById('bodyPartFilter');
  if (bodyFilter) {
    bodyFilter.innerHTML = '<option value="all">All Body Parts</option>';
    bodyParts.forEach(bp => {
      bodyFilter.innerHTML += `<option value="${bp}">${bp}</option>`;
    });
  }
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

// Render dashboard cards & chart
function renderDashboard() {
  const bodyFilter = document.getElementById('bodyPartFilter');
  const exerciseFilter = document.getElementById('exerciseFilter');
  const dateRangeFilter = document.getElementById('dateRangeFilter');
  if (!bodyFilter || !exerciseFilter || !dateRangeFilter) return;
  
  const bodyPart = bodyFilter.value;
  const exercise = exerciseFilter.value;
  const dateRange = dateRangeFilter.value;

  let filteredData = sheetData.filter(row => {
    const isUser = row.user === currentUser;
    const isDate = dateRange === 'all' || (new Date() - row.date) / 86400000 <= parseInt(dateRange);
    const isBodyPart = bodyPart === 'all' || row.bodyPart === bodyPart;
    return isUser && isDate && isBodyPart;
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
  filteredData.forEach(row => (row.e1RM = e1RM(row.weight, row.reps)));

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

  let chartData = [];
  let label = 'Estimated 1RM (kg)';

  if (exercise === 'all' && bodyPart !== 'all') {
    label = `Average 1RM for ${bodyPart}`;
    const grouped = filteredData.reduce((acc, cur) => {
      const isoDate = cur.date.toISOString().slice(0, 10);
      if (!acc[isoDate]) acc[isoDate] = [];
      acc[isoDate].push(cur.e1RM);
      return acc;
    }, {});
    chartData = Object.entries(grouped).map(([dateStr, vals]) => ({
      date: new Date(dateStr + 'T00:00:00'),
      e1RM: vals.reduce((a, b) => a + b, 0) / vals.length,
    }));
  } else {
    chartData = filteredData;
    if (exercise !== 'all') label = `1RM for ${exercise}`;
  }

  renderProgressChart(chartData, 'progressChart', label);
}

// Render line chart
function renderProgressChart(data, canvasId, label) {
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return;
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.date.toLocaleDateString()),
      datasets: [
        {
          label,
          data: data.map(d => d.e1RM.toFixed(1)),
          borderColor: 'var(--primary-color)',
          tension: 0.15,
          fill: true,
          backgroundColor: 'rgba(11, 87, 208, 0.1)',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { maxRotation: 45, minRotation: 30 }
        },
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          labels: { font: { size: 14 } }
        },
      }
    }
  });
}

// === EVENT LISTENER SETUP ===
function setupEventListeners() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => link.addEventListener('click', e => {
    e.preventDefault();
    showPage(link.dataset.page);
  }));

  const userCards = document.querySelectorAll('.user-card');
  userCards.forEach(card => card.addEventListener('click', () => selectUser(card.dataset.user)));

  document.getElementById('backToHomeBtn')?.addEventListener('click', () => showPage('homeScreen'));

  document.querySelectorAll('[id^="authorizeBtn"]').forEach(btn => btn.addEventListener('click', handleAuthClick));
  document.querySelectorAll('[id^="syncBtn"], #globalSyncBtn').forEach(btn => btn.addEventListener('click', syncOrFetchData));
  document.getElementById('resetWorkoutBtn')?.addEventListener('click', resetCurrentWorkout);
  document.getElementById('workoutNotes')?.addEventListener('input', saveNotes);
  document.getElementById('analyzeProgressBtn')?.addEventListener('click', () => showNotification('AI Analysis coming soon!', 'info'));
  document.getElementById('clearSheetBtn')?.addEventListener('click', clearGoogleSheet);
  document.getElementById('dateRangeFilter')?.addEventListener('change', renderDashboard);
  document.getElementById('bodyPartFilter')?.addEventListener('change', () => {
    populateExerciseFilter();
    renderDashboard();
  });
  document.getElementById('exerciseFilter')?.addEventListener('change', renderDashboard);

  document.getElementById('chatToggleBtn')?.addEventListener('click', () =>
    document.getElementById('aiChatModal')?.classList.add('active')
  );
  document.getElementById('closeChatBtn')?.addEventListener('click', () =>
    document.getElementById('aiChatModal')?.classList.remove('active')
  );
  document.getElementById('sendChatBtn')?.addEventListener('click', sendChatMessage);
  document.getElementById('chatInput')?.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendChatMessage();
  });
}

// --- UI Navigation ---
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId)?.classList.add('active');
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === pageId);
  });
  if (pageId === 'dashboardScreen' && isApiReady && gapi.client?.getToken()) {
    fetchDashboardData(false);
  }
}

// --- User selection ---
function loadCurrentUser() {
  const stored = localStorage.getItem('currentUser');
  currentUser = stored || currentUser;
  document.querySelectorAll('.user-card').forEach(c => {
    c.classList.toggle('active', c.dataset.user === currentUser);
  });
  const workoutTitle = document.getElementById('workout-section-title');
  if (workoutTitle) workoutTitle.textContent = `Select Workout for ${currentUser}`;
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

// --- AI chat placeholder functions ---
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
  } catch {
    document.querySelector('.ai-message:last-child')?.remove();
    addChatMessage("Sorry, I'm having trouble connecting right now.", 'ai');
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

// --- Initialize app ---
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadCurrentUser();
  try {
    workoutProgress = JSON.parse(localStorage.getItem('workoutProgress')) || {};
  } catch {
    workoutProgress = {};
  }
  showPage('homeScreen');
});
