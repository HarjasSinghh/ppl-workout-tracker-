'use strict';

/** 
 * Global Google API callbacks required for async script loading.
 * These must be attached to window so the API scripts can call them on load.
 */
window.gapiLoaded = gapiLoaded;
window.gisLoaded = gisLoaded;

// --------------------------
// 1. Configuration & Global State
const GOOGLE_CONFIG = {
  CLIENT_ID: '1040913543341-0vj52ims83dkcudpvh6rdtvrvr5da5nn.apps.googleusercontent.com',
  SPREADSHEET_ID: '15O-z40Jsy2PFs0XaXle07g_hJuwBCgpEi399TC9Yaic',
  SCOPES: 'https://www.googleapis.com/auth/spreadsheets',
};

const workoutData = {
  1: {
    name: 'Push Day 1',
    bodyPart: 'Push',
    exercises: [
      { name: 'BB Flat Bench Press', sets: 4, reps: '10, 8, 6, 4', alternatives: ['Machine bench press', 'incline bench press', 'db flat bench press'] },
      { name: 'DB Incline Press', sets: 3, reps: '12, 8, 6', alternatives: ['Incline bench press', 'machine incline bench press', 'flat db bench press'] },
      { name: 'DB Shoulder Press', sets: 4, reps: '15, 12, 10, 6', alternatives: ['Machine shoulder press', 'barbell shoulder press', 'shoulder front raises'] },
      { name: 'Cable Straight Pushdown', sets: 3, reps: '15, 12, 10 + drop', alternatives: ['Rope pushdowns', 'single hand cable pushdowns', 'skull crushers'] },
      { name: 'DB Lateral Raises', sets: 4, reps: '12, 10, 8, complex', alternatives: ['Upright rows', 'laying lateral raises'] },
      { name: 'Overhead Tricep Extension', sets: 3, reps: '15, 12, 10', alternatives: ['Rope pushdowns', 'skull crushers'] },
      { name: 'Cable Chest Fly', sets: 3, reps: '20, 16, 12', alternatives: ['Machine fly', 'db fly'] },
    ],
  },
  2: {
    name: 'Pull Day 1',
    bodyPart: 'Pull',
    exercises: [
      { name: 'Lat Pulldown', sets: 4, reps: '12, 10, 6, 6 peak', alternatives: ['DB row', 'barbell row', 'pull ups'] },
      { name: 'Deadlift', sets: 4, reps: '10, 8, 6, 4', alternatives: ['Back extension', 'db deadlift'] },
      { name: 'Seated Close Grip Row', sets: 4, reps: '12, 10, 10, 10 peak', alternatives: ['Row with narrow bar', 'row with wide bar', 'db and bb row'] },
      { name: 'Rope Pull Overs', sets: 3, reps: '16, 12, 10', alternatives: ['Pull over with db'] },
      { name: 'DB Hammer Curls', sets: 3, reps: '15, 12, 10', alternatives: ['DB curls', 'preacher curls'] },
      { name: 'Preacher Curls', sets: 4, reps: '16, 12, 10, 8', alternatives: ['DB curls', 'seated curls'] },
      { name: 'Barbell Curls', sets: 2, reps: '20, 15', alternatives: ['Supinated curls', 'cable curls'] },
    ],
  },
  // ... (Rest of workout days 3-6 structured identically, omitted here for brevity; please include them all as per your full data)
};

// --------------------------
// 2. App variables and state
let currentUser = localStorage.getItem('currentUser') || 'Harjas';
let currentDay = 1;
let workoutProgress = {};
let gapiInited = false;
let gisInited = false;
let tokenClient;
let isApiReady = false;
let silentAuthTried = false;

let sheetData = [];
let chartInstance = null;

// --------------------------
// 3. Google API Initialization and OAuth Flow

