'use strict';

/**
 * ===================================================================
 * FitTrack Pro - Main Application Script v7.3 (Final Notes Logic)
 * ===================================================================
 */

// 1. GLOBAL ATTACHMENTS & CONFIGURATION
window.gapiLoaded = gapiLoaded;
window.gisLoaded = gisLoaded;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}

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
let chatHistory = []; 

// 3. GOOGLE API & AUTHENTICATION (Stable, no changes)
function gapiLoaded() { gapi.load('client', async () => { try { await gapi.client.init({ discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'] }); gapiInited = true; checkApiReady(); } catch (e) { showNotification('Google API failed.', 'error'); } }); }
function gisLoaded() { try { tokenClient = google.accounts.oauth2.initTokenClient({ client_id: GOOGLE_CONFIG.CLIENT_ID, scope: GOOGLE_CONFIG.SCOPES, callback: handleAuthResponse, }); gisInited = true; checkApiReady(); } catch (e) { showNotification('Sign-In failed.', 'error'); } }
function checkApiReady() { if (gapiInited && gisInited && !isApiReady) { isApiReady = true; enableAuthorizeButtons(true, 'Authorize'); if (!silentAuthTried) { silentAuthTried = true; trySilentAuth(); } } }
function trySilentAuth() { if (tokenClient) tokenClient.requestAccessToken({ prompt: 'none' }); }
function handleAuthClick() { if (isApiReady) tokenClient.requestAccessToken({ prompt: 'consent' }); }
function handleAuthResponse(resp) { if (resp.error) { updateAuthorizationUI(false); return; } showNotification('Authorization successful!', 'success'); updateAuthorizationUI(true); }
function enableAuthorizeButtons(enabled, text) { document.querySelectorAll('[id^="authorizeBtn"]').forEach(btn => { if (btn) { btn.disabled = !enabled; btn.innerHTML = `<i class="fab fa-google"></i> ${text}`; } }); }

function updateAuthorizationUI(isSignedIn) {
  document.querySelectorAll('[id^="authorizeBtn"]').forEach(btn => btn.classList.toggle('hidden', isSignedIn));
  document.querySelectorAll('[id^="syncBtn"], #globalSyncBtn').forEach(btn => btn.classList.toggle('hidden', !isSignedIn));

  const hasPending = checkPendingWorkoutData();
  document.querySelectorAll('[id$="syncBtn"], #globalSyncBtn').forEach(btn => { if(btn) btn.disabled = !hasPending; });

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
function showNotification(message, type = 'info') { const el = document.createElement('div'); el.className = `notification ${type}`; el.textContent = message; document.body.appendChild(el); setTimeout(() => { el.style.opacity = '1'; }, 10); setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 400); }, 3500); }
function parseSheetDate(d) { const dt = new Date(d); return isNaN(dt) ? new Date() : dt; }
function saveWorkoutProgress() { localStorage.setItem('workoutProgress', JSON.stringify(workoutProgress)); if (gapi.client?.getToken()) updateAuthorizationUI(true); }
function loadWorkoutProgress() { try { workoutProgress = JSON.parse(localStorage.getItem('workoutProgress')) || {}; } catch { workoutProgress = {}; } }

function checkPendingWorkoutData() {
  return Object.values(workoutProgress).some(day =>
    day?.sets && Object.values(day.sets).some(ex =>
      Object.values(ex).some(set => set?.completed)
    )
  );
}

// 5. UI RENDERING & WORKOUT LOGIC
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
    
    const header = document.createElement('div');
    header.className = 'exercise-log-header';
    
    let optionsHtml = `<option value="${exercise.name}">${exercise.name}</option>`;
    exercise.alternatives?.forEach(a => { optionsHtml += `<option value="${a}">${a}</option>`; });
    const selectedEx = progress.sets?.[exIndex]?.selectedExercise || exercise.name;
    
    let setsOptionsHtml = '';
    for (let i = 1; i <= exercise.sets; i++) {
      setsOptionsHtml += `<option value="${i - 1}">Set ${i}</option>`;
    }
    
    header.innerHTML = `
      <select class="exercise-select">${optionsHtml.replace(`value="${selectedEx}"`, `value="${selectedEx}" selected`)}</select>
      <select class="set-select">${setsOptionsHtml}</select>
    `;

    const inputsContainer = document.createElement('div');
    inputsContainer.className = 'set-inputs';

    item.appendChild(header);
    item.appendChild(inputsContainer);

    const exerciseSelect = header.querySelector('.exercise-select');
    const setSelect = header.querySelector('.set-select');

    const renderSetInputs = (setIndex) => {
      const p = progress.sets?.[exIndex]?.[setIndex] || {};
      inputsContainer.innerHTML = `
        <input type="number" name="weight" placeholder="Weight (kg)" value="${p.weight || ''}">
        <input type="number" name="reps" placeholder="Reps" value="${p.reps || ''}">
      `;
    };
    
    item.addEventListener('input', (e) => handleSetChange(exIndex, setSelect.value, e.target.name, e.target.value));
    setSelect.addEventListener('change', () => renderSetInputs(setSelect.value));
    exerciseSelect.addEventListener('change', () => handleExerciseChange(exIndex, exerciseSelect.value));

    renderSetInputs(0);
    container.appendChild(item);
  });

  document.getElementById('workoutNotes').value = progress.notes || '';
}

function handleExerciseChange(exIndex, newExerciseName) {
  if (!workoutProgress[currentDay]) workoutProgress[currentDay] = { date: new Date().toISOString().slice(0, 10), sets: {}, notes: '' };
  if (!workoutProgress[currentDay].sets[exIndex]) workoutProgress[currentDay].sets[exIndex] = {};
  workoutProgress[currentDay].sets[exIndex].selectedExercise = newExerciseName;
  saveWorkoutProgress();
}

function handleSetChange(exIndex, setIndex, inputName, inputValue) {
  if (!workoutProgress[currentDay]) workoutProgress[currentDay] = { date: new Date().toISOString().slice(0, 10), sets: {}, notes: '' };
  const sets = workoutProgress[currentDay].sets;
  if (!sets[exIndex]) sets[exIndex] = {};
  if (!sets[exIndex][setIndex]) sets[exIndex][setIndex] = {};
  
  sets[exIndex][setIndex][inputName] = inputValue;
  
  const currentSet = sets[exIndex][setIndex];
  if (Number(currentSet.weight) > 0 || Number(currentSet.reps) > 0) {
    currentSet.completed = true;
  } else {
    delete currentSet.completed; 
  }
  
  saveWorkoutProgress();
}

// 6. GOOGLE SHEETS & DASHBOARD
function prepareDataForSheets() {
  const rows = [];
  for (const dayKey in workoutProgress) {
    const workoutDef = workoutData[dayKey];
    const progress = workoutProgress[dayKey];
    if (!workoutDef || !progress?.sets) continue;
    let noteAdded = false;
    for (const exIndex in progress.sets) {
      const exProgress = progress.sets[exIndex];
      const exDef = workoutDef.exercises[exIndex];
      if (!exProgress || !exDef) continue;
      const exName = exProgress.selectedExercise || exDef.name;
      for (const setIndex in exProgress) {
        if (setIndex === 'selectedExercise') continue;
        const set = exProgress[setIndex];
        if (set?.completed) {
          // Attach the note to the first completed set of the session
          const noteToSync = noteAdded ? '' : progress.notes || '';
          rows.push([progress.date, workoutDef.name, exName, parseInt(setIndex) + 1, set.weight || 0, set.reps || 0, currentUser, noteToSync]);
          noteAdded = true;
        }
      }
    }
  }
  return rows;
}

/**
 * FINAL FIX: This function now correctly captures notes before sync and clears the UI after.
 */
async function syncWorkoutData() {
  if (!gapi.client?.getToken()) return showNotification("Please authorize first.", "error");

  // Capture final notes right before sync
  const notesTextArea = document.getElementById('workoutNotes');
  if (notesTextArea && workoutProgress[currentDay]) {
    workoutProgress[currentDay].notes = notesTextArea.value;
  }

  const rows = prepareDataForSheets();
  if (rows.length === 0) return showNotification("No pending workouts to sync.", "info");
  
  showNotification("Syncing workouts...", "info");
  try {
    await gapi.client.sheets.spreadsheets.values.append({ spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID, range: 'WorkoutLog!A1', valueInputOption: 'USER_ENTERED', insertDataOption: 'INSERT_ROWS', resource: { values: rows } });
    showNotification("Workouts synced successfully!", "success");
    
    const syncedDays = [...new Set(rows.map(row => Object.keys(workoutData).find(day => workoutData[day].name === row[1])))];
    
    syncedDays.forEach(day => { 
      if (day && workoutProgress[day]) {
        delete workoutProgress[day]; 
      }
    });
    
    saveWorkoutProgress();
    
    // Clear the notes UI if the current workout was part of the sync
    if (syncedDays.includes(currentDay) && notesTextArea) {
      notesTextArea.value = '';
    }

  } catch (error) { 
    showNotification("Sync failed. Check console.", "error"); 
  }
}

async function fetchDashboardData(showNotify = true) {
  if (!gapi.client?.getToken()) return;
  try {
    const response = await gapi.client.sheets.spreadsheets.values.get({ spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID, range: 'WorkoutLog!A2:H' });
    sheetData = (response.result.values || []).map(row => ({ date: parseSheetDate(row[0]), day: row[1], exercise: row[2], set: parseInt(row[3]), weight: parseFloat(row[4]) || 0, reps: parseInt(row[5]) || 0, user: row[6], notes: row[7], bodyPart: workoutData[Object.keys(workoutData).find(d => workoutData[d].name === row[1])]?.bodyPart || 'Unknown' }));
    if (showNotify) showNotification("Dashboard data synced.", "success");
    populateBodyPartFilter();
  } catch (e) { if (showNotify) showNotification("Failed to fetch dashboard data.", "error"); }
}

function populateBodyPartFilter() {
  const filter = document.getElementById('bodyPartFilter');
  const bodyParts = [...new Set(sheetData.filter(r => r.user === currentUser).map(r => r.bodyPart))].filter(Boolean);
  filter.innerHTML = '<option value="all">All Body Parts</option>';
  bodyParts.forEach(bp => { filter.innerHTML += `<option value="${bp}">${bp}</option>`; });
  populateExerciseFilter();
}

function populateExerciseFilter() {
  const bodyFilter = document.getElementById('bodyPartFilter');
  const exFilter = document.getElementById('exerciseFilter');
  const bodyPart = bodyFilter.value;
  
  const exercises = [...new Set(sheetData.filter(r => r.user === currentUser && r.bodyPart === bodyPart).map(r => r.exercise))].filter(Boolean);
  
  exFilter.innerHTML = '<option value="all">All Exercises</option>';
  exercises.forEach(ex => { exFilter.innerHTML += `<option value="${ex}">${ex}</option>`; });
  
  exFilter.disabled = (bodyPart === 'all');
  renderDashboard();
}

function getFilteredDashboardData() {
  const dateRange = document.getElementById('dateRangeFilter').value;
  const bodyPart = document.getElementById('bodyPartFilter').value;
  const exercise = document.getElementById('exerciseFilter').value;
  return sheetData.filter(row => row.user === currentUser && (dateRange === 'all' || (new Date() - row.date) / 86400000 <= parseInt(dateRange)) && (bodyPart === 'all' || row.bodyPart === bodyPart) && (exercise === 'all' || row.exercise === exercise));
}

function renderDashboard() { const content=document.getElementById('dashboardContent');const filteredData=getFilteredDashboardData();if(filteredData.length===0){content.innerHTML=`<div class="dashboard-card"><p>No data found for this selection.</p></div>`;if(chartInstance){chartInstance.destroy();chartInstance=null}return}const e1RM=(w,r)=>(r>0?w*(1+r/30):0);filteredData.forEach(row=>row.e1RM=e1RM(row.weight,row.reps));const bestSet=filteredData.reduce((max,row)=>(row.e1RM>max.e1RM?row:max),{e1RM:0});content.innerHTML=`<div class="dashboard-card"><h3>Best Lift</h3><p style="font-size:2rem;font-weight:700">${bestSet.weight}kg x ${bestSet.reps} reps</p><small>${bestSet.exercise}</small></div><div class="dashboard-card"><h3>Est. 1-Rep Max</h3><p style="font-size:2rem;font-weight:700">${bestSet.e1RM.toFixed(1)}kg</p></div><div class="dashboard-card"style="grid-column:1/-1"><div class="chart-container"><canvas id="progressChart"></canvas></div></div>`;renderProgressChart(filteredData,'progressChart',document.getElementById('exerciseFilter').value!=='all'?`1RM for ${document.getElementById('exerciseFilter').value}`:'Est. 1RM (kg)') }
function renderProgressChart(data,canvasId,label){if(chartInstance)chartInstance.destroy();const ctx=document.getElementById(canvasId)?.getContext('2d');if(ctx){chartInstance=new Chart(ctx,{type:'line',data:{labels:data.map(d=>d.date.toLocaleDateString('en-GB')),datasets:[{label:label,data:data.map(d=>d.e1RM.toFixed(1)),borderColor:'var(--primary-color)',tension:0.1,fill:true,backgroundColor:'rgba(11,87,208,0.1)'}]},options:{responsive:true,maintainAspectRatio:false,scales:{x:{ticks:{maxRotation:45,minRotation:30}},y:{beginAtZero:true}}}})}}

// 7. USER MANAGEMENT & NAVIGATION
function loadCurrentUser() { currentUser = localStorage.getItem('currentUser') || 'Harjas'; document.querySelectorAll('.user-card').forEach(c => c.classList.toggle('active', c.dataset.user === currentUser)); document.getElementById('workout-section-title').textContent = `Select Workout for ${currentUser}`; }
function selectUser(user) { currentUser = user; localStorage.setItem('currentUser', user); loadCurrentUser(); if (document.getElementById('dashboardScreen').classList.contains('active')) fetchDashboardData(false); }

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.page === pageId));
  
  const pageEl = document.getElementById(pageId);
  if (pageEl) {
    pageEl.classList.add('active');
    
    if (pageId === 'homeScreen') {
      renderHome();
    } else if (pageId === 'workoutScreen') {
      loadWorkoutUI();
    } else if (pageId === 'dashboardScreen' && isApiReady && gapi.client?.getToken()) {
      fetchDashboardData(false);
    }
  }
}

