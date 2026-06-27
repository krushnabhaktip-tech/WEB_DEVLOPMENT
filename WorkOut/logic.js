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
} catch (e) {
    console.log("Offline view layout enabled.");
}

// 📅 30 Days Workout Plan Settings
const workoutPlan = [
    10, 10, 10, 10, 10, 10, 0,  // Week 1 (Day 1-7, Day 7 is Break)
    15, 15, 15, 15, 15, 15, 0,  // Week 2 (Day 8-14)
    20, 20, 20, 20, 20, 20, 0,  // Week 3 (Day 15-21)
    25, 25, 25, 25, 25, 25, 0,  // Week 4 (Day 22-28)
    30, 35                      // Day 29-30
];

let currentDayIndex = parseInt(localStorage.getItem('userWorkoutDayIndex')) || 0;
let stepCount = 0;
let isTracking = false;
let lastAcceleration = { x: null, y: null, z: null };
let shakeThreshold = 7; // સેન્સિટિવિટી લેવલ ફોર ફોન મોશન

let restTime = 30;
let uploadedAvatarData = null;
let isMuted = false;
let previousVolume = 0.5;
let isSettingsMode = false;
let hasProfileRegistered = false;

window.onload = function() {
    loadProfileData();
};

function startApp() {
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('profile-setup-card').style.display = 'block';
}

function switchAvatarView() {
    const avatarType = document.querySelector('input[name="avatar-type"]:checked').value;
    if (avatarType === 'upload') {
        document.getElementById('avatar-input-container').style.display = 'block';
        document.getElementById('anime-select-container').style.display = 'none';
    } else {
        document.getElementById('avatar-input-container').style.display = 'none';
        document.getElementById('anime-select-container').style.display = 'block';
    }
}