function gapiLoaded() {
  gapi.load('client', async () => {
    try {
      await gapi.client.init({
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
      });
      gapiInited = true;
      onApiReady();
    } catch (e) {
      showNotification('Failed to initialize Google Sheets API.', 'error');
      console.error('gapi init error:', e);
      enableAuthorizeButtons(true, 'Authorize');
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
    onApiReady();
  } catch (e) {
    showNotification('Failed to initialize Google Sign-In.', 'error');
    console.error('gis init error:', e);
    enableAuthorizeButtons(true, 'Authorize');
  }
}

function onApiReady() {
  if (gapiInited && gisInited) {
    isApiReady = true;
    enableAuthorizeButtons(true, 'Authorize');
    if (!silentAuthTried) {
      silentAuthTried = true;
      silentAuthorize();
    }
  }
}

function silentAuthorize() {
  if (!tokenClient) return;
  tokenClient.requestAccessToken({ prompt: 'none' });
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
    showNotification('Authorization denied or failed. Please try again.', 'error');
    updateAuthorizationUI(false);
    return;
  }
  updateAuthorizationUI(true);
}

function enableAuthorizeButtons(enabled, text) {
  document.querySelectorAll('[id^="authorizeBtn"]').forEach(btn => {
    btn.disabled = !enabled;
    btn.style.opacity = enabled ? '1' : '0.5';
    btn.style.pointerEvents = enabled ? 'auto' : 'none';
    btn.innerHTML = `<i class="fab fa-google"></i> ${text}`;
  });
}

function updateAuthorizationUI(isSignedIn) {
  document.querySelectorAll('[id^="authorizeBtn"]').forEach(btn => btn.classList.toggle('hidden', isSignedIn));
  document.querySelectorAll('[id^="syncBtn"], #globalSyncBtn').forEach(btn => btn.classList.toggle('hidden', !isSignedIn));

  const hasPending = checkPendingWorkoutData();
  document.getElementById('globalSyncBtn').disabled = !hasPending;
  document.querySelectorAll('#syncBtnHome, #syncBtnWorkout').forEach(btn => btn.disabled = !hasPending);

  ['analyzeProgressBtn', 'clearSheetBtn', 'syncBtnDashboard'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = !isSignedIn;
  });

  if (isSignedIn && document.getElementById('dashboardScreen')?.classList.contains('active')) {
    fetchDashboardData(false);
  }
  else if(!isSignedIn) {
    const dashCont = document.getElementById('dashboardContent');
    if(dashCont) {
      dashCont.innerHTML = '<div class="dashboard-card"><p>Please authorize to view dashboard.</p></div>';
    }
  }
}

// --------------------------
// 4. Local Data Persistence Helpers
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
  for (const dayProgress of Object.values(workoutProgress)) {
    if (!dayProgress.sets) continue;
    for (const exercise of Object.values(dayProgress.sets)) {
      for (const set of Object.values(exercise)) {
        if (typeof set === 'object' && set.completed) return true;
      }
    }
  }
  return false;
}

// --------------------------
// 5. UI & Exercise Data Input Helpers
// Weight Select Dropdown (increments of 2 & 5, up to 150) + "Custom..."
function createWeightSelect(currentValue = '') {
  const select = document.createElement('select');
  select.className = 'set-input weight-select';
  select.style.maxWidth = '110px';

  // Generate increments by 2 from 0-150, and add 5 increments where not overlapping
  const increments = new Set();
  for(let i=0; i<=150; i+=2) increments.add(i);
  for(let i=5; i<=150; i+=5) increments.add(i);
  const sortedVals = Array.from(increments).sort((a,b) => a-b);

  sortedVals.forEach(val => {
    const option = document.createElement('option');
    option.value = val.toString();
    option.textContent = val + ' kg';
    if(val.toString() === currentValue) option.selected = true;
    select.appendChild(option);
  });

  // Add custom option
  const customOpt = document.createElement('option');
  customOpt.value = 'custom';
  customOpt.textContent = 'Custom...';
  if(!sortedVals.includes(Number(currentValue))) {
    customOpt.selected = true;
  }
  select.appendChild(customOpt);

  // On custom select, replace select with numeric input
  select.addEventListener('change', () => {
    if(select.value === 'custom') {
      const input = document.createElement('input');
      input.type = 'number';
      input.min = '0';
      input.max = '150';
      input.step = '0.1';
      input.className = 'set-input weight-input';
      input.value = '';
      input.style.maxWidth = '110px';
      select.replaceWith(input);
      
      input.focus();

      // On blur or enter, revert back to select with new value
      function revert() {
        const newVal = input.value;
        const newSelect = createWeightSelect(newVal);
        input.replaceWith(newSelect);
        newSelect.dispatchEvent(new Event('change'));
      }

      input.addEventListener('blur', revert);
      input.addEventListener('keydown', e => {
        if(e.key === 'Enter') {
          e.preventDefault();
          revert();
        }
      });
    }
  });

  return select;
}

