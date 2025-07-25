// ==========================================
// CONFIGURATION
// ==========================================
const GOOGLE_SHEETS_CONFIG = {
    apiKey: 'AIzaSyBz1rmid9kIKjgUin77d5Hcf9jO8ZWkHPg',
    spreadsheetId: '15O-z40Jsy2PFs0XaXle07g_hJuwBCgpEi399TC9Yaic',
    range: 'WorkoutLog!A:H'
};

const workoutData = {
    1: { name: "Day 1 - Push", exercises: [ { name: "BB Flat Bench Press", sets: 4, reps: "10, 8, 6, 4" }, { name: "DB Incline Press", sets: 3, reps: "12, 8, 6" }, { name: "DB Shoulder Press", sets: 4, reps: "15, 12, 10, 6" }, { name: "Cable Straight Pushdown", sets: 3, reps: "15, 12, 10" }, { name: "DB Lateral Raises", sets: 4, reps: "12, 10, 8, special" }, { name: "Overhead Tricep Extension", sets: 3, reps: "15, 12, 10" }, { name: "Cable Chest Fly", sets: 3, reps: "20, 16, 12" } ] },
    2: { name: "Day 2 - Pull", exercises: [ { name: "Lat Pulldown", sets: 4, reps: "12, 10, 6, 6 peak" }, { name: "Deadlift", sets: 4, reps: "10, 8, 6, 4" }, { name: "Seated Cable Row", sets: 4, reps: "12, 10, 10 peak" }, { name: "Rope Pull Overs", sets: 3, reps: "16, 12, 10" }, { name: "DB Hammer Curls", sets: 3, reps: "15, 12, 10" }, { name: "Preacher Curls", sets: 4, reps: "16, 12, 10, 8" }, { name: "Barbell Curls", sets: 2, reps: "20, 15" }, { name: "Barbell Shrugs", sets: 4, reps: "15, 12, 10, 8"} ] },
    3: { name: "Day 3 - Legs", exercises: [ { name: "BB Squat", sets: 4, reps: "15, 10, 6, 4" }, { name: "Lunges", sets: 3, reps: "8 per leg" }, { name: "Sumo Leg Press", sets: 3, reps: "12, 10, 8" }, { name: "Hamstring Curls", sets: 3, reps: "15, 12, 10" }, { name: "Leg Extension", sets: 3, reps: "15, 12, 10" }, { name: "Calf Raises", sets: 4, reps: "25, 20, 20, 15" } ] },
    4: { name: "Day 4 - Push", exercises: [ { name: "BB Incline Bench", sets: 2, reps: "12, 10" }, { name: "Cambered Bar Front Raise", sets: 3, reps: "15, 12, 10" }, { name: "Face Pulls w/ Delt Fly", sets: 3, reps: "12, 10, 8 each" }, { name: "Lowest Angle Chest Fly", sets: 3, reps: "15, 12, 10" }, { name: "Front Plate Raise", sets: 2, reps: "20, 16" }, { name: "Close Grip Bench Press", sets: 2, reps: "15, 12" }, { name: "Machine Lateral Raises", sets: 2, reps: "20, 16"} ] },
    5: { name: "Day 5 - Pull", exercises: [ { name: "Close Grip Lat Pulldown", sets: 3, reps: "15, 12, 10" }, { name: "BB Row", sets: 3, reps: "12, 10, 8" }, { name: "Reverse Hand Rowing", sets: 2, reps: "12, 10" }, { name: "Hyper Extension", sets: 3, reps: "20, 16, 14" }, { name: "Incline Curls", sets: 3, reps: "15, 12, 10" }, { name: "Machine Rope Curls", sets: 3, reps: "15, 12, 10"} ] },
    6: { name: "Day 6 - Arms", exercises: [ { name: "Cable EZ Bar Curls / Tricep Pushdowns", sets: 4, reps: "15-15, 12-12, 10-10, 8-8" }, { name: "Preacher Curls / Overhead Extension", sets: 3, reps: "12-12, 10-10, 8-8" }, { name: "Wide Grip Curls / Rope Pushdowns", sets: 2, reps: "special" }, { name: "Hammer Curls / Single Arm Tricep", sets: 2, reps: "dropset" }, { name: "Wrist Curls", sets: 3, reps: "20, 18, 15"}, { name: "Farmer Walks", sets: 3, reps: "30 steps"} ] }
};

let currentDay = 1;
let workoutProgress = JSON.parse(localStorage.getItem('workoutProgress')) || {};

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    setupEventListeners();
    updateHomeStats();
    showHomeScreen();
}

// ==========================================
// GOOGLE SHEETS FUNCTIONS - FIXED
// ==========================================
async function syncToGoogleSheets() {
    if (GOOGLE_SHEETS_CONFIG.apiKey === 'YOUR_API_KEY_HERE' || GOOGLE_SHEETS_CONFIG.spreadsheetId === 'YOUR_SPREADSHEET_ID_HERE') {
        updateSyncStatus('⚠️ Not Configured');
        showNotification('Please configure Google Sheets API Key and Spreadsheet ID in script.js');
        return;
    }

    updateSyncStatus('Syncing...');
    try {
        await gapi.client.init({
            apiKey: GOOGLE_SHEETS_CONFIG.apiKey,
            discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
        });

        const dataToSync = prepareDataForSheets();
        if (dataToSync.length === 0) {
            updateSyncStatus('No Data');
            showNotification('No new workout data to sync.');
            return;
        }

        const response = await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
            range: 'WorkoutLog!A1',
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: dataToSync,
            },
        });
        
        updateSyncStatus('Synced!');
        showNotification('Workout data successfully synced to Google Sheets!');
        console.log('Sync successful:', response);

    } catch (error) {
        updateSyncStatus('Error!');
        showNotification('Sync failed. Check console for details.');
        console.error('Google Sheets Sync Error:', error);
    }
}

