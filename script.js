// === CONFIGURATION & STATE ===
const GOOGLE_CONFIG = {
  CLIENT_ID:
    '1040913543341-0vj52ims83dkcudpvh6rdtvrvr5da5nn.apps.googleusercontent.com',
  SPREADSHEET_ID: '15O-z40Jsy2PFs0XaXle07g_hJuwBCgpEi399TC9Yaic',
  SCOPES: 'https://www.googleapis.com/auth/spreadsheets',
};

// Workout data structure
const workoutData = {
  1: {
    name: 'Push Day 1',
    bodyPart: 'Push',
    exercises: [
      { name: 'BB Flat Bench Press', sets: 4 },
      { name: 'DB Incline Press', sets: 3 },
      { name: 'DB Shoulder Press', sets: 4 },
      { name: 'Cable Straight Pushdown', sets: 3 },
      { name: 'DB Lateral Raises', sets: 4 },
      { name: 'Overhead Tricep Extension', sets: 3 },
    ],
  },
  2: {
    name: 'Pull Day 1',
    bodyPart: 'Pull',
    exercises: [
      { name: 'Lat Pulldown', sets: 4 },
      { name: 'Deadlift', sets: 4 },
      { name: 'Barbell Shrugs', sets: 4 },
      { name: 'Seated Cable Row', sets: 4 },
      { name: 'DB Hammer Curls', sets: 3 },
    ],
  },
  3: {
    name: 'Leg Day',
    bodyPart: 'Legs',
    exercises: [
      { name: 'BB Squat', sets: 4 },
      { name: 'Lunges', sets: 3 },
      { name: 'Sumo Leg Press', sets: 3 },
      { name: 'Hamstring Curls', sets: 3 },
      { name: 'Calf Raises', sets: 4 },
    ],
  },
  4: {
    name: 'Push Day 2',
    bodyPart: 'Push',
    exercises: [
      { name: 'BB Incline Bench', sets: 3 },
      { name: 'Cable Rope Face Pulls', sets: 3 },
      { name: 'Close Grip Bench Press', sets: 3 },
      { name: 'Front Plate Raise', sets: 2 },
    ],
  },
  5: {
    name: 'Pull Day 2',
    bodyPart: 'Pull',
    exercises: [
      { name: 'Close Grip Lat Pulldown', sets: 3 },
      { name: 'BB Row', sets: 3 },
      { name: 'Face Pulls', sets: 3 },
      { name: 'Incline Curls', sets: 3 },
    ],
  },
  6: {
    name: 'Arms Day',
    bodyPart: 'Arms',
    exercises: [
      { name: 'Cable EZ Bar Curls', sets: 4 },
      { name: 'Tricep Pushdowns', sets: 4 },
      { name: 'Preacher Curls', sets: 3 },
      { name: 'Wrist Curls', sets: 3 },
      { name: 'Farmer Walks', sets: 3 },
    ],
  },
};

let currentUser = 'Harjas';
let currentDay = 1;
let workoutProgress = {};
let gapiInited = false;
let gisInited = false;
let tokenClient;
let sheetData = [];
let chartInstances = {};

// === ELEMENT REFERENCES ===
const authorizeBtnHome = document.getElementById('authorizeBtnHome');
const authorizeBtnWorkout = document.getElementById('authorizeBtnWorkout');
const authorizeBtnDashboard = document.getElementById('authorizeBtnDashboard');
const syncBtnHome = document.getElementById('syncBtnHome');
const syncBtnWorkout = document.getElementById('syncBtnWorkout');
const syncBtnDashboard = document.getElementById('syncBtnDashboard');
const globalSyncBtn = document.getElementById('globalSyncBtn');
const analyzeProgressBtn = document.getElementById('analyzeProgressBtn');
const clearSheetBtn = document.getElementById('clearSheetBtn');
const backToHomeBtn = document.getElementById('backToHomeBtn');
const resetWorkoutBtn = document.getElementById('resetWorkoutBtn');

const workoutGrid = document.getElementById('workoutGrid');
const workoutSectionTitle = document.getElementById('workout-section-title');
const homeUserCards = document.querySelectorAll('.user-card');