// Reps select dropdown 1 to 20
function createRepsSelect(currentValue = '') {
  const select = document.createElement('select');
  select.className = 'set-input reps-select';
  select.style.maxWidth = '72px';
  for(let i=1;i<=20;i++){
    const opt = document.createElement('option');
    opt.value = i.toString();
    opt.textContent = i.toString();
    if(i.toString() === currentValue) opt.selected = true;
    select.appendChild(opt);
  }
  return select;
}

// --------------------------
// 6. Workout UI Rendering

function renderHome() {
  const container = document.getElementById('workoutGrid');
  if(!container) return;
  container.innerHTML = '';
  Object.entries(workoutData).forEach(([day, workout]) => {
    const dayCard = document.createElement('div');
    dayCard.className = 'day-card';
    dayCard.dataset.day = day;
    dayCard.tabIndex = 0;
    dayCard.innerHTML = `<i class="fas fa-dumbbell"></i><h3>${workout.name}</h3>`;
    dayCard.addEventListener('click', () => {
      currentDay = day;
      showPage('workoutScreen');
      loadWorkoutUI();
    });
    container.appendChild(dayCard);
  });
}

// Load workout screen UI with exercises and sets
function loadWorkoutUI() {
  const workout = workoutData[currentDay];
  if(!workout) return;

  const titleEl = document.getElementById('currentWorkoutTitle');
  if(titleEl) titleEl.textContent = workout.name;

  const exCon = document.getElementById('exerciseListContainer');
  if(!exCon) return;
  exCon.innerHTML = '';

  const progress = workoutProgress[currentDay] || { date: new Date().toISOString().slice(0,10), sets: {}, notes: '' };

  workout.exercises.forEach((exercise, exIdx) => {
    // Build exercise select dropdown for alternative exercises
    let exOptionsHTML = `<option value="${exercise.name}">${exercise.name}</option>`;
    exercise.alternatives?.forEach(alt => {
      exOptionsHTML += `<option value="${alt}">${alt}</option>`;
    });
    const selectedEx = progress.sets?.[exIdx]?.selectedExercise || exercise.name;
    
    const exerciseHeader = document.createElement('div');
    exerciseHeader.className = 'exercise-header';

    // Exercise select
    const exSelect = document.createElement('select');
    exSelect.className = 'exercise-select';
    exSelect.dataset.ex = exIdx.toString();
    exSelect.innerHTML = exOptionsHTML;
    exSelect.value = selectedEx;

    exerciseHeader.appendChild(exSelect);

    // Rep scheme label
    const repSpan = document.createElement('span');
    repSpan.className = 'rep-scheme';
    repSpan.textContent = `Target: ${exercise.reps}`;
    exerciseHeader.appendChild(repSpan);

    // Exercise card container
    const exerciseCard = document.createElement('div');
    exerciseCard.className = 'exercise-card';

    // Append exercise header
    exerciseCard.appendChild(exerciseHeader);

    // Render sets
    for(let setIdx=0; setIdx < exercise.sets; setIdx++) {
      const setRow = document.createElement('div');
      setRow.className = 'set-row';

      const setProg = progress.sets?.[exIdx]?.[setIdx] || {};

      if(setProg.completed) setRow.classList.add('completed');

      setRow.dataset.ex = exIdx.toString();
      setRow.dataset.set = setIdx.toString();

      // Checkbox for completed
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'set-checkbox';
      if(setProg.completed) checkbox.checked = true;

      // Label span "Set N"
      const setLabel = document.createElement('span');
      setLabel.textContent = `Set ${setIdx+1}`;

      // Weight dropdown or manual input
      let weightControl;
      if(setProg.weight && !['custom',''].includes(setProg.weight) && !isNaN(Number(setProg.weight))) {
        // Use dropdown, set to value or 'custom' if not matching preset
        weightControl = createWeightSelect(setProg.weight.toString());
      } else {
        // Default dropdown, select 'custom' so input will show later
        weightControl = createWeightSelect('');
      }

      // Reps dropdown (1-20)
      let repsControl;
      if(setProg.reps && !['',null].includes(setProg.reps) && !isNaN(Number(setProg.reps))) {
        repsControl = createRepsSelect(setProg.reps.toString());
      } else {
        repsControl = createRepsSelect('');
      }

      setRow.appendChild(checkbox);
      setRow.appendChild(setLabel);
      setRow.appendChild(weightControl);
      setRow.appendChild(repsControl);

      exerciseCard.appendChild(setRow);

      // Event listeners for dynamic inputs
      checkbox.addEventListener('change', handleSetChange);
      weightControl.addEventListener('change', handleSetWeightChange);
      repsControl.addEventListener('change', handleSetChange);
    }

    exSelect.addEventListener('change', handleExerciseChange);

    exCon.appendChild(exerciseCard);
  });

  // Notes textarea
  const notesArea = document.getElementById('workoutNotes');
  if(notesArea) notesArea.value = progress.notes || '';
  if(notesArea) notesArea.oninput = saveNotes;
}