function prepareDataForSheets() {
    const rows = [];
    const workoutDate = new Date().toISOString().split('T')[0];
    const dayName = workoutData[currentDay]?.name || `Day ${currentDay}`;
    const dayProgress = workoutProgress[currentDay];

    if (!dayProgress) return [];

    for (const exerciseIndex in dayProgress) {
        const exerciseData = dayProgress[exerciseIndex];
        const exerciseName = workoutData[currentDay].exercises[exerciseIndex]?.name || 'Unknown Exercise';
        
        for (const setIndex in exerciseData.sets) {
            const setData = exerciseData.sets[setIndex];
            rows.push([
                workoutDate,
                dayName,
                exerciseName,
                parseInt(setIndex) + 1,
                setData.weight || '',
                setData.repsAchieved || '',
                setData.completed ? 'Yes' : 'No',
                workoutProgress.notes?.[currentDay] || ''
            ]);
        }
    }
    return rows;
}

// ==========================================
// EVENT LISTENERS
// ==========================================
function setupEventListeners() {
    document.getElementById('daySelector').addEventListener('change', (e) => {
        document.getElementById('startWorkout').disabled = !e.target.value;
    });

    document.getElementById('startWorkout').addEventListener('click', () => {
        currentDay = document.getElementById('daySelector').value;
        showWorkoutScreen();
        loadWorkout(currentDay);
    });

    document.getElementById('backHome').addEventListener('click', showHomeScreen);
    document.getElementById('syncData').addEventListener('click', syncToGoogleSheets);
    document.getElementById('saveNotes').addEventListener('click', saveWorkoutNotes);

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchDay(e.currentTarget.dataset.day));
    });
}

// ==========================================
// UI & SCREEN MANAGEMENT
// ==========================================
function showHomeScreen() {
    document.getElementById('homeScreen').style.display = 'block';
    document.getElementById('workoutScreen').style.display = 'none';
    updateHomeStats();
}

function showWorkoutScreen() {
    document.getElementById('homeScreen').style.display = 'none';
    document.getElementById('workoutScreen').style.display = 'block';
}

function switchDay(day) {
    currentDay = day;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.day === day);
    });
    loadWorkout(day);
}

// ==========================================
// WORKOUT LOGIC
// ==========================================
function loadWorkout(day) {
    const workout = workoutData[day];
    if (!workout) return;

    document.getElementById('currentWorkout').textContent = workout.name;
    const exerciseList = document.getElementById('exerciseList');
    exerciseList.innerHTML = '';

    workout.exercises.forEach((exercise, exerciseIndex) => {
        const card = document.createElement('div');
        card.className = 'exercise-card-modern';
        
        let setsHtml = '';
        for (let i = 0; i < exercise.sets; i++) {
            const setData = workoutProgress[day]?.[exerciseIndex]?.sets?.[i] || {};
            setsHtml += `
                <div class="set-row-modern ${setData.completed ? 'completed' : ''}" data-exercise="${exerciseIndex}" data-set="${i}">
                    <input type="checkbox" class="set-checkbox-modern" ${setData.completed ? 'checked' : ''}>
                    <span>Set ${i + 1}</span>
                    <input type="number" class="input-modern" placeholder="kg" value="${setData.weight || ''}">
                    <input type="number" class="input-modern" placeholder="reps" value="${setData.repsAchieved || ''}">
                </div>
            `;
        }

        card.innerHTML = `
            <h3 class="exercise-name-modern">${exercise.name}</h3>
            <div class="sets-grid-modern">${setsHtml}</div>
        `;
        exerciseList.appendChild(card);
    });

    document.querySelectorAll('.set-checkbox-modern, .input-modern').forEach(el => {
        el.addEventListener('change', handleSetChange);
    });

    document.getElementById('workoutNotes').value = workoutProgress.notes?.[day] || '';
}

function handleSetChange(e) {
    const row = e.target.closest('.set-row-modern');
    const { exercise, set } = row.dataset;

    if (!workoutProgress[currentDay]) workoutProgress[currentDay] = {};
    if (!workoutProgress[currentDay][exercise]) workoutProgress[currentDay][exercise] = { sets: {} };
    if (!workoutProgress[currentDay][exercise].sets[set]) workoutProgress[currentDay][exercise].sets[set] = {};

    const progress = workoutProgress[currentDay][exercise].sets[set];
    progress.completed = row.querySelector('.set-checkbox-modern').checked;
    progress.weight = row.querySelector('input[placeholder="kg"]').value;
    progress.repsAchieved = row.querySelector('input[placeholder="reps"]').value;

    row.classList.toggle('completed', progress.completed);
    saveProgress();
}

function saveWorkoutNotes() {
    if (!workoutProgress.notes) workoutProgress.notes = {};
    workoutProgress.notes[currentDay] = document.getElementById('workoutNotes').value;
    saveProgress();
    showNotification('Notes saved!');
}

function saveProgress() {
    localStorage.setItem('workoutProgress', JSON.stringify(workoutProgress));
}

// ==========================================
// UTILITIES
// ==========================================
function updateHomeStats() {
    const totalWorkouts = Object.keys(workoutProgress).filter(k => k !== 'notes').length;
    document.getElementById('totalWorkouts').textContent = totalWorkouts;
    // You can add more detailed stats logic here
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Simple styling for notification
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--google-black);
        color: var(--white);
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1001;
        opacity: 0;
        transition: opacity 0.3s, transform 0.3s;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(-50%) translateY(-10px)';
    }, 10);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(10px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function updateSyncStatus(status) {
    document.getElementById('syncStatus').textContent = status;
}