const workoutScreen = document.getElementById('workoutScreen');
const exerciseListContainer = document.getElementById('exerciseListContainer');
const workoutNotes = document.getElementById('workoutNotes');
const currentWorkoutTitle = document.getElementById('currentWorkoutTitle');

const dashboardScreen = document.getElementById('dashboardScreen');
const dateRangeFilter = document.getElementById('dateRangeFilter');
const customDateContainer = document.getElementById('customDateContainer');
const startDateFilter = document.getElementById('startDateFilter');
const endDateFilter = document.getElementById('endDateFilter');
const bodyPartFilter = document.getElementById('bodyPartFilter');
const exerciseFilter = document.getElementById('exerciseFilter');
const dashboardContent = document.getElementById('dashboardContent');

// AI Chat
const aiChatModal = document.getElementById('aiChatModal');
const chatToggleBtn = document.getElementById('chatToggleBtn');
const closeChatBtn = document.getElementById('closeChatBtn');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChatBtn');

// Pages and navigation
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');

// === INITIALIZATION ===
window.gapiLoaded = function () {
  gapi.load('client', initializeGapiClient);
};
window.gisLoaded = function () {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CONFIG.CLIENT_ID,
    scope: GOOGLE_CONFIG.SCOPES,
    callback: handleAuthResponse,
  });
  gisInited = true;
  checkInitialAuth();
};

async function initializeGapiClient() {
  await gapi.client.init({
    discoveryDocs: [
      'https://sheets.googleapis.com/$discovery/rest?version=v4',
    ],
  });
  gapiInited = true;
  checkInitialAuth();
}

function checkInitialAuth() {
  if (gapiInited && gisInited) {
    const token = gapi.client.getToken();
    updateSigninStatus(token !== null);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadCurrentUser();
  loadWorkoutProgress();
  renderHome();
  updateSyncButtonsVisibility(false);
});

// === EVENT LISTENERS SETUP ===
function setupEventListeners() {
  // Navigation links
  navLinks.forEach((link) =>
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showPage(link.dataset.page);
    }),
  );

  // Home user selector cards
  homeUserCards.forEach((card) =>
    card.addEventListener('click', () => selectUser(card.dataset.user)),
  );

  // Workout day cards rendered, delegated later

  backToHomeBtn.addEventListener('click', () => showPage('homeScreen'));

  // Authorize buttons
  [authorizeBtnHome, authorizeBtnWorkout, authorizeBtnDashboard].forEach(
    (btn) => {
      btn.addEventListener('click', handleAuthClick);
    },
  );

  // Sync buttons
  syncBtnHome.addEventListener('click', syncWorkoutData);
  syncBtnWorkout.addEventListener('click', syncWorkoutData);
  syncBtnDashboard.addEventListener('click', () =>
    fetchDashboardData(true),
  );
  globalSyncBtn.addEventListener('click', syncWorkoutData);

  resetWorkoutBtn.addEventListener('click', resetCurrentWorkout);

  workoutNotes.addEventListener('input', saveNotes);

  // Dashboard filters
  dateRangeFilter.addEventListener('change', handleDateRangeChange);
  startDateFilter.addEventListener('change', renderDashboard);
  endDateFilter.addEventListener('change', renderDashboard);
  bodyPartFilter.addEventListener('change', () => {
    populateExerciseFilter();
    renderDashboard();
  });
  exerciseFilter.addEventListener('change', renderDashboard);

  analyzeProgressBtn.addEventListener('click', analyzeProgressWithAI);
  clearSheetBtn.addEventListener('click', clearGoogleSheet);

  // AI Chat event listeners
  chatToggleBtn.addEventListener('click', () => aiChatModal.classList.add('active'));
  closeChatBtn.addEventListener('click', () => aiChatModal.classList.remove('active'));
  sendChatBtn.addEventListener('click', sendChatMessage);
  chatInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendChatMessage();
  });
}

// === USER FUNCTIONS ===
function loadCurrentUser() {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser && (savedUser === 'Harjas' || savedUser === 'Darvesh')) {
    currentUser = savedUser;
  }
  updateUserCards();
}