// Event handlers for UI inputs
function handleExerciseChange(e) {
  const ex = e.target.dataset.ex;
  if(!workoutProgress[currentDay]) workoutProgress[currentDay] = { date: new Date().toISOString().slice(0,10), sets: {}, notes: '' };
  if(!workoutProgress[currentDay].sets[ex]) workoutProgress[currentDay].sets[ex] = {};
  workoutProgress[currentDay].sets[ex].selectedExercise = e.target.value;
  saveWorkoutProgress();
}

function handleSetChange(e) {
  const row = e.target.closest('.set-row');
  if(!row) return;
  const ex = row.dataset.ex;
  const set = row.dataset.set;
  if(!workoutProgress[currentDay]) workoutProgress[currentDay] = { date: new Date().toISOString().slice(0,10), sets: {}, notes: '' };
  if(!workoutProgress[currentDay].sets[ex]) workoutProgress[currentDay].sets[ex] = {};

  const completed = row.querySelector('.set-checkbox').checked;
  const weightInput = row.querySelector('.weight-input') || row.querySelector('.weight-select');
  const repsInput = row.querySelector('.reps-select');

  workoutProgress[currentDay].sets[ex][set] = {
    completed,
    weight: weightInput ? weightInput.value : '',
    reps: repsInput ? repsInput.value : '',
  };
  if(completed) row.classList.add('completed');
  else row.classList.remove('completed');

  saveWorkoutProgress();
}

// Special handler for weight select with "Custom..." option logic
function handleSetWeightChange(e) {
  const select = e.target;
  if(select.value === 'custom') {
    // Replace select with number input
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0'; input.max = '150'; input.step = '0.1';
    input.className = 'set-input weight-input';
    input.style.maxWidth = '110px';
    input.placeholder = 'Custom kg';
    const exRow = select.closest('.set-row');
    if(exRow) {
      exRow.replaceChild(input, select);
      input.focus();

      // Replace back on blur or enter key
      function revert() {
        const newVal = input.value;
        const newSelect = createWeightSelect(newVal);
        newSelect.addEventListener('change', handleSetWeightChange);
        input.replaceWith(newSelect);
        newSelect.dispatchEvent(new Event('change'));
      }
      input.onblur = revert;
      input.onkeydown = evt => {
        if(evt.key === 'Enter') { evt.preventDefault(); revert(); }
      };
    }
  } else {
    // normal value selected
    handleSetChange(e);
  }
}

function saveNotes(e) {
  if(!workoutProgress[currentDay]) workoutProgress[currentDay] = { date: new Date().toISOString().slice(0,10), sets: {}, notes: '' };
  workoutProgress[currentDay].notes = e.target.value;
  saveWorkoutProgress();
}

function resetCurrentWorkout() {
  if(confirm("Reset all logged data for this session? This will NOT remove data already synced to Google Sheets.")) {
    delete workoutProgress[currentDay];
    saveWorkoutProgress();
    loadWorkoutUI();
    showNotification('Workout session reset.', 'info');
  }
}

// --------------------------
// 7. Sync with Google Sheets

