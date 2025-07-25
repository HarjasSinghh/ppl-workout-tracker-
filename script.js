// --- CONFIGURATION ---
const GOOGLE_CONFIG = {
    CLIENT_ID: '1040913543341-0vj52ims83dkcudpvh6rdtvrvr5da5nn.apps.googleusercontent.com',
    SPREADSHEET_ID: '15O-z40Jsy2PFs0XaXle07g_hJuwBCgpEi399TC9Yaic',
    SCOPES: "https://www.googleapis.com/auth/spreadsheets.readonly",
};

const workoutData = { /* ... Your workout data here ... */ };
const quotes = [ /* ... Quotes here ... */ ];

// --- STATE MANAGEMENT ---
let currentDay = 1;
let workoutProgress = JSON.parse(localStorage.getItem('workoutProgress')) || {};
let gapiInited = false;
let gisInited = false;
let tokenClient;
let sheetData = [];

// --- INITIALIZATION ---
window.gapiLoaded = () => gapi.load('client', initializeGapiClient);
window.gisLoaded = () => {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CONFIG.CLIENT_ID,
        scope: GOOGLE_CONFIG.SCOPES,
        callback: '',
    });
    gisInited = true;
    checkAuthButton();
};

async function initializeGapiClient() {
    await gapi.client.init({ discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"] });
    gapiInited = true;
    checkAuthButton();
}

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateHomePage();
    showPage('homeScreen');
});

function checkAuthButton() {
    if (gapiInited && gisInited) {
        document.getElementById('authorizeBtn').style.visibility = 'visible';
    }
}

// --- UI & NAVIGATION ---
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.page === pageId));
    if (pageId === 'dashboardScreen') fetchAndDisplayDashboard();
}

function updateHomePage() {
    const workoutCount = Object.keys(workoutProgress).filter(k => k !== 'notes').length;
    document.getElementById('totalWorkoutsStat').textContent = workoutCount;
    // You can add more complex streak logic here
    document.getElementById('streakStat').textContent = `${workoutCount} Days`;
    document.getElementById('quoteOfTheDay').textContent = quotes[Math.floor(Math.random() * quotes.length)];
}

// --- AUTHENTICATION & SYNC ---
function handleAuthClick(isSilent = false) {
    const prompt = isSilent ? '' : 'consent';
    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt });
    }
}

tokenClient.callback = (resp) => {
    if (resp.error) throw resp;
    updateSigninStatus(true);
};

function updateSigninStatus(isSignedIn) {
    document.getElementById('authorizeBtn').style.display = isSignedIn ? 'none' : 'block';
    document.getElementById('syncDataBtn').style.display = isSignedIn ? 'block' : 'none';
}

async function syncData() {
    // This now reads data for the dashboard. Writing data is handled locally.
    fetchAndDisplayDashboard();
}

// --- DASHBOARD & ANALYTICS ---
async function fetchAndDisplayDashboard() {
    if (!gapi.client.getToken()) {
        handleAuthClick(true); // Try a silent login first
        showNotification("Please authorize to view dashboard.", "error");
        return;
    }
    showNotification("Fetching data from Google Sheets...");
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
            range: 'WorkoutLog!A:G',
        });
        sheetData = response.result.values || [];
        filterAndRenderDashboard();
    } catch (err) {
        console.error("Error fetching sheet data:", err);
        showNotification("Failed to fetch data. Check permissions.", "error");
    }
}

function filterAndRenderDashboard() {
    const days = document.getElementById('timeFilter').value;
    const filteredData = days === 'all' ? sheetData.slice(1) : sheetData.slice(1).filter(row => {
        const date = new Date(row[0]);
        const diff = (new Date() - date) / (1000 * 60 * 60 * 24);
        return diff <= days;
    });
    renderDashboard(filteredData);
}

function renderDashboard(data) {
    const container = document.getElementById('dashboardContent');
    container.innerHTML = '<h3>Loading Charts...</h3>';
    if(data.length === 0) {
        container.innerHTML = '<p>No data found for this period.</p>';
        return;
    }

    // Example Analysis: Body Part Volume
    const bodyPartVolume = data.reduce((acc, row) => {
        const bodyPart = getBodyPartFromDay(row[1]); // Day name is in column B (index 1)
        const volume = (Number(row[4]) || 0) * (Number(row[5]) || 0); // Weight * Reps
        if (bodyPart) {
            acc[bodyPart] = (acc[bodyPart] || 0) + volume;
        }
        return acc;
    }, {});
    
    container.innerHTML = ''; // Clear loading
    const chartCard = document.createElement('div');
    chartCard.className = 'dashboard-card';
    chartCard.innerHTML = '<h3>Body Part Volume (kg)</h3><canvas id="bodyPartChart"></canvas>';
    container.appendChild(chartCard);

    new Chart(document.getElementById('bodyPartChart'), {
        type: 'pie',
        data: {
            labels: Object.keys(bodyPartVolume),
            datasets: [{
                data: Object.values(bodyPartVolume),
                backgroundColor: ['#4285F4', '#DB4437', '#F4B400', '#0F9D58', '#AB47BC', '#00ACC1'],
            }]
        }
    });
}

function getBodyPartFromDay(dayName) {
    if (dayName.includes('Push')) return 'Push (Chest/Shoulders/Triceps)';
    if (dayName.includes('Pull')) return 'Pull (Back/Biceps)';
    if (dayName.includes('Legs')) return 'Legs';
    if (dayName.includes('Arms')) return 'Arms';
    return 'Other';
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(link.dataset.page);
        });
    });
    // Add other listeners for workout cards, back buttons etc.
}

// --- UTILITIES ---
function showNotification(message, type = 'info') {
    // ... notification logic
}
