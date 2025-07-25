// Enhanced workout data with traps and forearms
const workoutData = {
    1: { // Day 1 - Push
        name: "Day 1 - Push",
        icon: "fas fa-fire",
        muscles: ["Chest", "Shoulders", "Triceps"],
        exercises: [
            {
                name: "BB Flat Bench Press",
                warmUp: 3,
                sets: 4,
                reps: [10, 8, 6, 4],
                muscleGroup: "Chest",
                alternatives: ["Machine bench press", "Incline bench press", "DB flat bench press"]
            },
            {
                name: "DB Incline Press",
                warmUp: 1,
                sets: 3,
                reps: [12, 8, 6],
                muscleGroup: "Chest",
                alternatives: ["Incline bench press", "Machine incline bench press", "Flat DB bench press"]
            },
            {
                name: "DB Shoulder Press",
                warmUp: 1,
                sets: 4,
                reps: [15, 12, 10, 6],
                muscleGroup: "Shoulders",
                alternatives: ["Machine shoulder press", "Barbell shoulder press", "Shoulder front raises"]
            },
            {
                name: "Cable Straight Pushdown",
                warmUp: 0,
                sets: 3,
                reps: [15, 12, 10],
                muscleGroup: "Triceps",
                special: "1 drop set on last set",
                alternatives: ["Rope pushdowns", "Single hand cable pushdowns", "Skull crushers"]
            },
            {
                name: "DB Lateral Raises",
                warmUp: 0,
                sets: 4,
                reps: [12, 10, 8, "5 peak hold + 10 full + 10 partial + 5 full"],
                muscleGroup: "Shoulders",
                alternatives: ["Upright rows", "Laying lateral raises"]
            },
            {
                name: "Overhead Tricep Extension",
                warmUp: 0,
                sets: 3,
                reps: [15, 12, 10],
                muscleGroup: "Triceps",
                alternatives: ["Rope pushdowns", "Single hand cable pushdowns", "Skull crushers"]
            },
            {
                name: "Cable Chest Fly (slow reps)",
                warmUp: 0,
                sets: 3,
                reps: [20, 16, 12],
                muscleGroup: "Chest",
                alternatives: ["Machine fly", "DB fly"]
            }
        ]
    },
    2: { // Day 2 - Pull
        name: "Day 2 - Pull",
        icon: "fas fa-hand-paper",
        muscles: ["Back", "Biceps", "Traps"],
        exercises: [
            {
                name: "Lat Pulldown",
                warmUp: 3,
                sets: 4,
                reps: [12, 10, 6, "6 peak contraction"],
                muscleGroup: "Back",
                alternatives: ["DB row", "Barbell row", "Pull ups"]
            },
            {
                name: "Deadlift",
                warmUp: 1,
                sets: 4,
                reps: [10, 8, 6, 4],
                muscleGroup: "Back",
                alternatives: ["Back extension", "DB deadlift"]
            },
            {
                name: "Seated Close Grip Cable Row",
                warmUp: 0,
                sets: 4,
                reps: [12, 10, "10 peak holds", "10 normal reps"],
                muscleGroup: "Back",
                alternatives: ["Row with narrow bar", "Row with wide bar", "DB and BB row"]
            },
            {
                name: "Barbell Shrugs",
                warmUp: 0,
                sets: 4,
                reps: [15, 12, 10, 8],
                muscleGroup: "Traps",
                alternatives: ["DB shrugs", "Cable shrugs", "Behind-the-back shrugs"]
            },
            {
                name: "Rope Pull Overs",
                warmUp: 0,
                sets: 3,
                reps: [16, 12, 10],
                muscleGroup: "Back",
                alternatives: ["Pull over with DB"]
            },
            {
                name: "DB Hammer Curls",
                warmUp: 0,
                sets: 3,
                reps: [15, 12, 10],
                muscleGroup: "Biceps",
                alternatives: ["DB curls", "Preacher curls"]
            },
            {
                name: "Preacher Curls",
                warmUp: 0,
                sets: 4,
                reps: [16, 12, 10, 8],
                muscleGroup: "Biceps",
                alternatives: ["DB curls", "Seated curls"]
            },
            {
                name: "Barbell Curls",
                warmUp: 0,
                sets: 2,
                reps: [20, 15],
                muscleGroup: "Biceps",
                alternatives: ["Supinated curls", "Cable curls"]
            }
        ]
    },
    3: { // Day 3 - Legs
        name: "Day 3 - Legs",
        icon: "fas fa-walking",
        muscles: ["Quads", "Hamstrings", "Glutes", "Calves"],
        exercises: [
            {
                name: "BB Squat",
                warmUp: 3,
                sets: 4,
                reps: [15, 10, 6, 4],
                muscleGroup: "Quads",
                alternatives: ["Hack squats", "Leg press"]
            },
            {
                name: "Lunges",
                warmUp: 1,
                sets: 3,
                reps: ["8 stride per leg per set"],
                muscleGroup: "Quads",
                alternatives: ["Reverse squat", "Romanian deadlift"]
            },
            {
                name: "Sumo Stance Leg Press",
                warmUp: 0,
                sets: 3,
                reps: [12, 10, 8],
                muscleGroup: "Glutes",
                alternatives: ["Bridge glutes", "Goblet squat", "Sumo squat"]
            },
            {
                name: "Hamstring Curls",
                warmUp: 0,
                sets: 3,
                reps: [15, 12, 10],
                muscleGroup: "Hamstrings",
                alternatives: ["Reverse hamstring curls"]
            },
            {
                name: "Leg Extension",
                warmUp: 0,
                sets: 3,
                reps: [15, 12, 10],
                muscleGroup: "Quads",
                alternatives: ["Adductors", "Hack squat full depth"]
            },
            {
                name: "Calf Raises (Standing or Sitting)",
                warmUp: 0,
                sets: 4,
                reps: [25, 20, 20, 15],
                muscleGroup: "Calves",
                alternatives: []
            }
        ]
    },
    4: { // Day 4 - Push
        name: "Day 4 - Push",
        icon: "fas fa-fire",
        muscles: ["Chest", "Shoulders", "Triceps"],
        exercises: [
            {
                name: "BB Incline Bench",
                warmUp: 3,
                sets: 2,
                reps: [12, 10],
                muscleGroup: "Chest",
                alternatives: ["Machine bench press", "Incline bench press", "DB flat bench press"]
            },
            {
                name: "Cambered Bar Front Raise",
                warmUp: 0,
                sets: 3,
                reps: [15, 12, 10],
                muscleGroup: "Shoulders",
                alternatives: ["Machine shoulder press", "Barbell shoulder press", "Shoulder front raises DB"]
            },
            {
                name: "Cable Rope Face Pulls w/ Rear Delt Fly",
                warmUp: 0,
                sets: 3,
                reps: ["12, 10, 8 for both"],
                muscleGroup: "Shoulders",
                alternatives: ["Bent over delt fly"]
            },
            {
                name: "Lowest Angle Chest Fly",
                warmUp: 0,
                sets: 3,
                reps: [15, 12, 10],
                muscleGroup: "Chest",
                alternatives: ["Machine fly", "DB fly"]
            },
            {
                name: "Front Plate Raise",
                warmUp: 0,
                sets: 2,
                reps: [20, 16],
                muscleGroup: "Shoulders",
                alternatives: ["Machine shoulder press", "Barbell shoulder press", "Shoulder front raises DB"]
            },
            {
                name: "Close Grip Bench Press",
                warmUp: 0,
                sets: 2,
                reps: [15, 12],
                muscleGroup: "Triceps",
                alternatives: []
            },
            {
                name: "Lateral Raises Machine/Cable",
                warmUp: 0,
                sets: 2,
                reps: [20, 16],
                muscleGroup: "Shoulders",
                alternatives: ["Upright rows", "Laying lateral raises"]
            }
        ]
    },
    5: { // Day 5 - Pull
        name: "Day 5 - Pull",
        icon: "fas fa-hand-paper",
        muscles: ["Back", "Biceps", "Traps"],
        exercises: [
            {
                name: "Close Grip Lat Pulldown with V Bar",
                warmUp: 2,
                sets: 3,
                reps: [15, 12, 10],
                muscleGroup: "Back",
                alternatives: ["DB row", "Barbell row", "Pull ups"]
            },
            {
                name: "BB Row",
                warmUp: 0,
                sets: 3,
                reps: [12, 10, 8],
                muscleGroup: "Back",
                alternatives: ["Single hand DB row", "Machine row"]
            },
            {
                name: "Reverse Hand Rowing",
                warmUp: 0,
                sets: 2,
                reps: [12, 10],
                muscleGroup: "Back",
                alternatives: ["Single hand DB row", "Machine row"]
            },
            {
                name: "Face Pulls",
                warmUp: 0,
                sets: 3,
                reps: [20, 16, 12],
                muscleGroup: "Traps",
                alternatives: ["Upright rows", "Cable lateral raises"]
            },
            {
                name: "Hyper Extension",
                warmUp: 0,
                sets: 3,
                reps: [20, 16, 14],
                muscleGroup: "Back",
                alternatives: ["Deadlift", "T bar"]
            },
            {
                name: "Incline Curls",
                warmUp: 0,
                sets: 3,
                reps: [15, 12, 10],
                muscleGroup: "Biceps",
                alternatives: ["Hammer curls", "DB curls"]
            },
            {
                name: "Machine Rope Curls",
                warmUp: 0,
                sets: 3,
                reps: [15, 12, 10],
                muscleGroup: "Biceps",
                alternatives: ["Hammer curls", "DB curls"]
            }
        ]
    },
    6: { // Day 6 - Arms
        name: "Day 6 - Arms",
        icon: "fas fa-fist-raised",
        muscles: ["Biceps", "Triceps", "Forearms"],
        exercises: [
            {
                name: "Cable EZ Bar Curls / Tricep Straight Bar Pushdowns",
                warmUp: 0,
                sets: 4,
                reps: ["15-15", "12-12", "10-10", "8-8"],
                muscleGroup: "Arms",
                special: "Superset",
                alternatives: []
            },
            {
                name: "Preacher Curls / Overhead Tricep Extension",
                warmUp: 0,
                sets: 3,
                reps: ["12-12", "10-10", "8-8"],
                muscleGroup: "Arms",
                special: "Superset",
                alternatives: []
            },
            {
                name: "Wide Grip Bar Curls / Rope Push Downs",
                warmUp: 0,
                sets: 2,
                reps: ["5p 10f - 10", "5p 10f - 10"],
                muscleGroup: "Arms",
                special: "Superset",
                alternatives: []
            },
            {
                name: "Hammer Curls Drop / Single Arm Tricep",
                warmUp: 0,
                sets: 2,
                reps: ["(15,12,10) - 10", "(15,12,10) - 10"],
                muscleGroup: "Arms",
                special: "Superset with drop sets",
                alternatives: []
            },
            {
                name: "Wrist Curls",
                warmUp: 0,
                sets: 3,
                reps: [20, 18, 15],
                muscleGroup: "Forearms",
                alternatives: ["Reverse wrist curls", "Farmer walks"]
            },
            {
                name: "Reverse Wrist Curls",
                warmUp: 0,
                sets: 3,
                reps: [15, 12, 10],
                muscleGroup: "Forearms",
                alternatives: ["Wrist curls", "Plate pinches"]
            },
            {
                name: "Farmer Walks",
                warmUp: 0,
                sets: 3,
                reps: ["30 steps", "25 steps", "20 steps"],
                muscleGroup: "Forearms",
                alternatives: ["Dead hangs", "Grip squeezes"]
            }
        ]
    }
};

