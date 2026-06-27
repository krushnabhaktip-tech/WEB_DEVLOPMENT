// Data Management Arrays
const exerciseBank = [
    { name: "Jumping Jacks", emoji: "🤸" },
    { name: "Squats Challenge", emoji: "🏋️" },
    { name: "Push-Ups Mode", emoji: "💪" }
];

// SEPARated Day Trackers from LocalStorage
let stepTrackerDay = parseInt(localStorage.getItem('stepTrackerDayIndex')) || 3;
let workoutRoutineDay = parseInt(localStorage.getItem('workoutRoutineDayIndex')) || 3;

let selectedCategory = "Strength";
let activeExerciseIndex = 0;
let routineTimer = null;
let routineSecondsLeft = 30;
let isRoutineTimerRunning = false;

let stepCount = 0;
let isTracking = false;
let trackInterval = null;
let uploadedAvatarData = null;
let musicStarted = false;
let isMuted = false;

// Background Sound System
function startBackgroundMusic() {
    if (!musicStarted) {
        const audio = document.getElementById('bg-audio');
        audio.volume = 0.4;
        audio.play().then(() => {
            musicStarted = true;
        }).catch(err => console.log("Audio waiting for touch initialization"));
    }
}

function toggleMute() {
    const audio = document.getElementById('bg-audio');
    const muteBtn = document.getElementById('quick-mute-btn');
    isMuted = !isMuted;
    audio.muted = isMuted;
    
    if (isMuted) {
        muteBtn.innerText = "🔇 Audio Status: Muted";
        muteBtn.style.background = "linear-gradient(135deg, #e74c3c, #c0392b)";
    } else {
        muteBtn.innerText = "🔊 Audio Status: Playing";
        muteBtn.style.background = "linear-gradient(135deg, #2ecc71, #27ae60)";
    }
}

function adjustVolume(val) {
    const audio = document.getElementById('bg-audio');
    audio.volume = val;
}

function startApp() {
    document.getElementById('welcome-screen').style.display = 'none';
    
    // Check if user already exists
    const savedProfile = localStorage.getItem('localWorkoutProfile');
    if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        document.getElementById('view-avatar-div').style.backgroundImage = `url('${profile.avatarSrc}')`;
        document.getElementById('exercise-screen').style.display = 'block';
    } else {
        document.getElementById('profile-title-text').innerText = "📝 Create Profile";
        document.getElementById('profile-cancel-btn').style.display = 'none';
        document.getElementById('profile-setup-card').style.display = 'block';
    }
    startBackgroundMusic();
}

// Editable Profile Mode Controllers
function goToProfileEdit() {
    const savedProfile = localStorage.getItem('localWorkoutProfile');
    if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        document.getElementById('user-name').value = profile.name;
        document.getElementById('user-age').value = profile.age;
        document.getElementById('user-email').value = profile.email;
    }
    document.getElementById('profile-title-text').innerText = "✏️ Edit Profile Settings";
    document.getElementById('profile-cancel-btn').style.display = 'block';
    document.getElementById('exercise-screen').style.display = 'none';
    document.getElementById('profile-setup-card').style.display = 'block';
}

function cancelProfileEdit() {
    document.getElementById('profile-setup-card').style.display = 'none';
    document.getElementById('exercise-screen').style.display = 'block';
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
    const email = document.getElementById('user-email').value.trim();

    if (!name || !age || !email) {
        alert("Please fill out all setup questions completely!");
        return;
    }

    const avatarType = document.querySelector('input[name="avatar-type"]:checked').value;
    let avatarSrc = avatarType === 'anime' ? document.getElementById('anime-dp-select').value : (uploadedAvatarData || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150");

    const profileData = { name, age, email, avatarSrc };
    localStorage.setItem('localWorkoutProfile', JSON.stringify(profileData));

    document.getElementById('view-avatar-div').style.backgroundImage = `url('${avatarSrc}')`;
    document.getElementById('profile-setup-card').style.display = 'none';
    document.getElementById('exercise-screen').style.display = 'block';
}

// Separate Walking Tracking Section
function openStepTracker() {
    document.getElementById('exercise-options-panel').style.display = 'none';
    document.getElementById('step-day-title').innerText = `Day ${stepTrackerDay}`;
    document.getElementById('step-tracker-panel').style.display = 'block';
}

function closeStepTracker() {
    if (isTracking) toggleStepTracking();
    document.getElementById('step-tracker-panel').style.display = 'none';
    document.getElementById('exercise-options-panel').style.display = 'flex';
}

function toggleStepTracking() {
    isTracking = !isTracking;
    const btn = document.getElementById('start-track-btn');
    if (isTracking) {
        btn.innerText = "Tracking... 🔴";
        btn.style.background = "linear-gradient(135deg, #e74c3c, #c0392b)";
        trackInterval = setInterval(() => {
            stepCount++;
            document.getElementById('live-steps').innerText = stepCount;
            document.getElementById('live-distance').innerText = (stepCount * 0.0007).toFixed(2);
            if (stepCount >= 10) {
                document.getElementById('save-day-btn').style.style.display = 'block';
            }
        }, 800);
    } else {
        btn.innerText = "Start Tracking 🟢";
        btn.style.background = "linear-gradient(135deg, #2ecc71, #27ae60)";
        clearInterval(trackInterval);
    }
}

function saveAndNextStepDay() {
    alert(`Day ${stepTrackerDay} Complete! Moving to next Step Tracking Day!`);
    clearInterval(trackInterval);
    isTracking = false;
    stepCount = 0;
    stepTrackerDay++;
    localStorage.setItem('stepTrackerDayIndex', stepTrackerDay);
    
    document.getElementById('live-steps').innerText = "0";
    document.getElementById('live-distance').innerText = "0.00";
    document.getElementById('save-day-btn').style.display = 'none';
    closeStepTracker();
}

// Separate Workout Routine Panel Section
function openWorkoutRoutine(category) {
    selectedCategory = category;
    activeExerciseIndex = 0;
    document.getElementById('exercise-options-panel').style.display = 'none';
    document.getElementById('workout-routine-panel').style.display = 'block';
    loadRoutineExercise();
}

function loadRoutineExercise() {
    document.getElementById('routine-day-title').innerText = `Day ${workoutRoutineDay} - ${selectedCategory}`;
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

function toggleRoutineTimer() {
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
                navigateExercise(1);
            }
        }, 1000);
    }
}

function navigateExercise(dir) {
    clearInterval(routineTimer);
    isRoutineTimerRunning = false;
    document.getElementById('media-play-pause-btn').innerText = "PLAY ▶️";
    
    activeExerciseIndex += dir;
    if (activeExerciseIndex >= exerciseBank.length) {
        alert(`Day ${workoutRoutineDay} Workouts finished successfully!`);
        workoutRoutineDay++;
        localStorage.setItem('workoutRoutineDayIndex', workoutRoutineDay);
        closeWorkoutRoutine();
    } else if (activeExerciseIndex < 0) {
        activeExerciseIndex = 0;
    } else {
        loadRoutineExercise();
    }
}

function closeWorkoutRoutine() {
    clearInterval(routineTimer);
    isRoutineTimerRunning = false;
    document.getElementById('workout-routine-panel').style.display = 'none';
    document.getElementById('exercise-options-panel').style.display = 'flex';
}

function toggleSettingsPanel() {
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

function toggleTheme() {
    document.body.classList.toggle('light-mode');
}