function updateUserCards() {
  homeUserCards.forEach((card) => {
    card.classList.toggle('active', card.dataset.user === currentUser);
  });
  workoutSectionTitle.textContent = `Select Workout for ${currentUser}`;
}

function selectUser(user) {
  if (user !== currentUser) {
    currentUser = user;
    localStorage.setItem('currentUser', currentUser);
    updateUserCards();
    if (document.getElementById('dashboardScreen').classList.contains('active')) {
      fetchDashboardData(false);
    }
  }
}

// === PAGE & UI FUNCTIONS ===
function showPage(pageId) {
  pages.forEach((p) => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  navLinks.forEach((l) => l.classList.toggle('active', l.dataset.page === pageId));
  if (pageId === 'dashboardScreen') {
    if (gapi.client.getToken()) fetchDashboardData(false);
    else dashboardContent.innerHTML =
      `<div class="dashboard-card"><p>Please authorize to view dashboard.</p></div>`;
  }
  if (pageId === 'homeScreen') {
    renderHome();
  }
  if (pageId === 'workoutScreen') {
    loadWorkoutUI();
  }
}

function renderHome() {
  workoutGrid.innerHTML = '';
  Object.entries(workoutData).forEach(([day, workout]) => {
    const card = document.createElement('div');
    card.className = 'day-card';
    card.dataset.day = day;
    card.tabIndex = 0;
    card.role = 'button';
    card.setAttribute('aria-label', workout.name);
    card.innerHTML = `<i class="fas fa-dumbbell"></i><h3>${workout.name}</h3>`;
    card.addEventListener('click', () => startWorkout(parseInt(day)));
    card.addEventListener('keypress', e => {
      if (e.key === 'Enter' || e.key === ' ') startWorkout(parseInt(day));
    });
    workoutGrid.appendChild(card);
  });
}

// === WORKOUT SCREEN FUNCTIONS ===
function startWorkout(day) {
  currentDay = day;
  showPage('workoutScreen');
}

function loadWorkoutUI() {
  const workout = workoutData[currentDay];
  currentWorkoutTitle.textContent = workout.name;
  exerciseListContainer.innerHTML = '';

  // Initialize structure if missing in progress
  if (!workoutProgress[currentDay]) {
    workoutProgress[currentDay] = {
      date: new Date().toISOString().split('T')[0],
      sets: {},
      notes: '',
    };
  }

  workout.exercises.forEach((exercise, exIdx) => {
    const setsHtml = Array.from({ length: exercise.sets }, (_, setIdx) => {
      const setData =
        workoutProgress[currentDay].sets[exIdx] &&
        workoutProgress[currentDay].sets[exIdx][setIdx]
          ? workoutProgress[currentDay].sets[exIdx][setIdx]
          : { completed: false, weight: '', reps: '' };
      return `
        <div class="set-row${setData.completed ? ' completed' : ''}" data-ex="${exIdx}" data-set="${setIdx}">
          <input type="checkbox" class="set-checkbox" ${
            setData.completed ? 'checked' : ''
          } aria-label="Complete set ${setIdx + 1} for ${exercise.name}" />
          <span>Set ${setIdx + 1}</span>
          <input type="number" class="set-input" placeholder="kg" min="0" step="0.5" value="${
            setData.weight || ''
          }" aria-label="Weight for set ${setIdx + 1}" />
          <input type="number" class="set-input" placeholder="reps" min="1" value="${
            setData.reps || ''
          }" aria-label="Reps for set ${setIdx + 1}" />
        </div>`;
    }).join('');

    const exerciseCard = document.createElement('div');
    exerciseCard.className = 'exercise-card';
    exerciseCard.innerHTML = `<h3>${exercise.name}</h3>${setsHtml}`;
    exerciseListContainer.appendChild(exerciseCard);
  });

  workoutNotes.value = workoutProgress[currentDay].notes || '';

  // Add event listeners for change events on inputs and checkboxes
  exerciseListContainer.querySelectorAll('.set-checkbox, .set-input').forEach((el) => {
    el.addEventListener('change', handleSetChange);
  });
}

function handleSetChange(e) {
  const row = e.target.closest('.set-row');
  const exIdx = parseInt(row.dataset.ex);
  const setIdx = parseInt(row.dataset.set);
  if (!workoutProgress[currentDay].sets[exIdx]) {
    workoutProgress[currentDay].sets[exIdx] = {};
  }
  workoutProgress[currentDay].sets[exIdx][setIdx] = {
    completed: row.querySelector('.set-checkbox').checked,
    weight: row.querySelector('input[placeholder="kg"]').value,
    reps: row.querySelector('input[placeholder="reps"]').value,
  };
  row.classList.toggle('completed', workoutProgress[currentDay].sets[exIdx][setIdx].completed);

  saveWorkoutProgress();
}

function saveNotes(e) {
  workoutProgress[currentDay].notes = e.target.value;
  saveWorkoutProgress();
}

function resetCurrentWorkout() {
  if (
    confirm(
      'Are you sure you want to reset all entries for this workout session? This will not affect your Google Sheet.',
    )
  ) {
    if (workoutProgress[currentDay]) {
      delete workoutProgress[currentDay];
      saveWorkoutProgress();
      loadWorkoutUI();
      showNotification('Workout session has been reset.', 'info');
    }
  }
}

// === WORKOUT PROGRESS STORAGE ===
function saveWorkoutProgress() {
  localStorage.setItem('workoutProgress', JSON.stringify(workoutProgress));
  updateGlobalSyncBtnVisibility();
}

function loadWorkoutProgress() {
  const stored = localStorage.getItem('workoutProgress');
  workoutProgress = stored ? JSON.parse(stored) : {};
  updateGlobalSyncBtnVisibility();
}

// === SYNC FUNCTIONALITY ===

function updateSyncButtonsVisibility(isAuthorized) {
  [syncBtnHome, syncBtnWorkout, syncBtnDashboard, globalSyncBtn].forEach((btn) => {
    if (isAuthorized) btn.classList.remove('hidden');
    else btn.classList.add('hidden');
  });

  [authorizeBtnHome, authorizeBtnWorkout, authorizeBtnDashboard].forEach((btn) => {
    if (isAuthorized) btn.classList.add('hidden');
    else btn.classList.remove('hidden');
  });

  // Enable or disable sync buttons based on auth and data presence
  const hasData = hasPendingData();
  [syncBtnHome, syncBtnWorkout, syncBtnDashboard, globalSyncBtn].forEach((btn) => {
    btn.disabled = !hasData || !isAuthorized;
  });

  // Authorize buttons enabled only if not authorized
  [authorizeBtnHome, authorizeBtnWorkout, authorizeBtnDashboard].forEach(
    (btn) => (btn.disabled = isAuthorized),
  );
}

function hasPendingData() {
  // Returns true if workoutProgress has any data
  return Object.keys(workoutProgress).some((day) => {
    const progress = workoutProgress[day];
    if (!progress.sets) return false;
    return Object.values(progress.sets).some((exSets) =>
      Object.values(exSets).some((set) => set.completed),
    );
  });
}

async function handleAuthClick() {
  if (gapiInited && gisInited) {
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    showNotification('Google API is not ready yet. Please try again in a moment.', 'error');
  }
}

function handleAuthResponse(resp) {
  if (resp.error) {
    console.error('Auth Error:', resp);
    showNotification('Authorization failed. Please try again.', 'error');
    updateSigninStatus(false);
    return;
  }
  updateSigninStatus(true);
}

function updateSigninStatus(isSignedIn) {
  updateSyncButtonsVisibility(isSignedIn);
  if (isSignedIn) {
    fetchDashboardData(false);
  } else {
    dashboardContent.innerHTML =
      `<div class="dashboard-card"><p>Please authorize to view dashboard.</p></div>`;
  }
}

async function syncWorkoutData() {
  if (!gapi.client.getToken()) {
    showNotification('Please authorize first.', 'error');
    return;
  }
  const dataToSync = prepareDataForSheets();
  if (dataToSync.length === 0) {
    showNotification('No pending workouts to sync.', 'info');
    return;
  }
  showNotification('Syncing workouts...', 'info');
  try {
    await gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
      range: 'WorkoutLog!A1',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: dataToSync },
    });
    showNotification('Workouts synced successfully!', 'success');

    // Remove synced days data from local progress
    dataToSync.forEach((row) => {
      const date = row[0];
      // Find workout day by workout name
      const dayKey = Object.keys(workoutData).find(
        (d) => workoutData[d].name === row[1],
      );
      if (dayKey && workoutProgress[dayKey]) {
        delete workoutProgress[dayKey];
      }
    });
    saveWorkoutProgress();
  } catch (error) {
    console.error('Sync Error:', error);
    showNotification('Sync failed. Check console.', 'error');
  }
}

