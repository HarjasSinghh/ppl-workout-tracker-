# PPL Workout Tracker - Google Sheets Setup

## Step 1: Create Google Sheets Document
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet named "PPL Workout Tracker"
3. Create sheets for: "Day1-Push", "Day2-Pull", "Day3-Legs", "Day4-Push", "Day5-Pull", "Day6-Arms", "Progress"

## Step 2: Enable Google Sheets API
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google Sheets API
4. Create credentials (API Key)
5. Add your domain to authorized domains

## Step 3: Update JavaScript
Replace the placeholder in `syncToGoogleSheets()` function with your API key and spreadsheet ID.

## Step 4: Deploy to GitHub Pages
1. Create a new repository on GitHub
2. Upload all files (index.html, styles.css, script.js, README.md)
3. Go to repository Settings > Pages
4. Select "Deploy from a branch" > "main"
5. Your site will be available at `https://yourusername.github.io/repository-name`

## Features
- ✅ Complete workout tracking with sets, reps, and weights
- ✅ Rest timer between sets
- ✅ Exercise alternatives dropdown
- ✅ Progress visualization
- ✅ Workout notes
- ✅ Local storage backup
- ✅ Mobile-responsive design
- ✅ Real-time Google Sheets sync (when configured)