function previewUploadedFile(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedAvatarData = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

async function validateAndSaveProfile() {
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
    let avatarSrc = "";

    if (avatarType === 'anime') {
        avatarSrc = document.getElementById('anime-dp-select').value;
    } else {
        avatarSrc = uploadedAvatarData || "images/naruto.png";
    }

    const profileData = { name, age, gender, email, phone, address, avatarSrc, avatarType };
    localStorage.setItem('localWorkoutProfile', JSON.stringify(profileData));

    applyProfileToDashboard(profileData);
    hasProfileRegistered = true;

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

function adjustVolume(val) {
    const audio = document.getElementById('bg-audio');
    audio.volume = val;
    if (val > 0) {
        isMuted = false;
        document.getElementById('mute-btn').innerText = "🔊";
        previousVolume = val;
    } else {
        isMuted = true;
        document.getElementById('mute-btn').innerText = "🔇";
    }
}

function toggleMute() {
    const audio = document.getElementById('bg-audio');
    const volumeSlider = document.getElementById('volume');
    const muteBtn = document.getElementById('mute-btn');

    if (!isMuted) {
        previousVolume = audio.volume;
        audio.volume = 0;
        volumeSlider.value = 0;
        muteBtn.innerText = "🔇";
        isMuted = true;
    } else {
        audio.volume = previousVolume || 0.5;
        volumeSlider.value = previousVolume || 0.5;
        muteBtn.innerText = "🔊";
        isMuted = false;
    }
}

function toggleSettingsPanel() {
    const exercisePanel = document.getElementById('exercise-options-panel');
    const settingsPanel = document.getElementById('settings-panel');
    const titleText = document.getElementById('dashboard-title');

    if (!isSettingsMode) {
        exercisePanel.style.display = 'none';
        settingsPanel.style.display = 'block';
        titleText.innerText = "Settings Configuration";
        isSettingsMode = true;
    } else {
        settingsPanel.style.display = 'none';
        exercisePanel.style.display = 'flex';
        titleText.innerText = "Exercise Dashboard";
        isSettingsMode = false;
    }
}

function selectExerciseCategory(category) {
    document.querySelectorAll('.exercise-choice-btn').forEach(btn => btn.style.borderColor = 'var(--border-color)');
    if (category === 'Strength') document.getElementById('btn-strength').style.borderColor = 'var(--btn-primary)';
    if (category === 'Yoga') document.getElementById('btn-yoga').style.borderColor = 'var(--btn-primary)';
}

function changeRestTime(amount) {
    restTime = Math.max(0, restTime + amount);
    document.getElementById('rest-display').innerText = restTime + "s";
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
}

function resetProfile() {
    localStorage.removeItem('localWorkoutProfile');
    localStorage.removeItem('userWorkoutDayIndex');
    currentDayIndex = 0;
    isSettingsMode = false;
    hasProfileRegistered = false;
    document.getElementById('bg-audio').pause();
    document.getElementById('settings-panel').style.display = 'none';
    document.getElementById('exercise-options-panel').style.display = 'flex';
    document.getElementById('dashboard-title').innerText = "Exercise Dashboard";
    document.getElementById('exercise-screen').style.display = 'none';
    document.getElementById('welcome-screen').style.display = 'flex';
}

function goToProfile() {
    document.getElementById('profile-card-title').innerText = "Update Profile Details";
    document.getElementById('save-profile-btn').innerText = "Apply Updates 🔄";
    document.getElementById('back-to-dash-btn').style.display = 'block';
    
    document.getElementById('exercise-screen').style.display = 'none';
    document.getElementById('profile-setup-card').style.display = 'block';
}

function backToDashboard() {
    document.getElementById('profile-setup-card').style.display = 'none';
    document.getElementById('exercise-screen').style.display = 'block';
}

async function loadProfileData() {
    const localData = localStorage.getItem('localWorkoutProfile');
    if (localData) {
        const data = JSON.parse(localData);
        document.getElementById('user-name').value = data.name || '';
        document.getElementById('user-age').value = data.age || '';
        document.getElementById('user-gender').value = data.gender || 'Male';
        document.getElementById('user-email').value = data.email || '';
        document.getElementById('user-phone').value = data.phone || '';
        document.getElementById('user-address').value = data.address || '';
        applyProfileToDashboard(data);
        hasProfileRegistered = true;
    }
}

// 🏃 --- Step Tracker Core Logic with 1-Month Plan Plan ---
function openStepTracker() {
    document.getElementById('exercise-options-panel').style.display = 'none';
    document.getElementById('settings-panel').style.display = 'none';
    document.getElementById('step-tracker-panel').style.display = 'block';
    updateDayUI();
}

function updateDayUI() {
    let dayNumber = currentDayIndex + 1;
    let target = workoutPlan[currentDayIndex];
    
    document.getElementById('current-day-title').innerText = `Day ${dayNumber}`;
    document.getElementById('dashboard-title').innerText = `Day ${dayNumber} Tracker 🏁`;
    
    if (target === 0) {
        document.getElementById('day-type-text').innerText = "🥳 Today is Rest/Break Day!";
        document.getElementById('start-track-btn').style.display = 'none';
        document.getElementById('save-day-btn').style.display = 'block';
        document.getElementById('save-day-btn').innerText = "Complete Rest Day & Next ➡️";
    } else {
        document.getElementById('day-type-text').innerText = `🎯 Target Goal: ${target} Steps`;
        document.getElementById('start-track-btn').style.display = 'block';
        document.getElementById('save-day-btn').style.display = 'none';
    }
}

function closeStepTracker() {
    stopStepTracking();
    document.getElementById('step-tracker-panel').style.display = 'none';
    document.getElementById('exercise-options-panel').style.display = 'flex';
    document.getElementById('dashboard-title').innerText = "Exercise Dashboard";
}

function toggleStepTracking() {
    const btn = document.getElementById('start-track-btn');
    const emoji = document.getElementById('animation-emoji');

    if (!isTracking) {
        startStepTracking();
        btn.innerText = "Stop Tracking 🛑";
        btn.style.background = "linear-gradient(135deg, #e74c3c, #c0392b)";
        emoji.innerText = "🏃‍♀️💨";
        emoji.classList.add('running-shake');
    } else {
        stopStepTracking();
        btn.innerText = "Start Tracking 🟢";
        btn.style.background = "linear-gradient(135deg, #2ecc71, #27ae60)";
        emoji.innerText = "🧍";
        emoji.classList.remove('running-shake');
    }
}

function startStepTracking() {
    isTracking = true;
    
    if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', handleMotion);
    }

    // 💻 લેપટોપ ટેસ્ટિંગ માટે સેટઅપ (0 નંબર પર ક્લિક કરવાથી સ્ટેપ્સ વધશે!)
    document.getElementById('live-steps').onclick = function() {
        if(isTracking) countOneStep();
    };
}

function stopStepTracking() {
    isTracking = false;
    window.removeEventListener('devicemotion', handleMotion);
}

function handleMotion(event) {
    if (!isTracking) return;

    let acc = event.acceleration || event.accelerationIncludingGravity;
    if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

    if (lastAcceleration.x !== null) {
        let deltaX = Math.abs(lastAcceleration.x - acc.x);
        let deltaY = Math.abs(lastAcceleration.y - acc.y);
        let deltaZ = Math.abs(lastAcceleration.z - acc.z);

        if ((deltaX > shakeThreshold && deltaY > shakeThreshold) || 
            (deltaY > shakeThreshold && deltaZ > shakeThreshold) ||
            (deltaX > shakeThreshold && deltaZ > shakeThreshold)) {
            countOneStep();
        }
    }
    lastAcceleration = { x: acc.x, y: acc.y, z: acc.z };
}

function countOneStep() {
    stepCount++;
    document.getElementById('live-steps').innerText = stepCount;
    let distance = stepCount * 0.00075;
    document.getElementById('live-distance').innerText = distance.toFixed(2);

    let targetGoal = workoutPlan[currentDayIndex];
    if (stepCount >= targetGoal && targetGoal > 0) {
        document.getElementById('save-day-btn').style.display = 'block';
        document.getElementById('save-day-btn').innerText = "Goal Achieved! Save & Next Day 💾";
    }
}

// 💾 બ્રાઉઝર સ્ટોરેજમાં પ્રગતિ સેવ કરવાનું બટન
function saveAndNextDay() {
    let dayNumber = currentDayIndex + 1;
    alert(`🎉 Day ${dayNumber} Progress Saved!`);
    
    currentDayIndex++;
    if (currentDayIndex >= workoutPlan.length) {
        alert("🏆 MAGICAL! You completed the full 1-Month Workout Challenge! 🌟");
        currentDayIndex = 0;
    }
    
    localStorage.setItem('userWorkoutDayIndex', currentDayIndex);
    
    // નવો દિવસ સેટઅપ
    stepCount = 0;
    document.getElementById('live-steps').innerText = "0";
    document.getElementById('live-distance').innerText = "0.00";
    
    stopStepTracking();
    
    const btn = document.getElementById('start-track-btn');
    btn.innerText = "Start Tracking 🟢";
    btn.style.background = "linear-gradient(135deg, #2ecc71, #27ae60)";
    document.getElementById('animation-emoji').innerText = "🧍";
    document.getElementById('animation-emoji').classList.remove('running-shake');

    updateDayUI();
}

// Global scope initialization binding mappings
window.startApp = startApp;
window.switchAvatarView = switchAvatarView;
window.previewUploadedFile = previewUploadedFile;
window.validateAndSaveProfile = validateAndSaveProfile;
window.toggleSettingsPanel = toggleSettingsPanel;
window.selectExerciseCategory = selectExerciseCategory;
window.changeRestTime = changeRestTime;
window.adjustVolume = adjustVolume;
window.toggleMute = toggleMute;
window.toggleTheme = toggleTheme;
window.resetProfile = resetProfile;
window.goToProfile = goToProfile;
window.backToDashboard = backToDashboard;

window.openStepTracker = openStepTracker;
window.closeStepTracker = closeStepTracker;
window.toggleStepTracking = toggleStepTracking;
window.saveAndNextDay = saveAndNextDay;