function prepareDataForSheets() {
  const rows = [];
  for (const dayKey in workoutProgress) {
    const workout = workoutData[dayKey];
    const progress = workoutProgress[dayKey];
    if (!workout || !progress.sets) continue;
    let hasCompletedSets = false;
    Object.keys(progress.sets).forEach((exIndex) =>
      Object.keys(progress.sets[exIndex]).forEach((setIndex) => {
        if (progress.sets[exIndex][setIndex].completed) hasCompletedSets = true;
      }),
    );
    if (hasCompletedSets) {
      const workoutNotes = progress.notes || '';
      let noteAdded = false;
      Object.keys(progress.sets).forEach((exIndex) =>
        Object.keys(progress.sets[exIndex]).forEach((setIndex) => {
          const set = progress.sets[exIndex][setIndex];
          if (set.completed) {
            rows.push([
              progress.date,
              workout.name,
              workout.bodyPart,
              workout.exercises[exIndex].name,
              set.weight || 0,
              set.reps || 0,
              currentUser,
              noteAdded ? '' : workoutNotes,
            ]);
            noteAdded = true;
          }
        }),
      );
    }
  }
  return rows;
}

// === DASHBOARD FUNCTIONS ===
async function fetchDashboardData(showNotificationOnFail) {
  if (!gapi.client.getToken()) {
    dashboardContent.innerHTML =
      `<div class="dashboard-card"><p>Please authorize to view dashboard.</p></div>`;
    return;
  }
  try {
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
      range: 'WorkoutLog!A2:H',
    });
    sheetData = (response.result.values || []).map((row) => ({
      // Dates normalized
      date: new Date(row[0] + 'T00:00:00'),
      bodyPart: row[2],
      exercise: row[3],
      weight: parseFloat(row[4]) || 0,
      reps: parseInt(row[5]) || 0,
      user: row[6],
      notes: row[7],
    }));
    populateBodyPartFilter();
    handleDateRangeChange();
    if (showNotificationOnFail !== false)
      showNotification('Dashboard data synced.', 'success');
  } catch (err) {
    console.error('Error fetching data:', err);
    if (showNotificationOnFail) showNotification('Failed to fetch dashboard data.', 'error');
  }
}

