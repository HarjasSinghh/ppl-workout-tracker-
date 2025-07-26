Certainly! Below is a comprehensive **README.md** file that documents all the functionalities of your FitTrack Pro workout tracker website, including key features, setup instructions, user guide, and troubleshooting tips.

# FitTrack Pro - Modern Personal PPL Workout Tracker

**FitTrack Pro** is a modern, personal workout tracking web application tailored for a Push-Pull-Legs (PPL) routine. It supports multiple users, workout logging, Google Sheets synchronization, detailed dashboard analytics, and AI-powered assistance for personalized fitness guidance.

## Features

### User Management
- Support for two predefined users (default names: **Harjas** and **Darvesh**).
- Simple user selector to toggle between users.
- Data is saved and displayed separately for each user.

### Workout Logging
- Predefined workout plans for 6 days (Push Day 1, Pull Day 1, Leg Day, Push Day 2, Pull Day 2, Arms Day).
- Supports multiple exercises per day with customizable sets.
- Track completed sets via checkboxes.
- Log weight (kg) and reps for each set.
- Add workout notes per session to record thoughts, performance, and energy levels.

### Google Sheets Integration
- Sync workout data securely to a Google Sheet (`WorkoutLog` tab).
- Data saved includes date, day, body part, exercise, weight, reps, user, and notes.
- One-click sync button available globally on all pages.
- Ability to clear all workout data from the Google Sheet via dashboard button.

### Dashboard & Analytics
- Visual dashboard showing personal workout data.
- Filters by user, body part, exercise, date ranges or custom date selection.
- Calculates estimated one-rep max (1RM) and shows best lifts.
- Graphical progress charts over time using Chart.js.
- Quick fitness tips based on progress trends.
- AI-powered progress analysis providing actionable recommendations.

### AI-Powered Chat
- Centered modal AI chatbot assistant for general fitness questions.
- Uses Google Gemini model via secure serverless function on Netlify.
- Natural language responses tailored as expert fitness coach advice.

### Date Filters
- Flexible date filtering with predefined ranges: last 7 days, 30 days, 90 days, or all time.
- Custom date range picker for precise filtering.

### Authorization & Security
- Google OAuth 2.0 authorization integrated for access to Google Sheets.
- Authorization buttons displayed contextually on pages and header.
- Secure Netlify serverless function backend to manage AI API keys safely.

### Responsive & Modern UI
- Clean, minimal design with intuitive navigation and layout.
- Dark/light theme flexibility (can be customized).
- Floating action buttons for sync and AI chat accessible on all pages.

## Setup Instructions

### 1. Clone or Download the Repository

Ensure you have the following files structure in your project root:

```
/ (root)
├── netlify/
│   └── functions/
│       └── ask-ai.js      # serverless function for AI calls
├── index.html             # web app frontend HTML
├── styles.css             # CSS styling
└── script.js              # client-side JavaScript logic
```

### 2. Configure Google Cloud Console

- Create or select a Google Cloud project.
- Create OAuth 2.0 Client ID credentials for a Web Application.
- Add your **Netlify URL** to "Authorized JavaScript origins".
- Obtain your **Client ID** and add it to `script.js` in `GOOGLE_CONFIG.CLIENT_ID`.

### 3. Google Sheet Setup

- Create a Google Sheet titled **"PPL Workout Tracker"**.
- Add a sheet named `WorkoutLog`.
- Set the header row exactly as follows in row 1, columns A to H:

```
Date | Day | Body Part | Exercise | Weight | Reps | User | Notes
```

- Share the sheet with your Google service account email or authorize via OAuth.

### 4. Netlify Function Setup

- Deploy your app to Netlify.
- Create a Netlify environment variable named `GEMINI_API_KEY` and set it to your Google Gemini API key.
- Ensure serverless function `ask-ai.js` is in `netlify/functions/`.

### 5. Update Configuration

In `script.js`, replace placeholders:

- `YOUR_OAUTH_CLIENT_ID_HERE` with your Google OAuth client ID.
- `YOUR_SPREADSHEET_ID_HERE` with your Google Spreadsheet ID.

### 6. Deploy & Test

- Push to GitHub and trigger Netlify deployment.
- Use the Netlify URL to access the app.
- Authorize the app via Google OAuth.
- Begin tracking workouts, syncing, and using the dashboard and AI features.

## User Guide

### Authorizing Access

- Click the **Authorize** button on the top right of any page.
- Log in with your Google account and grant permissions.
- Once authorized, syncing and dashboard features unlock.

### Tracking Workouts

- Select your user profile (Harjas or Darvesh).
- Pick a workout day on the home screen.
- Mark sets as completed, enter weight and reps.
- Add notes in the provided text area.
- Use the global sync button (bottom right green button) to upload data.

### Using the Dashboard

- Navigate to the Dashboard via sidebar.
- Filter data by date range, body part, and exercise.
- View your best lifts, 1RM estimates, and progress charts.
- Click **AI Analysis** for smart insights based on your data.
- Use **Clear Data** to wipe the workout log in your sheet.

### AI Chat Bot

- Click the blue chat bubble button to open AI assistant.
- Ask any fitness-related questions.
- Receive detailed, expert advice in real-time.

## Troubleshooting

- **Authorization Errors:** Ensure your Google Cloud OAuth client ID includes your actual URL as an allowed origin.
- **Sync Not Working:** Verify you have authorized access and your Spreadsheet ID is correct.
- **Data Not Showing in Dashboard:** Refresh dashboard data or check the date filters.
- **AI Chat Not Responding:** Check that your Netlify function is deployed and your Gemini API key is set properly.
- **Environment Variable:** Confirm `GEMINI_API_KEY` is set in Netlify Site Settings (Environment variables).

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript ES6, Chart.js
- **Authentication:** Google OAuth 2.0 Javascript client library
- **Backend:** Netlify Serverless Functions (Lambda)
- **AI API:** Google Gemini Model (`gemini-1.5-flash-latest`)
- **Data Storage:** Google Sheets API v4

## Credits

Developed by [Your Name or Organization].

Leveraging Google APIs and state-of-the-art AI for personal fitness tracking and coaching.

If you need further support or customization, feel free to reach out!
