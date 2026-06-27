import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

let app, db;
try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
} catch (e) { console.log("Offline Mode Active"); }

// 📋 10 Premium Exercise Bank with Different Emojis
const exerciseBank = [
    { name: "Jumping Jacks", emoji: "🤸" },
    { name: "Squats Full Challenge", emoji: "🏋️" },
    { name: "Push-Ups Mode", emoji: "💪" },
    { name: "Adductor Stretch", emoji: "🧘" },
    { name: "Mountain Climbers", emoji: "🧗" },
    { name: "Burpees Fat Burn", emoji: "⚡" },
    { name: "Plank Hold", emoji: "🧎" },
    { name: "Lunges Left/Right", emoji: "🏃" },
    { name: "High Knees Sprint", emoji: "🏃‍♀️" },
    { name: "Crunches Core Core", emoji: "🧘‍♂️" }
];

let currentDayIndex = parseInt(localStorage.getItem('userWorkoutDayIndex')) || 0;
let selectedCategory = "Strength";
let activeExerciseIndex = 0;
let routineTimer = null;
let routineSecondsLeft = 30;
let isRoutineTimerRunning = false;

// Tracker state
let stepCount = 0;
let isTracking = false;
let restTime = 30;
let uploadedAvatarData = null;
let isMuted = false;
let previousVolume = 0.5;
let isSettingsMode = false;

window.onload = function() {
    loadProfileData();
};

function startApp() {
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('profile-setup-card').style.display = 'block';
}

function switchAvatarView() {
    const avatarType = document.querySelector('input[name="avatar-type"]:checked').value;
    document.getElementById('avatar-input-container').style.display = avatarType === 'upload' ? 'block' : 'none';
    document.getElementById('anime-select-container').style.display = avatarType === 'anime' ? 'block' : 'none';
}

function previewUploadedFile(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) { uploadedAvatarData = e.target.result; };
        reader.readAsDataURL(file);
    }
}

function validateAndSaveProfile() {
    const name = document.getElementById('user-name').value.trim();
    const age = document.getElementById('user-age').value.trim();
    const gender = document.getElementById('user-gender').value;
    const email = document.getElementById('user-email').value.trim();
    const phone = document.getElementById('user-phone').value.trim();
    const address = document.getElementById('user-address').value.trim();

    if (!name || !age || !email || !phone || !address) {
        alert("Please completely fill out the input sections.");
        return;
    }

    const avatarType = document.querySelector('input[name="avatar-type"]:checked').value;
    let avatarSrc = avatarType === 'anime' ? document.getElementById('anime-dp-select').value : (uploadedAvatarData || "images/naruto.png");

    const profileData = { name, age, gender, email, phone, address, avatarSrc };
    localStorage.setItem('localWorkoutProfile', JSON.stringify(profileData));

    applyProfileToDashboard(profileData);
    document.getElementById('profile-setup-card').style.display = 'none';
    document.getElementById('exercise-screen').style.display = 'block';
    startBackgroundMusic();
}

function applyProfileToDashboard(data) {
    document.getElementById('view-avatar-div').style.backgroundImage = `url('${data.avatarSrc}')`;
}

function startBackgroundMusic() {
    const audio = document.getElementById('bg-audio');
    audio.play().catch(() => {});
}

// 🏋️🧘 --- 30-Day Hard Workout Progression Module ---
function openWorkoutRoutine(category) {
    selectedCategory = category;
    activeExerciseIndex = 0;
    
    document.getElementById('exercise-options-panel').style.display = 'none';
    document.getElementById('workout-routine-panel').style.display = 'block';
    
    loadCurrentDayExercise();
}

function loadCurrentDayExercise() {
    let dayNumber = currentDayIndex + 1;
    document.getElementById('routine-day-title').innerText = `Day ${dayNumber} - ${selectedCategory}`;

    // Check if 7th Day (Rest Day)
    if (dayNumber % 7 === 0) {
        document.getElementById('routine-day-sub').innerText = "Rest Mode";
        document.getElementById('routine-exercise-name').innerText = "🥳 Today is Relax & Break Day!";
        document.getElementById('routine-emoji').innerText = "😴";
        document.getElementById('routine-timer-display').innerText = "OFF";
        document.getElementById('media-play-pause-btn').innerText = "Complete Rest Day ✅";
        clearInterval(routineTimer);
        isRoutineTimerRunning = false;
        return;
    }

    // Dynamic Difficulty Logic: 30s for Week 1, 45s for Week 2, 60s for Week 3...
    let weekNumber = Math.floor(currentDayIndex / 7) + 1;
    routineSecondsLeft = 20 + (weekNumber * 10); // Dhire dhire hard standard time limit

    document.getElementById('routine-day-sub').innerText = `Exercise ${activeExerciseIndex + 1} of 10`;
    
    let currentEx = exerciseBank[activeExerciseIndex];
    document.getElementById('routine-exercise-name').innerText = currentEx.name;
    document.getElementById('routine-emoji').innerText = currentEx.emoji;
    
    updateRoutineTimerUI();
    pauseRoutineTimer();
}