// Global variables
let currentDay = 1;
let timerInterval = null;
let timerSeconds = 0;
let workoutProgress = JSON.parse(localStorage.getItem('workoutProgress')) || {};
let workoutStartTime = null;
let particlesLoaded = false;
let workoutTimerInterval = null;
let workoutElapsedSeconds = 0;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    showSplashScreen();
    initializeParticles();
    initializeApp();
    
    setTimeout(() => {
        hideSplashScreen();
        showHomeScreen();
    }, 3000);
});

// Splash Screen Functions
function showSplashScreen() {
    const splash = document.getElementById('splashScreen');
    if (splash) {
        splash.style.display = 'flex';
    }
}

function hideSplashScreen() {
    const splash = document.getElementById('splashScreen');
    if (splash) {
        splash.style.animation = 'fadeOut 0.5s ease-in-out forwards';
        setTimeout(() => {
            splash.style.display = 'none';
        }, 500);
    }
}

// Particles Background
function initializeParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 50, density: { enable: true, value_area: 800 } },
                color: { value: "#ffffff" },
                shape: { type: "circle" },
                opacity: { value: 0.1, random: false },
                size: { value: 3, random: true },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#ffffff",
                    opacity: 0.1,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: "none",
                    random: false,
                    straight: false,
                    out_mode: "out",
                    bounce: false
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "repulse" },
                    onclick: { enable: true, mode: "push" },
                    resize: true
                }
            },
            retina_detect: true
        });
        particlesLoaded = true;
    }
}