function resetCurrentWorkout() { if (confirm("Reset entries for this session? This won't affect synced data.") && workoutProgress[currentDay]) { delete workoutProgress[currentDay]; saveWorkoutProgress(); loadWorkoutUI(); showNotification("Workout session has been reset.", "info"); } }

// 8. AI & EXTRA FEATURES (Stable, no changes)
async function analyzeProgressWithAI() {const btn=document.getElementById('analyzeProgressBtn');if(btn)btn.disabled=true;showNotification('Analyzing your progress...','info');const filteredData=getFilteredDashboardData();if(filteredData.length===0){showNotification('No data in the current filter to analyze.','error');if(btn)btn.disabled=false;return}let summary=`User: ${currentUser}\nHere is the user's filtered workout data:\n`;filteredData.forEach(row=>{summary+=`${row.date.toLocaleDateString('en-GB')}: ${row.exercise}, Set ${row.set} - ${row.weight}kg x ${row.reps} reps\n`});summary+="\nBased *only* on the data provided, give a concise summary of the user's performance and provide 2-3 actionable tips.";chatHistory=[{role:'user',content:summary}];addChatMessage(`Analyzing your selected progress...`,'ai');document.getElementById('aiChatModal')?.classList.add('active');try{const response=await fetch('/.netlify/functions/ask-ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:chatHistory})});if(!response.ok)throw new Error(await response.text());const data=await response.json();document.querySelector('.ai-message:last-child')?.remove();addChatMessage(data.message,'ai')}catch(error){document.querySelector('.ai-message:last-child')?.remove();addChatMessage('Sorry, I could not complete the analysis.','ai')}finally{if(btn)btn.disabled=false}}
async function clearGoogleSheet() {if(!confirm('Are you sure you want to delete ALL data from the Google Sheet?'))return;showNotification('Clearing sheet data...','info');try{await gapi.client.sheets.spreadsheets.values.clear({spreadsheetId:GOOGLE_CONFIG.SPREADSHEET_ID,range:'WorkoutLog!A2:H'});sheetData=[];renderDashboard();showNotification('All data cleared.','success')}catch(err){showNotification('Failed to clear sheet data.','error')}}
function addChatMessage(message,sender){const container=document.getElementById('chatMessages');const div=document.createElement('div');div.className=`${sender}-message`;div.innerHTML=`<p>${message.replace(/\n/g,'<br>')}</p>`;container.appendChild(div);container.scrollTop=container.scrollHeight;if(!message.includes('<i>')){chatHistory.push({role:sender==='user'?'user':'assistant',content:message})}}
async function sendChatMessage() {const input=document.getElementById('chatInput');const message=input.value.trim();if(!message)return;addChatMessage(message,'user');input.value='';const thinkingMessage=document.createElement('div');thinkingMessage.className='ai-message';thinkingMessage.innerHTML=`<p><i>AI is thinking...</i></p>`;document.getElementById('chatMessages').appendChild(thinkingMessage);try{const response=await fetch('/.netlify/functions/ask-ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:chatHistory})});if(!response.ok)throw new Error(await response.text());const data=await response.json();thinkingMessage.remove();addChatMessage(data.message,'ai')}catch(e){thinkingMessage.remove();addChatMessage('Sorry, I am having trouble connecting.','ai')}}

// 9. INITIALIZATION
function setupEventListeners() {
  document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', e => { e.preventDefault(); showPage(l.dataset.page); }));
  document.querySelectorAll('.user-card').forEach(c => c.addEventListener('click', () => selectUser(c.dataset.user)));
  document.getElementById('backToHomeBtn')?.addEventListener('click', () => showPage('homeScreen'));
  document.querySelectorAll('[id^="authorizeBtn"]').forEach(b => b.addEventListener('click', handleAuthClick));
  document.querySelectorAll('[id^="syncBtn"], #globalSyncBtn').forEach(b => b.addEventListener('click', syncWorkoutData));
  document.getElementById('resetWorkoutBtn')?.addEventListener('click', resetCurrentWorkout);
  document.getElementById('analyzeProgressBtn')?.addEventListener('click', analyzeProgressWithAI);
  document.getElementById('clearSheetBtn')?.addEventListener('click', clearGoogleSheet);
  document.getElementById('dateRangeFilter')?.addEventListener('change', renderDashboard);
  document.getElementById('bodyPartFilter')?.addEventListener('change', populateExerciseFilter);
  document.getElementById('exerciseFilter')?.addEventListener('change', renderDashboard);
  document.getElementById('chatToggleBtn')?.addEventListener('click', () => { document.getElementById('aiChatModal').classList.add('active'); });
  document.getElementById('closeChatBtn')?.addEventListener('click', () => document.getElementById('aiChatModal').classList.remove('active'));
  document.getElementById('sendChatBtn')?.addEventListener('click', sendChatMessage);
  document.getElementById('chatInput')?.addEventListener('keypress', e => { if (e.key === 'Enter') sendChatMessage(); });
  document.getElementById('workoutNotes')?.addEventListener('input', (e) => { 
    if (workoutProgress[currentDay]) {
      workoutProgress[currentDay].notes = e.target.value;
      saveWorkoutProgress(); // Save notes as they are typed
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadCurrentUser();
  loadWorkoutProgress();
  setupEventListeners();
  showPage('homeScreen'); // Start on home screen
});