function updateRoutineTimerUI() {
    let mins = Math.floor(routineSecondsLeft / 60).toString().padStart(2, '0');
    let secs = (routineSecondsLeft % 60).toString().padStart(2, '0');
    document.getElementById('routine-timer-display').innerText = `${mins}:${secs}`;
}

function toggleRoutineTimer() {
    let dayNumber = currentDayIndex + 1;
    if (dayNumber % 7 === 0) {
        // Rest Day finish bypass click
        finishDayWorkoutPlan();
        return;
    }

    if (isRoutineTimerRunning) {
        pauseRoutineTimer();
    } else {
        startRoutineTimer();
    }
}

function startRoutineTimer() {
    isRoutineTimerRunning = true;
    document.getElementById('media-play-pause-btn').innerText = "PAUSE ⏸️";
    
    routineTimer = setInterval(() => {
        if (routineSecondsLeft > 0) {
            routineSecondsLeft--;
            updateRoutineTimerUI();
        } else {
            clearInterval(routineTimer);
            isRoutineTimerRunning = false;
            // Next Auto exercise
            navigateExercise(1);
        }
    }, 1000);
}

function pauseRoutineTimer() {
    clearInterval(routineTimer);
    isRoutineTimerRunning = false;
    document.getElementById('media-play-pause-btn').innerText = "PLAY ▶️";
}

function navigateExercise(direction) {
    let dayNumber = currentDayIndex + 1;
    if (dayNumber % 7 === 0) return; // No entries on rest day

    activeExerciseIndex += direction;
    
    if (activeExerciseIndex >= 10) {
        finishDayWorkoutPlan();
    } else if (activeExerciseIndex < 0) {
        activeExerciseIndex = 0;
    } else {
        loadCurrentDayExercise();
    }
}

function finishDayWorkoutPlan() {
    alert(`🎉 Magnificent! You successfully finished today's Routine Workout Session!`);
    currentDayIndex++;
    localStorage.setItem('userWorkoutDayIndex', currentDayIndex);
    closeWorkoutRoutine();
}

function closeWorkoutRoutine() {
    pauseRoutineTimer();
    document.getElementById('workout-routine-panel').style.display = 'none';
    document.getElementById('exercise-options-panel').style.display = 'flex';
}

// 🏃 Existing Tracker Components
function openStepTracker() {
    document.getElementById('exercise-options-panel').style.display = 'none';
    document.getElementById('step-tracker-panel').style.display = 'block';
    let dayNumber = currentDayIndex + 1;
    document.getElementById('current-day-title').innerText = `Day ${dayNumber}`;
}
function closeStepTracker() {
    document.getElementById('step-tracker-panel').style.display = 'none';
    document.getElementById('exercise-options-panel').style.display = 'flex';
}

// Settings Components
function toggleSettingsPanel() {
    isSettingsMode = !isSettingsMode;
    document.getElementById('exercise-options-panel').style.display = isSettingsMode ? 'none' : 'flex';
    document.getElementById('settings-panel').style.display = isSettingsMode ? 'block' : 'none';
}
function changeRestTime(amount) { restTime = Math.max(0, restTime + amount); document.getElementById('rest-display').innerText = restTime + "s"; }
function toggleTheme() { document.body.classList.toggle('light-mode'); }
function toggleMute() { isMuted = !isMuted; document.getElementById('bg-audio').muted = isMuted; document.getElementById('mute-btn').innerText = isMuted ? "🔇" : "🔊"; }
function adjustVolume(val) { document.getElementById('bg-audio').volume = val; }
function resetProfile() { localStorage.clear(); location.reload(); }
function goToProfile() { document.getElementById('exercise-screen').style.display = 'none'; document.getElementById('profile-setup-card').style.display = 'block'; }
function backToDashboard() { document.getElementById('profile-setup-card').style.display = 'none'; document.getElementById('exercise-screen').style.display = 'block'; }
async function loadProfileData() {
    const localData = localStorage.getItem('localWorkoutProfile');
    if (localData) { applyProfileToDashboard(JSON.parse(localData)); }
}

// Global scope mapping window bindings
window.startApp = startApp;
window.switchAvatarView = switchAvatarView;
window.previewUploadedFile = previewUploadedFile;
window.validateAndSaveProfile = validateAndSaveProfile;
window.toggleSettingsPanel = toggleSettingsPanel;
window.changeRestTime = changeRestTime;
window.adjustVolume = adjustVolume;
window.toggleMute = toggleMute;
window.toggleTheme = toggleTheme;
window.resetProfile = resetProfile;
window.goToProfile = goToProfile;
window.backToDashboard = backToDashboard;
window.openStepTracker = openStepTracker;
window.closeStepTracker = closeStepTracker;

window.openWorkoutRoutine = openWorkoutRoutine;
window.closeWorkoutRoutine = closeWorkoutRoutine;
window.toggleRoutineTimer = toggleRoutineTimer;
window.navigateExercise = navigateExercise;