// Initialize App
function initializeApp() {
    if (!workoutProgress.days) {
        workoutProgress = {
            days: {},
            notes: {},
            analytics: {
                totalWorkouts: 0,
                weeklyWorkouts: [],
                strengthProgress: {},
                exerciseFrequency: {}
            },
            weekStartDate: new Date().toISOString().split('T')[0]
        };
        saveProgress();
    }
    
    setupEventListeners();
    updateHomeStats();
    
    // Create charts with delay to ensure DOM is ready
    setTimeout(() => {
        createAnalyticsCharts();
    }, 1000);
}

// Event Listeners Setup
function setupEventListeners() {
    // Day selector
    const daySelector = document.getElementById('daySelector');
    if (daySelector) {
        daySelector.addEventListener('change', function() {
            const startBtn = document.getElementById('startWorkout');
            if (startBtn) {
                if (this.value) {
                    startBtn.disabled = false;
                    startBtn.style.opacity = '1';
                } else {
                    startBtn.disabled = true;
                    startBtn.style.opacity = '0.5';
                }
            }
        });
    }
    
    // Start workout button
    const startWorkoutBtn = document.getElementById('startWorkout');
    if (startWorkoutBtn) {
        startWorkoutBtn.addEventListener('click', function() {
            const selectedDay = document.getElementById('daySelector').value;
            if (selectedDay) {
                currentDay = parseInt(selectedDay);
                showWorkoutScreen();
                loadWorkout(currentDay);
                startWorkoutTimer();
            }
        });
    }
    
    // Back to home button
    const backHomeBtn = document.getElementById('backHome');
    if (backHomeBtn) {
        backHomeBtn.addEventListener('click', function() {
            showHomeScreen();
            stopWorkoutTimer();
        });
    }
    
    // Day tabs in workout screen - Fixed event listeners
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const day = parseInt(e.currentTarget.dataset.day);
            if (day) {
                switchDay(day);
            }
        });
    });
    
    // Analytics buttons
    const fullAnalyticsBtn = document.getElementById('fullAnalytics');
    if (fullAnalyticsBtn) {
        fullAnalyticsBtn.addEventListener('click', showAnalyticsModal);
    }
    
    const closeAnalyticsBtn = document.getElementById('closeAnalytics');
    if (closeAnalyticsBtn) {
        closeAnalyticsBtn.addEventListener('click', hideAnalyticsModal);
    }
    
    // Notes save button
    const saveNotesBtn = document.getElementById('saveNotes');
    if (saveNotesBtn) {
        saveNotesBtn.addEventListener('click', saveWorkoutNotes);
    }
    
    // Timer control buttons
    const stopTimerBtn = document.getElementById('stopTimer');
    if (stopTimerBtn) {
        stopTimerBtn.addEventListener('click', stopRestTimer);
    }
    
    const pauseTimerBtn = document.getElementById('pauseTimer');
    if (pauseTimerBtn) {
        pauseTimerBtn.addEventListener('click', pauseRestTimer);
    }
    
    const addTimeBtn = document.getElementById('addTime');
    if (addTimeBtn) {
        addTimeBtn.addEventListener('click', () => addRestTime(30));
    }
}

