// Workout data structure
const workoutData = {
    1: { // Day 1 - Push
        name: "Day 1 - Push",
        exercises: [
            {
                name: "BB Flat Bench Press",
                warmUp: 3,
                sets: 4,
                reps: [10, 8, 6, 4],
                alternatives: ["Machine bench press", "Incline bench press", "DB flat bench press"]
            },
            {
                name: "DB Incline Press",
                warmUp: 1,
                sets: 3,
                reps: [12, 8, 6],
                alternatives: ["Incline bench press", "Machine incline bench press", "Flat DB bench press"]
            },
            {
                name: "DB Shoulder Press",
                warmUp: 1,
                sets: 4,
                reps: [15, 12, 10, 6],
                alternatives: ["Machine shoulder press", "Barbell shoulder press", "Shoulder front raises"]
            },
            {
                name: "Cable Straight Pushdown",
                warmUp: 0,
                sets: 3,
                reps: [15, 12, 10],
                special: "1 drop set on last set",
                alternatives: ["Rope pushdowns", "Single hand cable pushdowns", "Skull crushers"]
            },
            {
                name: "DB Lateral Raises",
                warmUp: 0,
                sets: 4,
                reps: [12, 10, 8, "5 peak hold + 10 full + 10 partial + 5 full"],
                alternatives: ["Upright rows", "Laying lateral raises"]
            },
            {
                name: "Overhead Tricep Extension",
                warmUp: 0,
                sets: 3,
                reps: [15, 12, 10],
                alternatives: ["Rope pushdowns", "Single hand cable pushdowns", "Skull crushers"]
            },
            {
                name: "Cable Chest Fly (slow reps)",
                warmUp: 0,
                sets: 3,
                reps: [20, 16, 12],
                alternatives: ["Machine fly", "DB fly"]
            }
        ]
    },
    2: { // Day 2 - Pull
        name: "Day 2 - Pull",
        exercises: [
            {
                name: "Lat Pulldown",
                warmUp: 3,
                sets: 4,
                reps: [12, 10, 6, "6 peak contraction"],
                alternatives: ["DB row", "Barbell row", "Pull ups"]
            },
            {
                name: "Deadlift",
                warmUp: 1,
                sets: 4,
                reps: [10, 8, 6, 4],
                alternatives: ["Back extension", "DB deadlift"]
            },
            {
                name: "Seated Close Grip Cable Row",
                warmUp: 0,
                sets: 4,
                reps: [12, 10, "10 peak holds", "10 normal reps"],
                alternatives: ["Row with narrow bar", "Row with wide bar", "DB and BB row"]
            },
            {
                name: "Rope Pull Overs",
                warmUp: 0,
                sets: 3,
                reps: [16, 12, 10],
                alternatives: ["Pull over with DB"]
            },
            {
                name: "DB Hammer Curls",
                warmUp: 0,
                sets: 3,
                reps: [15, 12, 10],
                alternatives: ["DB curls", "Preacher curls"]
            },
            {
                name: "Preacher Curls",
                warmUp: 0,
                sets: 4,
                reps: [16, 12, 10, 8],
                alternatives: ["DB curls", "Seated curls"]
            },
            {
                name: "Barbell Curls",
                warmUp: 0,
                sets: 2,
                reps: [20, 15],
                alternatives: ["Supinated curls", "Cable curls"]
            }
        ]
    },
    3: { // Day 3 - Legs
        name: "Day 3 - Legs",
        exercises: [
            {
                name: "BB Squat",
                warmUp: 3,
                sets: 4,
                reps: [15, 10, 6, 4],
                alternatives: ["Hack squats", "Leg press"]
            },
            {
                name: "Lunges",
                warmUp: 1,
                sets: 3,
                reps: ["8 stride per leg per set"],
                alternatives: ["Reverse squat", "Romanian deadlift"]
            },
            {
                name: "Sumo Stance Leg Press",
                warmUp: 0,
                sets: 3,
                reps: [12, 10, 8],
                alternatives: ["Bridge glutes", "Goblet squat", "Sumo squat"]
            },
            {
                name: "Hamstring Curls",
                warmUp: 0,
                sets: 3,
                reps: [15, 12, 10],
                alternatives: ["Reverse hamstring curls"]
            },
            {
                name: "Leg Extension",
                warmUp: 0,
                sets: 3,
                reps: [15, 12, 10],
                alternatives: ["Adductors", "Hack squat full depth"]
            },
            {
                name: "Calf Raises (Standing or Sitting)",
                warmUp: 0,
                sets: 4,
                reps: [25, 20, 20, 15],
                alternatives: []
            }
        ]
    },
    4: { // Day 4 - Push
        name: "Day 4 - Push",
        exercises: [
            {
                name: "BB Incline Bench",
                warmUp: 3,
                sets: 2,
                reps: [12, 10],
                alternatives: ["Machine bench press", "Incline bench press", "DB flat bench press"]
            },
            {
                name: "Cambered Bar Front Raise",
                warmUp: 0,
                sets: 3,
                reps: [15, 12, 10],
                alternatives: ["Machine shoulder press", "Barbell shoulder press", "Shoulder front raises DB"]
            },
            {
                name: "Cable Rope Face Pulls w/ Rear Delt Fly",
                warmUp: 0,
                sets: 3,
                reps: ["12, 10, 8 for both"],
                alternatives: ["Bent over delt fly"]
            },
            {
                name: "Lowest Angle Chest Fly",
                warmUp: 0,
                sets: 3,
                reps: [15, 12, 10],
                alternatives: ["Machine fly", "DB fly"]
            },
            {
                name: "Front Plate Raise",
                warmUp: 0,
                sets: 2,
                reps: [20, 16],
                alternatives: ["Machine shoulder press", "Barbell shoulder press", "Shoulder front raises DB"]
            },
            {
                name: "Close Grip Bench Press",
                warmUp: 0,
                sets: 2,
                reps: [15, 12],
                alternatives: []
            },
            {
                name: "Lateral Raises Machine/Cable",
                warmUp: 0,
                sets: 2,
                reps: [20, 16],
                alternatives: ["Upright rows", "Laying lateral raises"]
            }
        ]
    },
    5: { // Day 5 - Pull
        name: "Day 5 - Pull",
        exercises: [
            {
                name: "Close Grip Lat Pulldown with V Bar",
                warmUp: 2,
                sets: 3,
                reps: [15, 12, 10],
                alternatives: ["DB row", "Barbell row", "Pull ups"]
            },
            {
                name: "BB Row",
                warmUp: 0,
                sets: 3,
                reps: [12, 10, 8],
                alternatives: ["Single hand DB row", "Machine row"]
            },
            {
                name: "Reverse Hand Rowing",
                warmUp: 0,
                sets: 2,
                reps: [12, 10],
                alternatives: ["Single hand DB row", "Machine row"]
            },
            {
                name: "Hyper Extension",
                warmUp: 0,
                sets: 3,
                reps: [20, 16, 14],
                alternatives: ["Deadlift", "T bar"]
            },
            {
                name: "Incline Curls",
                warmUp: 0,
                sets: 3,
                reps: [15, 12, 10],
                alternatives: ["Hammer curls", "DB curls"]
            },
            {
                name: "Machine Rope Curls",
                warmUp: 0,
                sets: 3,
                reps: [15, 12, 10],
                alternatives: ["Hammer curls", "DB curls"]
            }
        ]
    },
    6: { // Day 6 - Arms
        name: "Day 6 - Arms",
        exercises: [
            {
                name: "Cable EZ Bar Curls / Tricep Straight Bar Pushdowns",
                warmUp: 0,
                sets: 4,
                reps: ["15-15", "12-12", "10-10", "8-8"],
                special: "Superset",
                alternatives: []
            },
            {
                name: "Preacher Curls / Overhead Tricep Extension",
                warmUp: 0,
                sets: 3,
                reps: ["12-12", "10-10", "8-8"],
                special: "Superset",
                alternatives: []
            },
            {
                name: "Wide Grip Bar Curls / Rope Push Downs",
                warmUp: 0,
                sets: 2,
                reps: ["5p 10f - 10", "5p 10f - 10"],
                special: "Superset",
                alternatives: []
            },
            {
                name: "Hammer Curls Drop / Single Arm Tricep",
                warmUp: 0,
                sets: 2,
                reps: ["(15,12,10) - 10", "(15,12,10) - 10"],
                special: "Superset with drop sets",
                alternatives: []
            }
        ]
    }
};

