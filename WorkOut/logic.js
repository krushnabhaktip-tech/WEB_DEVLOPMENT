// 📋 Exercise Setup
const exerciseBank = [
    { name: "Jumping Jacks", emoji: "🤸" },
    { name: "Squats Challenge", emoji: "🏋️" },
    { name: "Push-Ups Mode", emoji: "💪" }
];

let currentDayIndex = parseInt(localStorage.getItem('userWorkoutDayIndex')) || 0;
let selectedCategory = "Strength";
let activeExerciseIndex = 0;
let routineTimer = null;
let routineSecondsLeft = 30;
let isRoutineTimerRunning = false;

let stepCount = 0;
let isTracking = false;
let uploadedAvatarData = null;
let musicStarted = false;

// 🔊 Background Music Engine Trigger on first click
window.startBackgroundMusic = function() {
    if (!musicStarted) {
        const audio = document.getElementById('bg-audio');
        audio.volume = 0.4;
        audio.play().then(() => {
            musicStarted = true;
        }).catch(err => console.log("Music play blocked by browser, waiting for interact"));
    }
}

window.startApp = function() {
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('profile-setup-card').style.display = 'block';
    startBackgroundMusic();
}

window.switchAvatarView = function() {
    const avatarType = document.querySelector('input[name="avatar-type"]:checked').value;
    document.getElementById('avatar-input-container').style.display = avatarType === 'upload' ? 'block' : 'none';
    document.getElementById('anime-select-container').style.display = avatarType === 'anime' ? 'block' : 'none';
}

window.previewUploadedFile = function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) { uploadedAvatarData = e.target.result; };
        reader.readAsDataURL(file);
    }
}

window.validateAndSaveProfile = function() {
    const name = document.getElementById('user-name').value.trim();
    const age = document.getElementById('user-age').value.trim();
    const email = document.getElementById('user-email').value.trim();

    if (!name || !age || !email) {
        alert("Please fill out all the fields!");
        return;
    }

    const avatarType = document.querySelector('input[name="avatar-type"]:checked').value;
    let avatarSrc = avatarType === 'anime' ? document.getElementById('anime-dp-select').value : (uploadedAvatarData || "images/naruto.png");

    const profileData = { name, age, email, avatarSrc };
    localStorage.setItem('localWorkoutProfile', JSON.stringify(profileData));

    document.getElementById('view-avatar-div').style.backgroundImage = `url('${avatarSrc}')`;
    document.getElementById('profile-setup-card').style.display = 'none';
    document.getElementById('exercise-screen').style.display = 'block';
}

// 🏃 Tracker Section
window.openStepTracker = function() {
    document.getElementById('exercise-options-panel').style.display = 'none';
    document.getElementById('step-tracker-panel').style.display = 'block';
}

window.closeStepTracker = function() {
    document.getElementById('step-tracker-panel').style.display = 'none';
    document.getElementById('exercise-options-panel').style.display = 'flex';
}

window.toggleStepTracking = function() {
    isTracking = !isTracking;
    const btn = document.getElementById('start-track-btn');
    if (isTracking) {
        btn.innerText = "Tracking... 🔴";
        btn.style.background = "linear-gradient(135deg, #e74c3c, #c0392b)";
        // Simulate step for debug preview
        this.trackInterval = setInterval(() => {
            stepCount++;
            document.getElementById('live-steps').innerText = stepCount;
            document.getElementById('live-distance').innerText = (stepCount * 0.0007).toFixed(2);
            if (stepCount >= 10) {
                document.getElementById('save-day-btn').style.display = 'block';
            }
        }, 1000);
    } else {
        btn.innerText = "Start Tracking 🟢";
        btn.style.background = "linear-gradient(135deg, #2ecc71, #27ae60)";
        clearInterval(this.trackInterval);
    }
}

window.saveAndNextDay = function() {
    alert("Progress Saved Successfully!");
    clearInterval(this.trackInterval);
    isTracking = false;
    stepCount = 0;
    document.getElementById('live-steps').innerText = "0";
    document.getElementById('live-distance').innerText = "0.00";
    document.getElementById('save-day-btn').style.display = 'none';
    document.getElementById('start-track-btn').innerText = "Start Tracking 🟢";
    document.getElementById('start-track-btn').style.background = "linear-gradient(135deg, #2ecc71, #27ae60)";
    closeStepTracker();
}

// 🏋️ Workout Premium Routines
window.openWorkoutRoutine = function(category) {
    selectedCategory = category;
    activeExerciseIndex = 0;
    document.getElementById('exercise-options-panel').style.display = 'none';
    document.getElementById('workout-routine-panel').style.display = 'block';
    loadRoutineExercise();
}

function loadRoutineExercise() {
    document.getElementById('routine-day-title').innerText = `Day ${currentDayIndex + 1} - ${selectedCategory}`;
    document.getElementById('routine-day-sub').innerText = `Exercise ${activeExerciseIndex + 1} of 3`;
    
    let currentEx = exerciseBank[activeExerciseIndex];
    document.getElementById('routine-exercise-name').innerText = currentEx.name;
    document.getElementById('routine-emoji').innerText = currentEx.emoji;
    routineSecondsLeft = 30;
    updateTimerUI();
}

function updateTimerUI() {
    let mins = Math.floor(routineSecondsLeft / 60).toString().padStart(2, '0');
    let secs = (routineSecondsLeft % 60).toString().padStart(2, '0');
    document.getElementById('routine-timer-display').innerText = `${mins}:${secs}`;
}

window.toggleRoutineTimer = function() {
    if (isRoutineTimerRunning) {
        clearInterval(routineTimer);
        isRoutineTimerRunning = false;
        document.getElementById('media-play-pause-btn').innerText = "PLAY ▶️";
    } else {
        isRoutineTimerRunning = true;
        document.getElementById('media-play-pause-btn').innerText = "PAUSE ⏸️";
        routineTimer = setInterval(() => {
            if (routineSecondsLeft > 0) {
                routineSecondsLeft--;
                updateTimerUI();
            } else {
                clearInterval(routineTimer);
                isRoutineTimerRunning = false;
                window.navigateExercise(1);
            }
        }, 1000);
    }
}

window.navigateExercise = function(dir) {
    clearInterval(routineTimer);
    isRoutineTimerRunning = false;
    document.getElementById('media-play-pause-btn').innerText = "PLAY ▶️";
    
    activeExerciseIndex += dir;
    if (activeExerciseIndex >= exerciseBank.length) {
        alert("Awesome! Today's Workout Routine Completed!");
        currentDayIndex++;
        localStorage.setItem('userWorkoutDayIndex', currentDayIndex);
        window.closeWorkoutRoutine();
    } else if (activeExerciseIndex < 0) {
        activeExerciseIndex = 0;
    } else {
        loadRoutineExercise();
    }
}

window.closeWorkoutRoutine = function() {
    clearInterval(routineTimer);
    isRoutineTimerRunning = false;
    document.getElementById('workout-routine-panel').style.display = 'none';
    document.getElementById('exercise-options-panel').style.display = 'flex';
}

window.toggleSettingsPanel = function() {
    const panel = document.getElementById('settings-panel');
    const options = document.getElementById('exercise-options-panel');
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        options.style.display = 'none';
    } else {
        panel.style.display = 'none';
        options.style.display = 'flex';
    }
}

window.adjustVolume = function(val) {
    document.getElementById('bg-audio').volume = val;
}

window.toggleTheme = function() {
    document.body.classList.toggle('light-mode');
}