// Screen Navigation Functions
function showHomeScreen() {
    const homeScreen = document.getElementById('homeScreen');
    const workoutScreen = document.getElementById('workoutScreen');
    
    if (homeScreen) homeScreen.style.display = 'block';
    if (workoutScreen) workoutScreen.style.display = 'none';
    
    updateHomeStats();
    setTimeout(() => {
        updateAnalyticsCharts();
    }, 500);
}

function showWorkoutScreen() {
    const homeScreen = document.getElementById('homeScreen');
    const workoutScreen = document.getElementById('workoutScreen');
    
    if (homeScreen) homeScreen.style.display = 'none';
    if (workoutScreen) workoutScreen.style.display = 'block';
    
    updateWorkoutProgress();
}

// Home Screen Stats Functions
function updateHomeStats() {
    const totalWorkouts = Object.keys(workoutProgress.days).length;
    const thisWeek = getThisWeekWorkouts();
    const avgWeekly = calculateWeeklyAverage();
    const streak = getCurrentStreak();
    
    const totalWorkoutsEl = document.getElementById('totalWorkouts');
    const thisWeekWorkoutsEl = document.getElementById('thisWeekWorkouts');
    const avgWeeklyWorkoutsEl = document.getElementById('avgWeeklyWorkouts');
    const currentStreakEl = document.getElementById('currentStreak');
    
    if (totalWorkoutsEl) totalWorkoutsEl.textContent = totalWorkouts;
    if (thisWeekWorkoutsEl) thisWeekWorkoutsEl.textContent = thisWeek;
    if (avgWeeklyWorkoutsEl) avgWeeklyWorkoutsEl.textContent = avgWeekly.toFixed(1);
    if (currentStreakEl) currentStreakEl.textContent = streak;
}