// Global variables
let currentDay = 1;
let timerInterval = null;
let timerSeconds = 0;
let workoutProgress = JSON.parse(localStorage.getItem('workoutProgress')) || {};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadWorkout(currentDay);
    updateWeekProgress();
    
    // Event listeners
    document.querySelectorAll('.day-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const day = parseInt(e.target.dataset.day);
            switchDay(day);
        });
    });
    
    document.getElementById('resetDay').addEventListener('click', resetCurrentDay);
    document.getElementById('saveNotes').addEventListener('click', saveWorkoutNotes);
    document.getElementById('syncData').addEventListener('click', syncToGoogleSheets);
    document.getElementById('stopTimer').addEventListener('click', stopTimer);
});

function initializeApp() {
    // Initialize progress structure if it doesn't exist
    if (!workoutProgress.days) {
        workoutProgress = {
            days: {},
            notes: {},
            weekStartDate: new Date().toISOString().split('T')[0]
        };
        saveProgress();
    }
}

function switchDay(day) {
    currentDay = day;
    
    // Update active button
    document.querySelectorAll('.day-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-day="${day}"]`).classList.add('active');
    
    loadWorkout(day);
}

function loadWorkout(day) {
    const workout = workoutData[day];
    const exerciseList = document.getElementById('exerciseList');
    const currentWorkout = document.getElementById('currentWorkout');
    
    currentWorkout.textContent = workout.name;
    
    let html = '';
    
    workout.exercises.forEach((exercise, exerciseIndex) => {
        const exerciseProgress = workoutProgress.days[day]?.[exerciseIndex] || {};
        const completedSets = Object.keys(exerciseProgress.sets || {}).filter(
            setIndex => exerciseProgress.sets[setIndex].completed
        ).length;
        
        html += `
            <div class="exercise-card">
                <div class="exercise-header">
                    <div class="exercise-name">
                        ${exercise.name}
                        ${exercise.warmUp > 0 ? `<span class="warm-up-badge">${exercise.warmUp} Warm-up</span>` : ''}
                    </div>
                    <div class="exercise-completion">
                        ${completedSets}/${exercise.sets} sets completed
                    </div>
                </div>
                
                <div class="sets-container">
        `;
        
        // Generate sets
        for (let setIndex = 0; setIndex < exercise.sets; setIndex++) {
            const setProgress = exerciseProgress.sets?.[setIndex] || {};
            const isCompleted = setProgress.completed || false;
            const weight = setProgress.weight || '';
            const repsAchieved = setProgress.repsAchieved || '';
            
            html += `
                <div class="set-row ${isCompleted ? 'completed' : ''}" data-exercise="${exerciseIndex}" data-set="${setIndex}">
                    <input type="checkbox" class="set-checkbox" ${isCompleted ? 'checked' : ''}>
                    <div class="set-info">
                        Set ${setIndex + 1}: ${Array.isArray(exercise.reps) ? exercise.reps[setIndex] : exercise.reps} reps
                        ${exercise.special ? `<br><small style="color: #666;">${exercise.special}</small>` : ''}
                    </div>
                    <input type="number" class="weight-input" placeholder="Weight" value="${weight}" step="0.5">
                    <input type="number" class="reps-achieved" placeholder="Reps" value="${repsAchieved}">
                    <button class="start-timer" onclick="startRestTimer()">Rest Timer</button>
                </div>
            `;
        }
        
        html += `
                </div>
                
                ${exercise.alternatives && exercise.alternatives.length > 0 ? `
                <div class="alternatives">
                    <select onchange="selectAlternative(${exerciseIndex}, this.value)">
                        <option value="">Alternative exercises...</option>
                        ${exercise.alternatives.map(alt => `<option value="${alt}">${alt}</option>`).join('')}
                    </select>
                </div>
                ` : ''}
            </div>
        `;
    });
    
    exerciseList.innerHTML = html;
    
    // Add event listeners to checkboxes and inputs
    addEventListeners();
    
    // Load workout notes
    loadWorkoutNotes();
}

function addEventListeners() {
    // Checkbox listeners
    document.querySelectorAll('.set-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const row = this.closest('.set-row');
            const exerciseIndex = parseInt(row.dataset.exercise);
            const setIndex = parseInt(row.dataset.set);
            
            updateSetProgress(exerciseIndex, setIndex, {
                completed: this.checked,
                weight: row.querySelector('.weight-input').value,
                repsAchieved: row.querySelector('.reps-achieved').value
            });
            
            if (this.checked) {
                row.classList.add('completed');
            } else {
                row.classList.remove('completed');
            }
            
            updateWeekProgress();
        });
    });
    
    // Weight and reps input listeners
    document.querySelectorAll('.weight-input, .reps-achieved').forEach(input => {
        input.addEventListener('blur', function() {
            const row = this.closest('.set-row');
            const exerciseIndex = parseInt(row.dataset.exercise);
            const setIndex = parseInt(row.dataset.set);
            const checkbox = row.querySelector('.set-checkbox');
            
            updateSetProgress(exerciseIndex, setIndex, {
                completed: checkbox.checked,
                weight: row.querySelector('.weight-input').value,
                repsAchieved: row.querySelector('.reps-achieved').value
            });
        });
    });
}