function handleDateRangeChange() {
  const range = dateRangeFilter.value;
  if (range === 'custom') {
    customDateContainer.classList.remove('hidden');
  } else {
    customDateContainer.classList.add('hidden');
    const endDate = new Date();
    const startDate = new Date();

    if (range === 'all') {
      startDateFilter.value = '';
      endDateFilter.value = '';
    } else {
      startDate.setDate(endDate.getDate() - parseInt(range));
      startDateFilter.valueAsDate = startDate;
      endDateFilter.valueAsDate = endDate;
    }
  }
  renderDashboard();
}

function populateBodyPartFilter() {
  const bodyParts = [
    ...new Set(
      sheetData.filter((row) => row.user === currentUser).map((row) => row.bodyPart),
    ),
  ].filter(Boolean);
  bodyPartFilter.innerHTML = '<option value="all">All Body Parts</option>';
  bodyParts.forEach((bp) => {
    const option = document.createElement('option');
    option.value = bp;
    option.textContent = bp;
    bodyPartFilter.appendChild(option);
  });
  populateExerciseFilter();
}

function populateExerciseFilter() {
  const bodyPart = bodyPartFilter.value;
  const exercises = [
    ...new Set(
      sheetData
        .filter(
          (row) =>
            row.user === currentUser &&
            (bodyPart === 'all' || row.bodyPart === bodyPart),
        )
        .map((row) => row.exercise),
    ),
  ].filter(Boolean);
  exerciseFilter.innerHTML = '<option value="all">All Exercises</option>';
  exercises.forEach((ex) => {
    const option = document.createElement('option');
    option.value = ex;
    option.textContent = ex;
    exerciseFilter.appendChild(option);
  });
  exerciseFilter.disabled = exercises.length === 0;
}