function getThisWeekWorkouts() {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    let count = 0;
    
    Object.keys(workoutProgress.days).forEach(day => {
        const workoutDate = new Date(workoutProgress.days[day].date || Date.now());
        if (workoutDate >= startOfWeek) {
            count++;
        }
    });
    
    return count;
}

function calculateWeeklyAverage() {
    const totalWorkouts = Object.keys(workoutProgress.days).length;
    const firstWorkoutDate = new Date(workoutProgress.weekStartDate);
    const today = new Date();
    const weeksDiff = Math.ceil((today - firstWorkoutDate) / (1000 * 60 * 60 * 24 * 7));
    
    return weeksDiff > 0 ? totalWorkouts / weeksDiff : 0;
}

function getCurrentStreak() {
    const workoutDates = Object.values(workoutProgress.days)
        .map(d => new Date(d.date || Date.now()))
        .sort((a, b) => b - a);
    
    if (workoutDates.length === 0) return 0;
    
    let streak = 1;
    for (let i = 1; i < workoutDates.length; i++) {
        const daysDiff = (workoutDates[i-1] - workoutDates[i]) / (1000 * 60 * 60 * 24);
        if (daysDiff <= 2) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

// Fixed Analytics Charts Functions
function createAnalyticsCharts() {
    setTimeout(() => {
        createWeeklyProgressChart();
        createExercisePieChart();
        createStrengthProgressChart();
    }, 500);
}

function createWeeklyProgressChart() {
    const ctx = document.getElementById('weeklyProgressChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (window.weeklyChart) {
        window.weeklyChart.destroy();
    }
    
    const weeklyData = generateWeeklyData();
    
    try {
        window.weeklyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: weeklyData.labels,
                datasets: [{
                    label: 'Workouts Completed',
                    data: weeklyData.data,
                    borderColor: '#4facfe',
                    backgroundColor: 'rgba(79, 172, 254, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                    },
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                    }
                }
            }
        });
    } catch (error) {
        console.log('Chart.js not loaded yet, retrying...', error);
        setTimeout(() => createWeeklyProgressChart(), 1000);
    }
}