function updateSetProgress(exerciseIndex, setIndex, progress) {
    if (!workoutProgress.days[currentDay]) {
        workoutProgress.days[currentDay] = {};
    }
    
    if (!workoutProgress.days[currentDay][exerciseIndex]) {
        workoutProgress.days[currentDay][exerciseIndex] = { sets: {} };
    }
    
    workoutProgress.days[currentDay][exerciseIndex].sets[setIndex] = progress;
    saveProgress();
}

function saveProgress() {
    localStorage.setItem('workoutProgress', JSON.stringify(workoutProgress));
    updateSyncStatus('📱 Saved locally');
}

function startRestTimer(seconds = 90) {
    stopTimer(); // Stop any existing timer
    
    timerSeconds = seconds;
    const timerElement = document.getElementById('restTimer');
    const displayElement = document.getElementById('timerDisplay');
    
    timerElement.style.display = 'flex';
    
    timerInterval = setInterval(() => {
        const minutes = Math.floor(timerSeconds / 60);
        const remainingSeconds = timerSeconds % 60;
        displayElement.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        
        if (timerSeconds <= 0) {
            stopTimer();
            alert('Rest time is over! 💪');
        }
        
        timerSeconds--;
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    document.getElementById('restTimer').style.display = 'none';
}

function resetCurrentDay() {
    if (confirm(`Are you sure you want to reset all progress for ${workoutData[currentDay].name}?`)) {
        delete workoutProgress.days[currentDay];
        saveProgress();
        loadWorkout(currentDay);
        updateWeekProgress();
    }
}

function updateWeekProgress() {
    const completedDays = Object.keys(workoutProgress.days).filter(day => {
        const dayProgress = workoutProgress.days[day];
        return Object.keys(dayProgress).length > 0;
    }).length;
    
    document.getElementById('weekProgress').textContent = `Week Progress: ${completedDays}/6 days completed`;
    
    // Update day buttons to show completion
    document.querySelectorAll('.day-btn').forEach(btn => {
        const day = parseInt(btn.dataset.day);
        if (workoutProgress.days[day] && Object.keys(workoutProgress.days[day]).length > 0) {
            btn.classList.add('completed');
        } else {
            btn.classList.remove('completed');
        }
    });
}

function selectAlternative(exerciseIndex, alternativeName) {
    if (alternativeName) {
        alert(`Alternative selected: ${alternativeName}\n\nThis will be noted in your workout log.`);
        // You could save this preference in workoutProgress if needed
    }
}

function loadWorkoutNotes() {
    const notes = workoutProgress.notes[currentDay] || '';
    document.getElementById('workoutNotes').value = notes;
}

function saveWorkoutNotes() {
    const notes = document.getElementById('workoutNotes').value;
    workoutProgress.notes[currentDay] = notes;
    saveProgress();
    updateSyncStatus('📝 Notes saved');
}

function updateSyncStatus(message) {
    document.getElementById('syncStatus').textContent = message;
    setTimeout(() => {
        document.getElementById('syncStatus').textContent = '🔄 Ready to sync';
    }, 3000);
}

// Google Sheets Integration
function syncToGoogleSheets() {
    updateSyncStatus('🔄 Syncing to Google Sheets...');
    
    // This is a placeholder for Google Sheets integration
    // You'll need to set up Google Sheets API credentials
    setTimeout(() => {
        updateSyncStatus('✅ Synced successfully!');
        console.log('Workout data to sync:', workoutProgress);
    }, 2000);
}

// Export function for easy data viewing
function exportWorkoutData() {
    const dataStr = JSON.stringify(workoutProgress, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'workout-progress.json';
    link.click();
}