function renderDashboard() {
  const bodyPart = bodyPartFilter.value;
  const exercise = exerciseFilter.value;
  const startDateVal = startDateFilter.value;
  const endDateVal = endDateFilter.value;
  const startDate = startDateVal ? new Date(startDateVal + 'T00:00:00') : null;
  const endDate = endDateVal ? new Date(endDateVal + 'T23:59:59') : null;

  const filtered = sheetData.filter((row) => {
    return (
      row.user === currentUser &&
      (bodyPart === 'all' || row.bodyPart === bodyPart) &&
      (exercise === 'all' || row.exercise === exercise) &&
      (!startDate || row.date >= startDate) &&
      (!endDate || row.date <= endDate)
    );
  });

  if (filtered.length === 0) {
    dashboardContent.innerHTML = `<div class="dashboard-card"><p>No data found for this selection.</p></div>`;
    return;
  }

  // Calculate estimated 1RM (Epley Formula)
  const e1RM = (w, r) => (r > 0 ? w * (1 + r / 30) : 0);
  filtered.forEach((row) => (row.e1RM = e1RM(row.weight, row.reps)));

  // Find best set overall for stats
  const bestSet = filtered.reduce(
    (max, row) => (row.e1RM > max.e1RM ? row : max),
    { e1RM: 0 },
  );

  // Progress data sorted by date for best exercise
  const progressData = filtered
    .filter((row) => row.exercise === bestSet.exercise)
    .sort((a, b) => a.date - b.date);

  const strengthChange =
    progressData.length > 1
      ? (
          ((progressData[progressData.length - 1].e1RM -
            progressData[0].e1RM) /
            progressData[0].e1RM) *
          100
        ).toFixed(1)
      : 0;

  dashboardContent.innerHTML = `
    <div class="dashboard-card">
      <h3>Best Lift</h3>
      <p style="font-size: 2rem; font-weight: 700;">${bestSet.weight} kg x ${
    bestSet.reps
  } reps</p>
      <small>${bestSet.exercise}</small>
    </div>
    <div class="dashboard-card">
      <h3>Est. 1-Rep Max</h3>
      <p style="font-size: 2rem; font-weight: 700;">${bestSet.e1RM.toFixed(
        1,
      )} kg</p>
      <small>Your estimated strength score.</small>
    </div>
    <div class="dashboard-card tip-card">
      <h3><i class="fas fa-lightbulb"></i>Quick Tip</h3>
      <p>${generateAITip(strengthChange, bestSet.reps)}</p>
    </div>
    <div id="aiAnalysisCard" class="dashboard-card" style="grid-column: 1 / -1; display: none;">
      <h3>AI Analysis</h3>
      <div id="aiAnalysisContent"></div>
    </div>
    <div class="dashboard-card" style="grid-column: 1 / -1;">
      <div class="chart-container">
        <canvas id="progressChart"></canvas>
      </div>
    </div>`;

  renderProgressChart(progressData, 'progressChart');
}

function renderProgressChart(data, canvasId) {
  if (chartInstances[canvasId]) chartInstances[canvasId].destroy();
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return;
  chartInstances[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map((d) => d.date.toLocaleDateString()),
      datasets: [
        {
          label: 'Estimated 1RM (kg)',
          data: data.map((d) => d.e1RM.toFixed(1)),
          borderColor: 'var(--primary-color)',
          tension: 0.1,
          fill: true,
        },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false },
  });
}

function generateAITip(change, reps) {
  if (change > 5)
    return `Incredible progress! Your strength has increased by ${change}%. Consider a slight weight increase to continue this trend.`;
  if (change > 0)
    return `Nice work, you're making steady gains. Keep up the consistency.`;
  if (reps < 6)
    return `You're lifting heavy! To maximize muscle growth, ensure you're also incorporating sets in the 8-12 rep range.`;
  if (reps > 15)
    return `Great endurance! To build more top-end strength, try increasing the weight so your reps fall in the 6-10 range.`;
  return `Consistency is key. You're laying the foundation for future progress. Keep showing up!`;
}