function createExercisePieChart() {
    const ctx = document.getElementById('exercisePieChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (window.pieChart) {
        window.pieChart.destroy();
    }
    
    const exerciseData = generateExerciseDistribution();
    
    try {
        window.pieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: exerciseData.labels,
                datasets: [{
                    data: exerciseData.data,
                    backgroundColor: [
                        '#ff6b6b', '#4ecdc4', '#45b7d1',
                        '#96ceb4', '#ffd93d', '#6c5ce7'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    } catch (error) {
        console.log('Chart.js not loaded yet for pie chart, retrying...', error);
        setTimeout(() => createExercisePieChart(), 1000);
    }
}

function createStrengthProgressChart() {
    const ctx = document.getElementById('strengthProgressChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (window.strengthChart) {
        window.strengthChart.destroy();
    }
    
    const strengthData = generateStrengthData();
    
    try {
        window.strengthChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: strengthData.labels,
                datasets: [{
                    label: 'Weight (lbs)',
                    data: strengthData.data,
                    borderColor: '#ffd93d',
                    backgroundColor: 'rgba(255, 217, 61, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                    },
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                    }
                }
            }
        });
    } catch (error) {
        console.log('Chart.js not loaded yet for strength chart, retrying...', error);
        setTimeout(() => createStrengthProgressChart(), 1000);
    }
}

// Data Generation Functions
function generateWeeklyData() {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = [1, 0, 1, 1, 0, 1, 0]; // Sample data
    
    return { labels, data };
}

function generateExerciseDistribution() {
    const muscleGroups = {};
    
    // Count exercises from completed workouts
    Object.values(workoutProgress.days).forEach(dayData => {
        Object.values(dayData).forEach(exerciseData => {
            if (exerciseData.muscleGroup) {
                muscleGroups[exerciseData.muscleGroup] = (muscleGroups[exerciseData.muscleGroup] || 0) + 1;
            }
        });
    });
    
    // Default data if no workouts completed
    if (Object.keys(muscleGroups).length === 0) {
        return {
            labels: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'],
            data: [20, 25, 20, 15, 15, 5]
        };
    }
    
    return {
        labels: Object.keys(muscleGroups),
        data: Object.values(muscleGroups)
    };
}

function generateStrengthData() {
    return {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        data: [135, 140, 145, 150]
    };
}

