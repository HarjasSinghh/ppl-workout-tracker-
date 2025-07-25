// ==========================================
// CONFIGURATION
// ==========================================
const GOOGLE_SHEETS_CONFIG = {
    apiKey: 'AIzaSyBz1rmid9kIKjgUin77d5Hcf9jO8ZWkHPg',
    spreadsheetId: '15O-z40Jsy2PFs0XaXle07g_hJuwBCgpEi399TC9Yaic',
};

const workoutData = {
    1: { name: "Push Day 1", exercises: [ { name: "BB Flat Bench Press", sets: 4 }, { name: "DB Incline Press", sets: 3 }, { name: "DB Shoulder Press", sets: 4 }, { name: "Cable Straight Pushdown", sets: 3 }, { name: "DB Lateral Raises", sets: 4 }, { name: "Overhead Tricep Extension", sets: 3 } ] },
    2: { name: "Pull Day 1", exercises: [ { name: "Lat Pulldown", sets: 4 }, { name: "Deadlift", sets: 4 }, { name: "Seated Cable Row", sets: 4 }, { name: "Rope Pull Overs", sets: 3 }, { name: "DB Hammer Curls", sets: 3 }, { name: "Barbell Shrugs", sets: 4 } ] },
    3: { name: "Leg Day", exercises: [ { name: "BB Squat", sets: 4 }, { name: "Lunges", sets: 3 }, { name: "Sumo Leg Press", sets: 3 }, { name: "Hamstring Curls", sets: 3 }, { name: "Leg Extension", sets: 3 }, { name: "Calf Raises", sets: 4 } ] },
    4: { name: "Push Day 2", exercises: [ { name: "BB Incline Bench", sets: 3 }, { name: "Cambered Bar Front Raise", sets: 3 }, { name: "Face Pulls w/ Delt Fly", sets: 3 }, { name: "Close Grip Bench Press", sets: 3 }, { name: "Machine Lateral Raises", sets: 3 } ] },
    5: { name: "Pull Day 2", exercises: [ { name: "Close Grip Lat Pulldown", sets: 3 }, { name: "BB Row", sets: 3 }, { name: "Hyper Extension", sets: 3 }, { name: "Incline Curls", sets: 3 }, { name: "Machine Rope Curls", sets: 3 } ] },
    6: { name: "Arms Day", exercises: [ { name: "Cable EZ Bar Curls / Tricep Pushdowns", sets: 4 }, { name: "Preacher Curls / Overhead Extension", sets: 3 }, { name: "Hammer Curls / Single Arm Tricep", sets: 2 }, { name: "Wrist Curls", sets: 3 }, { name: "Farmer Walks", sets: 3 } ] }
};

let currentDay = 1;
let workoutProgress = JSON.parse(localStorage.getItem('workoutProgress')) || {};
let gapiInitialized = false;

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    setupEventListeners();
    showScreen('homeScreen');
}

// ==========================================
// GOOGLE SHEETS API - ROBUST VERSION
// ==========================================
function loadGapiClient() {
    return new Promise((resolve, reject) => {
        if (gapiInitialized) {
            resolve();
            return;
        }
        gapi.load('client', () => {
            gapi.client.init({
                apiKey: GOOGLE_SHEETS_CONFIG.apiKey,
                discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
            }).then(() => {
                gapiInitialized = true;
                resolve();
            }).catch(reject);
        });
    });
}

async function syncToGoogleSheets() {
    if (!GOOGLE_SHEETS_CONFIG.apiKey || GOOGLE_SHEETS_CONFIG.apiKey === 'YOUR_API_KEY_HERE') {
        updateSyncStatus('Not Configured');
        showNotification('Error: API Key is not configured in script.js');
        return;
    }

    updateSyncStatus('Syncing...');
    try {
        await loadGapiClient();
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
            insertDataOption: 'INSERT_ROWS',
            resource: { values: dataToSync },
        });

        updateSyncStatus('Synced');
        showNotification('Workout successfully synced to Google Sheets!');
        console.log('Sync successful:', response);
    } catch (error) {
        updateSyncStatus('Error');
        showNotification('Sync Failed. Check the browser console for details.');
        console.error('Google Sheets Sync Error:', error);
    }
}

