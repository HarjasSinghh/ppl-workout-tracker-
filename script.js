// === CONFIGURATION & STATE ===
const GOOGLE_CONFIG = {
  CLIENT_ID:
    '1040913543341-0vj52ims83dkcudpvh6rdtvrvr5da5nn.apps.googleusercontent.com',
  SPREADSHEET_ID: '15O-z40Jsy2PFs0XaXle07g_hJuwBCgpEi399TC9Yaic',
  SCOPES: 'https://www.googleapis.com/auth/spreadsheets',
};

// =================================================================================
// FIXED: WORKOUT DATA FROM YOUR PDF (FIXES EXERCISES NOT SHOWING)
// =================================================================================
const workoutData = {
    1: { name: "Push Day 1", bodyPart: "Push", exercises: [
        { name: "BB Flat Bench Press", sets: 4 },
        { name: "DB Incline Press", sets: 3 },
        { name: "DB Shoulder Press", sets: 4 },
        { name: "Cable Straight Pushdown", sets: 3 },
        { name: "DB Lateral Raises", sets: 4 },
        { name: "Overhead Tricep Extension", sets: 3 },
        { name: "Cable Chest Fly", sets: 3 }
    ]},
    2: { name: "Pull Day 1", bodyPart: "Pull", exercises: [
        { name: "Lat Pulldown", sets: 4 },
        { name: "Deadlift", sets: 4 },
        { name: "Seated Close Grip Row", sets: 4 },
        { name: "Rope Pull Overs", sets: 3 },
        { name: "DB Hammer Curls", sets: 3 },
        { name: "Preacher Curls", sets: 4 },
        { name: "Barbell Curls", sets: 2 }
    ]},
    3: { name: "Leg Day", bodyPart: "Legs", exercises: [
        { name: "BB Squat", sets: 4 },
        { name: "Lunges", sets: 3 },
        { name: "Sumo Stance Leg Press", sets: 3 },
        { name: "Hamstring Curls", sets: 3 },
        { name: "Legs Extension", sets: 3 },
        { name: "Calf Raises", sets: 4 }
    ]},
    4: { name: "Push Day 2", bodyPart: "Push", exercises: [
        { name: "BB Incline Bench", sets: 2 },
        { name: "Cambered Bar Front Raise", sets: 3 },
        { name: "Cable Rope Face Pulls w/ Rear Delt Fly", sets: 3 },
        { name: "Lowest Angle Chest Fly", sets: 3 },
        { name: "Front Plate Raise", sets: 2 },
        { name: "Close Grip Bench Press", sets: 2 },
        { name: "Lateral Raises on Machine/Cable", sets: 2 }
    ]},
    5: { name: "Pull Day 2", bodyPart: "Pull", exercises: [
        { name: "Close Grip Lat Pulldown w/ V Bar", sets: 3 },
        { name: "BB Row", sets: 3 },
        { name: "Reverse Hand Rowing", sets: 2 },
        { name: "Hyper Extension", sets: 3 },
        { name: "Incline Curls", sets: 3 },
        { name: "Machine Rope Curls", sets: 3 }
    ]},
    6: { name: "Arms Day", bodyPart: "Arms", exercises: [
        { name: "Cable EZ Bar Curls / Tricep Pushdowns", sets: 4 },
        { name: "Preacher Curls / Overhead Tricep Extension", sets: 3 },
        { name: "Wide Grip Bar Curls / Rope Pushdowns", sets: 2 },
        { name: "Hammer Curls Drop Set / Single Arm Tricep", sets: 2 }
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

// === ELEMENT REFERENCES ===
const allAuthorizeBtns = document.querySelectorAll('[id^="authorizeBtn"]');
const allSyncBtns = document.querySelectorAll('[id^="syncBtn"], #globalSyncBtn');
const workoutGrid = document.getElementById('workoutGrid');
const dashboardContent = document.getElementById('dashboardContent');

// === INITIALIZATION ===
window.gapiLoaded = () => gapi.load('client', initializeGapiClient);
window.gisLoaded = () => {
    try {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CONFIG.CLIENT_ID, scope: GOOGLE_CONFIG.SCOPES, callback: handleAuthResponse,
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

document.addEventListener('DOMContentLoaded', () => {
    updateAuthorizeButtons(false, "Loading...");
    setupEventListeners();
    loadCurrentUser();
    loadWorkoutProgress();
    renderHome();
});

// === EVENT LISTENERS ===
function setupEventListeners() {
    document.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', e => { e.preventDefault(); showPage(link.dataset.page); }));
    document.querySelectorAll('.user-card').forEach(card => card.addEventListener('click', () => selectUser(card.dataset.user)));
    document.getElementById('backToHomeBtn').addEventListener('click', () => showPage('homeScreen'));
    allAuthorizeBtns.forEach(btn => btn.addEventListener('click', handleAuthClick));
    allSyncBtns.forEach(btn => btn.addEventListener('click', syncOrFetchData));
    document.getElementById('resetWorkoutBtn').addEventListener('click', resetCurrentWorkout);
    document.getElementById('workoutNotes').addEventListener('input', saveNotes);
    document.getElementById('analyzeProgressBtn').addEventListener('click', analyzeProgressWithAI);
    document.getElementById('clearSheetBtn').addEventListener('click', clearGoogleSheet);
    document.getElementById('dateRangeFilter').addEventListener('change', handleDateRangeChange);
    ['bodyPartFilter', 'exerciseFilter', 'startDateFilter', 'endDateFilter'].forEach(id => document.getElementById(id)?.addEventListener('change', renderDashboard));
    setupAIChatListeners();
}

function syncOrFetchData(event) {
    if (event.currentTarget.id.includes('Dashboard')) {
        fetchDashboardData(true);
    } else {
        syncWorkoutData();
    }
}

// === AUTH & SIGN-IN ===
function updateAuthorizeButtons(enabled, text) {
    allAuthorizeBtns.forEach(btn => {
        btn.disabled = !enabled;
        btn.innerHTML = `<i class="fab fa-google"></i> ${text}`;
    });
}

function handleAuthClick() {
    if (!isApiReady) {
        showNotification("Google API is not ready. Please try again.", "error");
        return;
    }
    tokenClient.requestAccessToken({ prompt: 'consent' });
}

function handleAuthResponse(resp) {
    if (resp.error) {
        showNotification("Authorization failed. Check console.", "error");
        updateSigninStatus(false);
        return;
    }
    updateSigninStatus(true);
}

function updateSigninStatus(isSignedIn) {
    allAuthorizeBtns.forEach(btn => btn.classList.toggle('hidden', isSignedIn));
    allSyncBtns.forEach(btn => btn.classList.toggle('hidden', !isSignedIn));

    const hasData = hasPendingData();
    document.getElementById('globalSyncBtn').disabled = !hasData;
    document.querySelectorAll('#syncBtnHome, #syncBtnWorkout').forEach(btn => btn.disabled = !hasData);
    
    document.getElementById('analyzeProgressBtn').disabled = !isSignedIn;
    document.getElementById('clearSheetBtn').disabled = !isSignedIn;
    document.getElementById('syncBtnDashboard').disabled = !isSignedIn;

    if (isSignedIn) {
        if (document.getElementById('dashboardScreen').classList.contains('active')) {
            fetchDashboardData(false);
        }
    } else {
        dashboardContent.innerHTML = `<div class="dashboard-card"><p>Please authorize to view dashboard.</p></div>`;
    }
}

// === UI RENDERING & WORKOUT LOGIC ===
function renderHome() {
    workoutGrid.innerHTML = '';
    Object.entries(workoutData).forEach(([day, workout]) => {
        const card = document.createElement('div');
        card.className = 'day-card';
        card.dataset.day = day;
        card.innerHTML = `<i class="fas fa-dumbbell"></i><h3>${workout.name}</h3>`;
        card.addEventListener('click', () => startWorkout(day));
        workoutGrid.appendChild(card);
    });
}

function startWorkout(day) {
    currentDay = day;
    showPage('workoutScreen');
}

function loadWorkoutUI() {
    const workout = workoutData[currentDay];
    document.getElementById('currentWorkoutTitle').textContent = workout.name;
    const container = document.getElementById('exerciseListContainer');
    container.innerHTML = '';

    const progress = workoutProgress[currentDay] || { date: new Date().toISOString().split('T')[0], sets: {}, notes: '' };

    workout.exercises.forEach((exercise, exIndex) => {
        let setsHtml = '';
        for (let setIndex = 0; setIndex < exercise.sets; setIndex++) {
            const p = progress.sets?.[exIndex]?.[setIndex] || {};
            setsHtml += `<div class="set-row ${p.completed ? 'completed' : ''}" data-ex="${exIndex}" data-set="${setIndex}">
                <input type="checkbox" class="set-checkbox" ${p.completed ? 'checked' : ''}>
                <span>Set ${setIndex + 1}</span>
                <input type="number" class="set-input" placeholder="kg" value="${p.weight || ''}">
                <input type="number" class="set-input" placeholder="reps" value="${p.reps || ''}">
            </div>`;
        }
        container.innerHTML += `<div class="exercise-card"><h3>${exercise.name}</h3>${setsHtml}</div>`;
    });

    document.getElementById('workoutNotes').value = progress.notes || '';
    container.querySelectorAll('.set-checkbox, .set-input').forEach(el => el.addEventListener('change', handleSetChange));
}

function handleSetChange(e) {
    const row = e.target.closest('.set-row');
    const { ex, set } = row.dataset;
    if (!workoutProgress[currentDay]) {
        workoutProgress[currentDay] = { date: new Date().toISOString().split('T')[0], sets: {}, notes: '' };
    }
    if (!workoutProgress[currentDay].sets[ex]) workoutProgress[currentDay].sets[ex] = {};
    
    workoutProgress[currentDay].sets[ex][set] = {
        completed: row.querySelector('.set-checkbox').checked,
        weight: row.querySelector('input[placeholder="kg"]').value,
        reps: row.querySelector('input[placeholder="reps"]').value,
    };
    row.classList.toggle('completed', workoutProgress[currentDay].sets[ex][set].completed);
    saveWorkoutProgress();
}

function saveNotes(e) {
    if (!workoutProgress[currentDay]) {
        workoutProgress[currentDay] = { date: new Date().toISOString().split('T')[0], sets: {}, notes: '' };
    }
    workoutProgress[currentDay].notes = e.target.value;
    saveWorkoutProgress();
}

function resetCurrentWorkout() {
    if (!confirm("Are you sure you want to reset all entries for this workout session?")) return;
    if (workoutProgress[currentDay]) {
        delete workoutProgress[currentDay];
        saveWorkoutProgress();
        loadWorkoutUI();
        showNotification("Workout session has been reset.", "info");
    }
}

// === DATA SYNC, FETCH & STORAGE ===
function saveWorkoutProgress() {
    localStorage.setItem('workoutProgress', JSON.stringify(workoutProgress));
    const token = gapi.client.getToken();
    if(token) updateSigninStatus(true);
}

function loadWorkoutProgress() {
    const stored = localStorage.getItem('workoutProgress');
    workoutProgress = stored ? JSON.parse(stored) : {};
}

function hasPendingData() {
    return Object.values(workoutProgress).some(day => 
        day.sets && Object.values(day.sets).some(ex => 
            Object.values(ex).some(set => set.completed)
        )
    );
}

async function syncWorkoutData() {
    if (!gapi.client.getToken()) return showNotification("Please authorize first.", "error");
    const dataToSync = prepareDataForSheets();
    if (dataToSync.length === 0) return showNotification("No pending workouts to sync.", "info");
    
    showNotification("Syncing workouts...", "info");
    try {
        await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID, range: 'WorkoutLog!A1',
            valueInputOption: 'USER_ENTERED', insertDataOption: 'INSERT_ROWS',
            resource: { values: dataToSync },
        });
        showNotification("Workouts synced successfully!", "success");
        const syncedDays = [...new Set(dataToSync.map(row => Object.keys(workoutData).find(day => workoutData[day].name === row[1])))];
        syncedDays.forEach(day => { if (day && workoutProgress[day]) delete workoutProgress[day]; });
        saveWorkoutProgress();
    } catch (error) {
        showNotification("Sync failed. Check console.", "error");
    }
}

function prepareDataForSheets() {
    const rows = [];
    for (const dayKey in workoutProgress) {
        const workout = workoutData[dayKey];
        const progress = workoutProgress[dayKey];
        if (!workout || !progress.sets) continue;
        
        let noteAdded = false;
        Object.keys(progress.sets).forEach(exIndex => {
            const exercise = workout.exercises[exIndex];
            if (!exercise) return;
            Object.keys(progress.sets[exIndex]).forEach(setIndex => {
                const set = progress.sets[exIndex][setIndex];
                if (set.completed && (set.weight || set.reps)) {
                    rows.push([
                        progress.date, workout.name, exercise.name, parseInt(setIndex) + 1,
                        set.weight || 0, set.reps || 0, currentUser,
                        noteAdded ? "" : (progress.notes || "")
                    ]);
                    noteAdded = true;
                }
            });
        });
    }
    return rows;
}

// =================================================================================
// FIXED: DASHBOARD DATA FETCHING (FIXES NO DATA FOUND)
// =================================================================================
async function fetchDashboardData(showNotificationOnFail = true) {
    if (!gapi.client.getToken()) return;
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID, range: 'WorkoutLog!A2:H',
        });
        sheetData = (response.result.values || []).map(row => {
            const dayName = row[1];
            const dayKey = Object.keys(workoutData).find(d => workoutData[d].name === dayName);
            const bodyPart = dayKey ? workoutData[dayKey].bodyPart : 'Unknown';
            return {
                date: new Date(row[0] + 'T00:00:00'), day: dayName, exercise: row[2],
                set: parseInt(row[3]), weight: parseFloat(row[4]) || 0, reps: parseInt(row[5]) || 0,
                user: row[6], notes: row[7], bodyPart: bodyPart,
            };
        });
        if (showNotificationOnFail) showNotification('Dashboard data synced.', 'success');
        
        populateBodyPartFilter();
        handleDateRangeChange();

    } catch (err) {
        if (showNotificationOnFail) showNotification("Failed to fetch dashboard data.", "error");
    }
}