function prepareDataForSheets() {
  const rows = [];
  for (const dayKey in workoutProgress) {
    const workout = workoutData[dayKey];
    const progress = workoutProgress[dayKey];
    if(!workout || !progress.sets) continue;

    let noteUsed = false;
    for (const exIdx in progress.sets) {
      const exerciseDef = workout.exercises[exIdx];
      if(!exerciseDef) continue;

      const exerciseName = progress.sets[exIdx].selectedExercise || exerciseDef.name;

      for (const setIdx in progress.sets[exIdx]) {
        if(setIdx === 'selectedExercise') continue;
        const set = progress.sets[exIdx][setIdx];
        if(set && set.completed && (set.weight || set.reps)) {
          rows.push([
            progress.date,
            workout.name,
            exerciseName,
            parseInt(setIdx)+1,
            set.weight || 0,
            set.reps || 0,
            currentUser,
            noteUsed ? '' : progress.notes || '',
          ]);
          noteUsed = true;
        }
      }
    }
  }
  return rows;
}

async function syncWorkoutData() {
  if(!gapi.client?.getToken()) {
    showNotification('Please authorize first.', 'error');
    return;
  }
  const rows = prepareDataForSheets();
  if(rows.length === 0) {
    showNotification('No pending workouts to sync.', 'info');
    return;
  }
  showNotification('Syncing workouts...', 'info');
  try {
    const resp = await gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
      range: 'WorkoutLog!A1',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: rows }
    });
    if(!resp || (resp.status && resp.status >= 400)) throw new Error('Sheets API error');
    showNotification('Workout data synced successfully!', 'success');

    // delete synced entries from local storage
    const syncedDays = [...new Set(rows.map(r => Object.keys(workoutData).find(day => workoutData[day].name === r[1])))];
    syncedDays.forEach(day => { if(day && workoutProgress[day]) delete workoutProgress[day]; });
    saveWorkoutProgress();

  } catch(error) {
    showNotification('Failed to sync workout data. Check console.', 'error');
    console.error('Sync error:', error);
  }
}

// --------------------------
// 8. Dashboard data & rendering

async function fetchDashboardData(showNotify = true) {
  if(!gapi.client?.getToken()) return;
  try {
    const resp = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
      range: 'WorkoutLog!A2:H'
    });

    const values = Array.isArray(resp.result?.values) ? resp.result.values : [];
    sheetData = values.map(row => {
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

    if(showNotify) showNotification('Dashboard data synced.', 'success');
    populateBodyPartFilter();
    renderDashboard();

  } catch(e) {
    if(showNotify) showNotification('Failed to fetch dashboard data.', 'error');
    console.error('Dashboard fetch error:', e);
  }
}

function populateBodyPartFilter() {
  const filter = document.getElementById('bodyPartFilter');
  if(!filter) return;
  const bodyParts = [...new Set(sheetData.filter(r => r.user === currentUser).map(r => r.bodyPart))].filter(b => b);
  filter.innerHTML = '<option value="all">All Body Parts</option>';
  for(const bodyPart of bodyParts) {
    filter.innerHTML += `<option value="${bodyPart}">${bodyPart}</option>`;
  }
  populateExerciseFilter();
}

function populateExerciseFilter() {
  const bodyFilter = document.getElementById('bodyPartFilter');
  const exerciseFilter = document.getElementById('exerciseFilter');
  if(!bodyFilter || !exerciseFilter) return;

  const bodyPart = bodyFilter.value;
  const exercises = [...new Set(sheetData.filter(r => r.user === currentUser && (bodyPart === 'all' || r.bodyPart === bodyPart)).map(r => r.exercise))].filter(e => e);
  exerciseFilter.innerHTML = '<option value="all">All Exercises</option>';
  for(const ex of exercises) {
    exerciseFilter.innerHTML += `<option value="${ex}">${ex}</option>`;
  }
  exerciseFilter.disabled = exercises.length === 0 || bodyPart === 'all';
}