// Workout Functions
function switchDay(day) {
    currentDay = day;
    
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeTab = document.querySelector(`[data-day="${day}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    loadWorkout(day);
}

function loadWorkout(day) {
    const workout = workoutData[day];
    if (!workout) return;
    
    const exerciseList = document.getElementById('exerciseList');
    const currentWorkout = document.getElementById('currentWorkout');
    
    if (currentWorkout) {
        currentWorkout.textContent = workout.name;
    }
    
    if (!exerciseList) return;
    
    let html = '';
    
    workout.exercises.forEach((exercise, exerciseIndex) => {
        const exerciseProgress = workoutProgress.days[day]?.[exerciseIndex] || {};
        const completedSets = Object.keys(exerciseProgress.sets || {}).filter(
            setIndex => exerciseProgress.sets[setIndex].completed
        ).length;
        
        html += `
            <div class="exercise-card-modern">
                <div class="exercise-header-modern">
                    <div class="exercise-title">
                        <div class="exercise-name-modern">${exercise.name}</div>
                        ${exercise.warmUp > 0 ? `<span class="warm-up-indicator">${exercise.warmUp} Warm-up</span>` : ''}
                        ${exercise.special ? `<span class="warm-up-indicator">${exercise.special}</span>` : ''}
                    </div>
                    <div class="exercise-meta">
                        <div class="completion-badge">
                            ${completedSets}/${exercise.sets} sets
                        </div>
                    </div>
                </div>
                
                <div class="sets-grid-modern">
        `;
        
        // Generate sets
        for (let setIndex = 0; setIndex < exercise.sets; setIndex++) {
            const setProgress = exerciseProgress.sets?.[setIndex] || {};
            const isCompleted = setProgress.completed || false;
            const weight = setProgress.weight || '';
            const repsAchieved = setProgress.repsAchieved || '';
            
            html += `
                <div class="set-row-modern ${isCompleted ? 'completed' : ''}" data-exercise="${exerciseIndex}" data-set="${setIndex}">
                    <input type="checkbox" class="set-checkbox-modern" ${isCompleted ? 'checked' : ''}>
                    <div class="set-info-modern">
                        Set ${setIndex + 1}: ${Array.isArray(exercise.reps) ? exercise.reps[setIndex] : exercise.reps} reps
                    </div>
                    <input type="number" class="input-modern" placeholder="Weight" value="${weight}" step="0.5">
                    <input type="number" class="input-modern" placeholder="Reps" value="${repsAchieved}">
                    <button class="action-btn-modern" onclick="startRestTimer(90)">
                        <i class="fas fa-stopwatch"></i>
                        Rest
                    </button>
                </div>
            `;
        }
        
        html += `
                </div>
                
                ${exercise.alternatives && exercise.alternatives.length > 0 ? `
                <div class="alternatives-modern">
                    <select class="modern-dropdown" onchange="selectAlternative(${exerciseIndex}, this.value)">
                        <option value="">Alternative exercises...</option>
                        ${exercise.alternatives.map(alt => `<option value="${alt}">${alt}</option>`).join('')}
                    </select>
                </div>
                ` : ''}
            </div>
        `;
    });
    
    exerciseList.innerHTML = html;
    addWorkoutEventListeners();
    updateWorkoutProgress();
}

function addWorkoutEventListeners() {
    // Checkbox listeners
    document.querySelectorAll('.set-checkbox-modern').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const row = this.closest('.set-row-modern');
            const exerciseIndex = parseInt(row.dataset.exercise);
            const setIndex = parseInt(row.dataset.set);
            
            updateSetProgress(exerciseIndex, setIndex, {
                completed: this.checked,
                weight: row.querySelector('.input-modern[placeholder="Weight"]').value,
                repsAchieved: row.querySelector('.input-modern[placeholder="Reps"]').value
            });
            
            if (this.checked) {
                row.classList.add('completed');
                startRestTimer(90);
            } else {
                row.classList.remove('completed');
            }
            
            updateWorkoutProgress();
        });
    });
    
    // Input listeners
    document.querySelectorAll('.input-modern').forEach(input => {
        input.addEventListener('blur', function() {
            const row = this.closest('.set-row-modern');
            const exerciseIndex = parseInt(row.dataset.exercise);
            const setIndex = parseInt(row.dataset.set);
            const checkbox = row.querySelector('.set-checkbox-modern');
            
            updateSetProgress(exerciseIndex, setIndex, {
                completed: checkbox.checked,
                weight: row.querySelector('.input-modern[placeholder="Weight"]').value,
                repsAchieved: row.querySelector('.input-modern[placeholder="Reps"]').value,
                muscleGroup: workoutData[currentDay].exercises[exerciseIndex].muscleGroup
            });
        });
    });
}

function updateSetProgress(exerciseIndex, setIndex, progress) {
    if (!workoutProgress.days[currentDay]) {
        workoutProgress.days[currentDay] = { date: new Date().toISOString() };
    }
    
    if (!workoutProgress.days[currentDay][exerciseIndex]) {
        workoutProgress.days[currentDay][exerciseIndex] = { 
            sets: {},
            muscleGroup: workoutData[currentDay].exercises[exerciseIndex].muscleGroup
        };
    }
    
    workoutProgress.days[currentDay][exerciseIndex].sets[setIndex] = progress;
    saveProgress();
}

function updateWorkoutProgress() {
    if (!workoutData[currentDay]) return;
    
    const totalSets = workoutData[currentDay].exercises.reduce((sum, ex) => sum + ex.sets, 0);
    const completedSets = countCompletedSets();
    const percentage = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
    
    const workoutProgressEl = document.getElementById('workoutProgress');
    const progressTextEl = document.getElementById('progressText');
    const completedSetsEl = document.getElementById('completedSets');
    
    if (workoutProgressEl) {
        workoutProgressEl.style.width = `${percentage}%`;
    }
    
    if (progressTextEl) {
        progressTextEl.textContent = `${Math.round(percentage)}% Complete`;
    }
    
    if (completedSetsEl) {
        completedSetsEl.textContent = `${completedSets}/${totalSets} sets`;
    }
}

function countCompletedSets() {
    let count = 0;
    const dayData = workoutProgress.days[currentDay];
    
    if (dayData) {
        Object.values(dayData).forEach(exerciseData => {
            if (exerciseData.sets) {
                Object.values(exerciseData.sets).forEach(setData => {
                    if (setData.completed) count++;
                });
            }
        });
    }
    
    return count;
}

// Timer Functions
function startWorkoutTimer() {
    workoutStartTime = Date.now();
    workoutElapsedSeconds = 0;
    
    workoutTimerInterval = setInterval(() => {
        workoutElapsedSeconds++;
        const minutes = Math.floor(workoutElapsedSeconds / 60);
        const seconds = workoutElapsedSeconds % 60;
        
        const workoutDurationEl = document.getElementById('workoutDuration');
        if (workoutDurationEl) {
            workoutDurationEl.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

function stopWorkoutTimer() {
    if (workoutTimerInterval) {
        clearInterval(workoutTimerInterval);
        workoutTimerInterval = null;
    }
}

function startRestTimer(seconds = 90) {
    stopRestTimer(); // Stop any existing timer
    
    timerSeconds = seconds;
    const timerSection = document.getElementById('restTimerSection');
    const displayElement = document.getElementById('timerDisplay');
    const circleElement = document.getElementById('timerCircle');
    
    if (timerSection) {
        timerSection.style.display = 'block';
    }
    
    const totalSeconds = seconds;
    const circumference = 2 * Math.PI * 45; // radius = 45
    
    timerInterval = setInterval(() => {
        const minutes = Math.floor(timerSeconds / 60);
        const remainingSeconds = timerSeconds % 60;
        
        if (displayElement) {
            displayElement.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
        
        // Update circle progress
        if (circleElement) {
            const progress = (totalSeconds - timerSeconds) / totalSeconds;
            const strokeDashoffset = circumference - (progress * circumference);
            circleElement.style.strokeDashoffset = strokeDashoffset;
        }
        
        if (timerSeconds <= 0) {
            stopRestTimer();
            showNotification('Rest time is over! 💪');
        }
        
        timerSeconds--;
    }, 1000);
}

function stopRestTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    const timerSection = document.getElementById('restTimerSection');
    if (timerSection) {
        timerSection.style.display = 'none';
    }
}

function pauseRestTimer() {
    const pauseBtn = document.getElementById('pauseTimer');
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        if (pauseBtn) {
            pauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    } else {
        startRestTimer(timerSeconds);
        if (pauseBtn) {
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
    }
}

function addRestTime(seconds) {
    timerSeconds += seconds;
}

// Utility Functions
function saveProgress() {
    localStorage.setItem('workoutProgress', JSON.stringify(workoutProgress));
}

function saveWorkoutNotes() {
    const notesEl = document.getElementById('workoutNotes');
    if (notesEl) {
        const notes = notesEl.value;
        workoutProgress.notes[currentDay] = notes;
        saveProgress();
        showNotification('Notes saved! 📝');
    }
}

function selectAlternative(exerciseIndex, alternativeName) {
    if (alternativeName) {
        showNotification(`Alternative selected: ${alternativeName}`);
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        padding: 1rem;
        color: white;
        z-index: 1001;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// Analytics Modal Functions
function showAnalyticsModal() {
    const modal = document.getElementById('analyticsModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function hideAnalyticsModal() {
    const modal = document.getElementById('analyticsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function updateAnalyticsCharts() {
    setTimeout(() => {
        createAnalyticsCharts();
    }, 100);
}

// Add notification CSS
const notificationCSS = `
@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(100%);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.notification-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.notification-content button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.3s ease;
}

.notification-content button:hover {
    background: rgba(255, 255, 255, 0.1);
}
`;

const style = document.createElement('style');
style.textContent = notificationCSS;
document.head.appendChild(style);