// AI Analysis & Chat

async function analyzeProgressWithAI() {
  if (!gapi.client.getToken()) {
    showNotification('Please authorize first.', 'error');
    return;
  }
  const exercise = exerciseFilter.value;
  if (exercise === 'all') {
    showNotification('Please select a specific exercise to analyze.', 'info');
    return;
  }
  const analysisCard = document.getElementById('aiAnalysisCard');
  const analysisContent = document.getElementById('aiAnalysisContent');
  analysisCard.style.display = 'block';
  analysisContent.innerHTML = '<p>AI is analyzing your progress...</p>';

  const filteredData = sheetData
    .filter((row) => row.user === currentUser && row.exercise === exercise)
    .sort((a, b) => a.date - b.date);

  if (filteredData.length < 2) {
    analysisContent.innerHTML =
      '<p>Not enough data to analyze. Please complete at least two sessions for this exercise.</p>';
    return;
  }

  const summary = `User: ${currentUser}. Exercise: ${exercise}. Performance History (last 5 sessions): ${filteredData
    .slice(-5)
    .map(
      (d) =>
        `${d.date.toLocaleDateString()}: ${d.weight}kg x ${d.reps}reps`,
    )
    .join(', ')}`;

  try {
    const response = await fetch('/.netlify/functions/ask-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'analysis', payload: summary }),
    });
    if (!response.ok) throw new Error('AI analysis failed.');
    const { message } = await response.json();
    analysisContent.innerHTML = message
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  } catch (error) {
    analysisContent.innerHTML =
      '<p>Sorry, the AI analysis could not be completed at this time.</p>';
  }
}

// Clear Sheet Data

async function clearGoogleSheet() {
  if (!gapi.client.getToken()) {
    showNotification('Please authorize first.', 'error');
    return;
  }
  if (
    !confirm(
      `This will delete ALL data for BOTH users from the Google Sheet. This action cannot be undone. Are you sure?`,
    )
  )
    return;
  showNotification('Clearing sheet data...', 'info');
  try {
    await gapi.client.sheets.spreadsheets.values.clear({
      spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
      range: 'WorkoutLog!A2:H',
    });
    sheetData = [];
    renderDashboard();
    showNotification('All data has been cleared from your Google Sheet.', 'success');
  } catch (err) {
    console.error('Error clearing sheet:', err);
    showNotification('Failed to clear sheet data.', 'error');
  }
}

// === AI CHAT ===

function addChatMessage(message, sender) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `${sender}-message`;
  msgDiv.innerHTML = `<p>${message}</p>`;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendChatMessage() {
  const userMessage = chatInput.value.trim();
  if (!userMessage) return;
  addChatMessage(userMessage, 'user');
  chatInput.value = '';
  addChatMessage('<i>AI is thinking...</i>', 'ai');
  try {
    const response = await fetch('/.netlify/functions/ask-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'chat', payload: userMessage }),
    });
    if (!response.ok) throw new Error(`Function Error: ${response.statusText}`);
    const data = await response.json();
    // Remove last AI message loading
    const lastAiMsg = chatMessages.querySelector('.ai-message:last-child');
    if (lastAiMsg) chatMessages.removeChild(lastAiMsg);
    addChatMessage(
      data.message.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
      'ai',
    );
  } catch (error) {
    console.error('AI Chat Error:', error);
    const lastAiMsg = chatMessages.querySelector('.ai-message:last-child');
    if (lastAiMsg) chatMessages.removeChild(lastAiMsg);
    addChatMessage("Sorry, I'm having trouble connecting right now.", 'ai');
  }
}

// === NOTIFICATIONS ===
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

// === GLOBAL SYNC BUTTON VISIBILITY BASED ON LOCAL DATA ===
function updateGlobalSyncBtnVisibility() {
  if (hasPendingData() && gapi.client.getToken()) {
    globalSyncBtn.classList.remove('hidden');
  } else {
    globalSyncBtn.classList.add('hidden');
  }
}