function prepareDataForSheets() {
    const rows = [];
    const workoutDate = new Date().toISOString().split('T')[0];
    const dayName = workoutData[currentDay]?.name;
    const dayProgress = workoutProgress[currentDay];

    if (!dayProgress) return [];

    for (const exerciseIndex in dayProgress) {
        const exerciseData = dayProgress[exerciseIndex];
        const exerciseName = workoutData[currentDay]?.exercises[exerciseIndex]?.name;
        for (const setIndex in exerciseData.sets) {
            const setData = exerciseData.sets[setIndex];
            if (setData.completed) {
                rows.push([
                    workoutDate,
                    dayName,
                    exerciseName,
                    parseInt(setIndex) + 1,
                    setData.weight || '0',
                    setData.reps || '0',
                    workoutProgress.notes?.[currentDay] || ''
                ]);
            }
        }
    }
    return rows;
}

// ==========================================
// EVENT LISTENERS
// ==========================================
function setupEventListeners() {
    document.querySelectorAll('.day-card').forEach(card => {
        card.addEventListener('click', () => startWorkout(card.dataset.day));
    });

    document.getElementById('backHome').addEventListener('click', () => showScreen('homeScreen'));
    document.getElementById('syncData').addEventListener('click', syncToGoogleSheets);
    document.getElementById('saveNotes').addEventListener('click', saveWorkoutNotes);
}

// ==========================================
// UI & SCREEN MANAGEMENT
// ==========================================
function showScreen(screenId) {
    document.getElementById('homeScreen').style.display = (screenId === 'homeScreen' ? 'block' : 'none');
    document.getElementById('workoutScreen').style.display = (screenId === 'workoutScreen' ? 'block' : 'none');
}

function startWorkout(day) {
    currentDay = day;
    loadWorkout(day);
    showScreen('workoutScreen');
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
        card.className = 'exercise-card';

        let setsHtml = '';
        for (let i = 0; i < exercise.sets; i++) {
            const setData = workoutProgress[day]?.[exerciseIndex]?.sets?.[i] || {};
            setsHtml += `
                <div class="set-row ${setData.completed ? 'completed' : ''}" data-exercise="${exerciseIndex}" data-set="${i}">
                    <div class="custom-checkbox ${setData.completed ? 'checked' : ''}">
                        <i class="fas fa-check"></i>
                    </div>
                    <span class="set-label">Set ${i + 1}</span>
                    <input type="number" class="set-input" placeholder="kg" value="${setData.weight || ''}">
                    <input type="number" class="set-input" placeholder="reps" value="${setData.reps || ''}">
                </div>
            `;
        }

        card.innerHTML = `<h2 class="exercise-name">${exercise.name}</h2><div class="sets-container">${setsHtml}</div>`;
        exerciseList.appendChild(card);
    });

    document.querySelectorAll('.set-row').forEach(row => {
        row.addEventListener('click', (e) => {
            if (e.target.classList.contains('set-input')) return;
            const checkbox = row.querySelector('.custom-checkbox');
            checkbox.classList.toggle('checked');
            handleSetChange({ target: checkbox });
        });
        row.querySelectorAll('.set-input').forEach(input => {
            input.addEventListener('change', handleSetChange);
        });
    });

    document.getElementById('workoutNotes').value = workoutProgress.notes?.[day] || '';
}

function handleSetChange(e) {
    const row = e.target.closest('.set-row');
    const { exercise, set } = row.dataset;
    const isChecked = row.querySelector('.custom-checkbox').classList.contains('checked');

    if (!workoutProgress[currentDay]) workoutProgress[currentDay] = {};
    if (!workoutProgress[currentDay][exercise]) workoutProgress[currentDay][exercise] = { sets: {} };

    workoutProgress[currentDay][exercise].sets[set] = {
        completed: isChecked,
        weight: row.querySelector('input[placeholder="kg"]').value,
        reps: row.querySelector('input[placeholder="reps"]').value,
    };
    
    row.classList.toggle('completed', isChecked);
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
function updateSyncStatus(status) {
    document.getElementById('syncStatus').textContent = status;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        background-color: var(--text-primary); color: white; padding: 12px 24px;
        border-radius: 8px; box-shadow: var(--shadow-md); z-index: 1001;
        opacity: 0; transition: opacity 0.3s, transform 0.3s;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(-50%) translateY(-10px)';
    }, 10);
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