function renderDashboard() {
  const bodyFilter = document.getElementById('bodyPartFilter');
  const exerciseFilter = document.getElementById('exerciseFilter');
  const dateRangeFilter = document.getElementById('dateRangeFilter');
  if(!bodyFilter || !exerciseFilter || !dateRangeFilter) return;

  const bodyPart = bodyFilter.value;
  const exercise = exerciseFilter.value;
  const dateRange = dateRangeFilter.value;

  let dataFiltered = sheetData.filter(row => {
    const userMatch = row.user === currentUser;
    const dateMatch = dateRange === 'all' || (((new Date()) - row.date) / 86400000) <= parseInt(dateRange);
    const bodyMatch = bodyPart === 'all' || row.bodyPart === bodyPart;
    return userMatch && dateMatch && bodyMatch;
  });

  if(exercise !== 'all') dataFiltered = dataFiltered.filter(row => row.exercise === exercise);

  if(dataFiltered.length === 0) {
    const dashboard = document.getElementById('dashboardContent');
    if(dashboard) dashboard.innerHTML = '<div class="dashboard-card"><p>No data found for this selection.</p></div>';
    if(chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    return;
  }

  // Calculate e1RM for each set (one rep max estimate)
  const e1RM = (w, r) => (r > 0 ? w * (1 + r / 30) : 0);
  dataFiltered.forEach(row => {
    row.e1RM = e1RM(row.weight, row.reps);
  });

  // Determine best lift
  const bestSet = dataFiltered.reduce((curMax, row) => row.e1RM > curMax.e1RM ? row : curMax, { e1RM: 0 });

  // Render dashboard cards
  const dashboard = document.getElementById('dashboardContent');
  if(!dashboard) return;
  dashboard.innerHTML = `
    <div class="dashboard-card">
      <h3>Best Lift</h3>
      <p style="font-size: 2rem; font-weight: 700;">${bestSet.weight}kg x ${bestSet.reps} reps</p>
      <small>${bestSet.exercise}</small>
    </div>
    <div class="dashboard-card">
      <h3>Estimated 1-Rep Max</h3>
      <p style="font-size: 2rem; font-weight: 700;">${bestSet.e1RM.toFixed(1)}kg</p>
    </div>
    <div class="dashboard-card" style="grid-column:1/-1;">
      <div class="chart-container"><canvas id="progressChart"></canvas></div>
    </div>`;

  // Prepare chart data: average 1RM per date, or per exercise
  let chartData = [];
  let chartLabel = 'Estimated 1RM (kg)';

  if(exercise === 'all' && bodyPart !== 'all') {
    chartLabel = `Average 1RM for ${bodyPart}`;
    // Group by date
    const grouped = dataFiltered.reduce((acc, cur) => {
      const dateKey = cur.date.toISOString().slice(0,10);
      if(!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(cur.e1RM);
      return acc;
    }, {});
    chartData = Object.entries(grouped).map(([dateStr, vals]) => {
      return {
        date: new Date(dateStr + 'T00:00:00'),
        e1RM: vals.reduce((a,b)=>a+b,0) / vals.length,
      }
    });
  } else {
    chartData = dataFiltered;
    if(exercise !== 'all') chartLabel = `1RM for ${exercise}`;
  }

  renderProgressChart(chartData, 'progressChart', chartLabel);
}

function renderProgressChart(data, canvasId, label){
  if(!data || data.length === 0) return;
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if(!ctx) return;
  if(chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.date.toLocaleDateString('en-GB')),
      datasets: [{
        label,
        data: data.map(d => d.e1RM.toFixed(1)),
        borderColor: 'var(--primary-color)',
        fill: true,
        backgroundColor: 'rgba(11,87,208,0.1)',
        tension: 0.15,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { maxRotation: 45, minRotation: 30 } },
        y: { beginAtZero:true }
      },
      plugins: { legend: { labels: { font: { size: 14 } } } },
    }
  });
}

// --------------------------
// 9. Clear Google Sheet Data
async function clearGoogleSheet() {
  if(!gapi.client?.getToken()) {
    showNotification("Please authorize before clearing data.", "error");
    return;
  }
  if(!confirm("Delete ALL data from Google Sheet? This cannot be undone.")) return;
  showNotification("Clearing sheet...", "info");
  try {
    await gapi.client.sheets.spreadsheets.values.clear({
      spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
      range: "WorkoutLog!A2:H",
    });
    sheetData = [];
    populateBodyPartFilter();
    renderDashboard();
    showNotification("Google Sheet data cleared.", "success");
  } catch(e) {
    showNotification("Failed to clear sheet. Check console.", "error");
    console.error("Clear error:", e);
  }
}

// --------------------------
// 10. User management and navigation
function loadCurrentUser() {
  document.querySelectorAll('.user-card').forEach(c => {
    c.classList.toggle('active', c.dataset.user === currentUser);
  });
  const wsTitle = document.getElementById('workout-section-title');
  if(wsTitle) wsTitle.textContent = `Select Workout for ${currentUser}`;
}