// === ALL OTHER HELPER FUNCTIONS (UNCHANGED) ===
function showPage(pageId){const pages=document.querySelectorAll(".page"),navLinks=document.querySelectorAll(".nav-link");pages.forEach(p=>p.classList.remove("active")),document.getElementById(pageId).classList.add("active"),navLinks.forEach(l=>l.classList.toggle("active",l.dataset.page===pageId)),"dashboardScreen"===pageId&&updateSigninStatus(gapi.client.getToken()!==null)}function loadCurrentUser(){currentUser=localStorage.getItem("currentUser")||"Harjas",updateUserCards()}function selectUser(user){currentUser=user,localStorage.setItem("currentUser",user),updateUserCards(),document.getElementById("dashboardScreen").classList.contains("active")&&fetchDashboardData(!1)}function updateUserCards(){document.querySelectorAll(".user-card").forEach(card=>card.classList.toggle("active",card.dataset.user===currentUser)),document.getElementById("workout-section-title").textContent=`Select Workout for ${currentUser}`}function handleDateRangeChange(){const range=document.getElementById("dateRangeFilter").value,customContainer=document.getElementById("customDateContainer");if(customContainer.classList.toggle("hidden","custom"!==range),"custom"!==range){const endDate=new Date,startDate=new Date;"all"!==range?startDate.setDate(endDate.getDate()-parseInt(range)):startDate.setFullYear(startDate.getFullYear()-10),document.getElementById("endDateFilter").valueAsDate=endDate,document.getElementById("startDateFilter").valueAsDate=startDate}renderDashboard()}function populateBodyPartFilter(){const bodyParts=[...new Set(sheetData.filter(row=>row.user===currentUser).map(row=>row.bodyPart))].filter(Boolean),filter=document.getElementById("bodyPartFilter");for(filter.innerHTML='<option value="all">All Body Parts</option>';bodyParts.length>0;){const bp=bodyParts.shift();filter.innerHTML+=`<option value="${bp}">${bp}</option>`}populateExerciseFilter()}function populateExerciseFilter(){const bodyPart=document.getElementById("bodyPartFilter").value,exercises=[...new Set(sheetData.filter(row=>row.user===currentUser&&("all"===bodyPart||row.bodyPart===bodyPart)).map(row=>row.exercise))].filter(Boolean),filter=document.getElementById("exerciseFilter");for(filter.innerHTML='<option value="all">All Exercises</option>';exercises.length>0;){const ex=exercises.shift();filter.innerHTML+=`<option value="${ex}">${ex}</option>`}filter.disabled=exercises.length===0}function renderDashboard(){const bodyPart=document.getElementById("bodyPartFilter").value,exercise=document.getElementById("exerciseFilter").value,startDateVal=document.getElementById("startDateFilter").value,endDateVal=document.getElementById("endDateFilter").value,startDate=startDateVal?new Date(startDateVal+"T00:00:00"):null,endDate=endDateVal?new Date(endDateVal+"T23:59:59"):null,data=sheetData.filter(row=>row.user===currentUser&&("all"===bodyPart||row.bodyPart===bodyPart)&&("all"===exercise||row.exercise===exercise)&&(!startDate||row.date>=startDate)&&(!endDate||row.date<=endDate));if(0===data.length)return void(dashboardContent.innerHTML='<div class="dashboard-card"><p>No data found for this selection.</p></div>');const e1RM=(w,r)=>r>0?w*(1+r/30):0;data.forEach(row=>row.e1RM=e1RM(row.weight,row.reps));const bestSet=data.reduce((max,row)=>row.e1RM>max.e1RM?row:max,{e1RM:0}),progressData=data.filter(row=>row.exercise===bestSet.exercise).sort((a,b)=>a.date-b.date),strengthChange=progressData.length>1?(progressData[progressData.length-1].e1RM-progressData[0].e1RM)/progressData[0].e1RM*100:0;dashboardContent.innerHTML=`<div class="dashboard-card"><h3>Best Lift</h3><p style="font-size: 2rem; font-weight: 700;">${bestSet.weight} kg x ${bestSet.reps} reps</p><small>${bestSet.exercise}</small></div><div class="dashboard-card"><h3>Est. 1-Rep Max</h3><p style="font-size: 2rem; font-weight: 700;">${bestSet.e1RM.toFixed(1)} kg</p><small>Your estimated strength score.</small></div><div class="dashboard-card tip-card"><h3><i class="fas fa-lightbulb"></i>Quick Tip</h3><p>${generateAITip(strengthChange,bestSet.reps)}</p></div><div id="aiAnalysisCard" class="dashboard-card" style="grid-column: 1 / -1; display: none;"><h3>AI Analysis</h3><div id="aiAnalysisContent"></div></div><div class="dashboard-card" style="grid-column: 1 / -1;"><div class="chart-container"><canvas id="progressChart"></canvas></div></div>`,renderProgressChart(progressData,"progressChart")}function renderProgressChart(data,canvasId){if(chartInstances[canvasId])chartInstances[canvasId].destroy();const ctx=document.getElementById(canvasId)?.getContext("2d");if(ctx)chartInstances[canvasId]=new Chart(ctx,{type:"line",data:{labels:data.map(d=>d.date.toLocaleDateString()),datasets:[{label:"Estimated 1RM (kg)",data:data.map(d=>d.e1RM.toFixed(1)),borderColor:"var(--primary-color)",tension:.1,fill:!0}]},options:{responsive:!0,maintainAspectRatio:!1}})}function generateAITip(change,reps){return change>5?`Incredible progress! Your strength has increased by ${change.toFixed(1)}%. Consider a slight weight increase to continue this trend.`:change>0?"Nice work, you're making steady gains. Keep up the consistency.":reps<6?"You're lifting heavy! To maximize muscle growth, ensure you're also incorporating sets in the 8-12 rep range.":reps>15?"Great endurance! To build more top-end strength, try increasing the weight so your reps fall in the 6-10 range.":"Consistency is key. You're laying the foundation for future progress. Keep showing up!"}async function analyzeProgressWithAI(){if(!gapi.client.getToken())return showNotification("Please authorize first.","error");const exercise=document.getElementById("exerciseFilter").value;if("all"===exercise)return showNotification("Please select a specific exercise to analyze.","info");const analysisCard=document.getElementById("aiAnalysisCard"),analysisContent=document.getElementById("aiAnalysisContent");analysisCard.style.display="block",analysisContent.innerHTML="<p>AI is analyzing your progress...</p>";const data=sheetData.filter(row=>row.user===currentUser&&row.exercise===exercise).sort((a,b)=>a.date-b.date);if(data.length<2)return void(analysisContent.innerHTML="<p>Not enough data to analyze. Please complete at least two sessions for this exercise.</p>");const summary=`User: ${currentUser}. Exercise: ${exercise}. Performance History (last 5 sessions): ${data.slice(-5).map(d=>`${d.date.toLocaleDateString()}: ${d.weight}kg x ${d.reps}reps`).join(", ")}`;try{const response=await fetch("/.netlify/functions/ask-ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"analysis",payload:summary})});if(!response.ok)throw new Error("AI analysis failed.");const{message}=await response.json();analysisContent.innerHTML=message.replace(/\n/g,"<br>").replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")}catch(error){analysisContent.innerHTML="<p>Sorry, the AI analysis could not be completed at this time.</p>"}}async function clearGoogleSheet(){if(!gapi.client.getToken())return showNotification("Please authorize first.","error");if(!confirm("This will delete ALL data for BOTH users from the Google Sheet. This action cannot be undone. Are you sure?"))return;showNotification("Clearing sheet data...","info");try{await gapi.client.sheets.spreadsheets.values.clear({spreadsheetId:GOOGLE_CONFIG.SPREADSHEET_ID,range:"WorkoutLog!A2:H"}),sheetData=[],renderDashboard(),showNotification("All data has been cleared from your Google Sheet.","success")}catch(err){showNotification("Failed to clear sheet data.","error")}}function setupAIChatListeners(){const chatModal=document.getElementById("aiChatModal");document.getElementById("chatToggleBtn").addEventListener("click",()=>chatModal.classList.add("active")),document.getElementById("closeChatBtn").addEventListener("click",()=>chatModal.classList.remove("active")),document.getElementById("sendChatBtn").addEventListener("click",sendChatMessage),document.getElementById("chatInput").addEventListener("keypress",e=>{"Enter"===e.key&&sendChatMessage()})}function addChatMessage(message,sender){const container=document.getElementById("chatMessages"),msgDiv=document.createElement("div");msgDiv.className=`${sender}-message`,msgDiv.innerHTML=`<p>${message}</p>`,container.appendChild(msgDiv),container.scrollTop=container.scrollHeight}async function sendChatMessage(){const input=document.getElementById("chatInput"),userMessage=input.value.trim();if(!userMessage)return;addChatMessage(userMessage,"user"),input.value="",addChatMessage("<i>AI is thinking...</i>","ai");try{const response=await fetch("/.netlify/functions/ask-ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"chat",payload:userMessage})});if(!response.ok)throw new Error(`Function Error: ${response.statusText}`);const data=await response.json();document.querySelector(".ai-message:last-child").remove(),addChatMessage(data.message.replace(/\n/g,"<br>").replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>"),"ai")}catch(error){document.querySelector(".ai-message:last-child").remove(),addChatMessage("Sorry, I'm having trouble connecting right now.","ai")}}function showNotification(message,type="info"){const el=document.createElement("div");el.className=`notification ${type}`,el.textContent=message,document.body.appendChild(el),setTimeout(()=>{el.style.opacity="1",el.style.transform="translateY(0)"},10),setTimeout(()=>{el.style.opacity="0",setTimeout(()=>el.remove(),400)},4e3)}