function selectUser(user) {
  if(!user) return;
  currentUser = user;
  localStorage.setItem('currentUser', user);
  loadCurrentUser();
  if(document.getElementById('dashboardScreen')?.classList.contains('active') && isApiReady && gapi.client?.getToken()) {
    fetchDashboardData(false);
  }
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId)?.classList.add('active');
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === pageId);
  });
  if(pageId==='dashboardScreen' && isApiReady && gapi.client?.getToken()) fetchDashboardData(false);
}

function syncOrFetchData(evt){
  if(evt.currentTarget.id.includes('Dashboard')) fetchDashboardData(true);
  else syncWorkoutData();
}

// --------------------------
// 11. AI progress analysis integration (calls backend)

async function analyzeProgressWithAI(){
  const analyzeBtn = document.getElementById('analyzeProgressBtn');
  if(analyzeBtn) analyzeBtn.disabled = true;
  showNotification('Analyzing progress...', 'info');

  if(!sheetData || sheetData.length === 0){
    showNotification('No workout data for analysis.', 'error');
    if(analyzeBtn) analyzeBtn.disabled = false;
    return;
  }

  // Summarize data
  let summary = `User: ${currentUser}\nWorkouts logged: ${sheetData.length}\n\nBest lifts per body part and exercise:\n`;
  const e1RMCalc = (w,r) => r>0 ? w*(1+r/30) : 0;
  const bestLifts = {};
  sheetData.forEach(row => {
    if(row.user !== currentUser) return;
    const key = `${row.bodyPart} - ${row.exercise}`;
    const curBest = bestLifts[key];
    const est1RM = e1RMCalc(row.weight, row.reps);
    if(!curBest || est1RM > curBest.e1RM){
      bestLifts[key] = {weight: row.weight, reps: row.reps, e1RM: est1RM, date: row.date.toLocaleDateString('en-GB')};
    }
  });
  for(const [key,val] of Object.entries(bestLifts)){
    summary += `${key}: ${val.weight}kg x ${val.reps} reps (1RM est: ${val.e1RM.toFixed(1)}kg) on ${val.date}\n`;
  }
  summary += "\nPlease provide a fitness progress summary and training tips based on this data.";

  try{
    const response = await fetch('/.netlify/functions/ask-ai', {
      method:'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({type: 'analyze', payload: summary})
    });
    if(!response.ok) throw new Error('AI response failed');
    const data = await response.json();
    alert(`AI Analysis:\n\n${data.message}`);

  }catch(e){
    showNotification('Failed to get AI analysis. Try again later.', 'error');
    console.error('AI analyze error:', e);
  }
  if(analyzeBtn) analyzeBtn.disabled = false;
}

// --------------------------
// 12. Chat messages placeholder (you can use from previous scripts or extend as required)

// --------------------------
// 13. Initialization on DOMContentLoaded

function setupEventListeners(){
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      showPage(link.dataset.page);
    });
  });
  document.querySelectorAll('.user-card').forEach(card => {
    card.addEventListener('click', () => selectUser(card.dataset.user));
  });
  document.getElementById('backToHomeBtn')?.addEventListener('click', () => showPage('homeScreen'));
  document.querySelectorAll('[id^="authorizeBtn"]').forEach(btn => btn.addEventListener('click', handleAuthClick));
  document.querySelectorAll('[id^="syncBtn"], #globalSyncBtn').forEach(btn => btn.addEventListener('click', syncOrFetchData));
  document.getElementById('resetWorkoutBtn')?.addEventListener('click', resetCurrentWorkout);
  document.getElementById('workoutNotes')?.addEventListener('input', saveNotes);
  document.getElementById('analyzeProgressBtn')?.addEventListener('click', analyzeProgressWithAI);
  document.getElementById('clearSheetBtn')?.addEventListener('click', clearGoogleSheet);
  document.getElementById('dateRangeFilter')?.addEventListener('change', renderDashboard);
  document.getElementById('bodyPartFilter')?.addEventListener('change', () => { populateExerciseFilter(); renderDashboard(); });
  document.getElementById('exerciseFilter')?.addEventListener('change', renderDashboard);
}

// Initialize app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  loadCurrentUser();
  loadWorkoutProgress();
  renderHome();
  setupEventListeners();
});
