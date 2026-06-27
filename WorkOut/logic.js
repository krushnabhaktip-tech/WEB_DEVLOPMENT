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
    console.log("Offline UI view activated.");
}

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
    if (avatarType === 'upload') {
        document.getElementById('avatar-input-container').style.display = 'block';
        document.getElementById('anime-select-container').style.display = 'none';
    } else {
        document.getElementById('avatar-input-container').style.display = 'none';
        document.getElementById('anime-select-container').style.display = 'block'; // અહીં મેં 'style.block' લખી દીધું હતું, હવે ફિક્સ થઈ ગયું!
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
        alert("Please complete the profile forms setup.");
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

/* Toggle settings panel only mode */
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
    if (category === 'Cardio') document.getElementById('btn-cardio').style.borderColor = 'var(--btn-primary)';
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
    isSettingsMode = false;
    document.getElementById('bg-audio').pause();
    document.getElementById('settings-panel').style.display = 'none';
    document.getElementById('exercise-options-panel').style.display = 'flex';
    document.getElementById('dashboard-title').innerText = "Exercise Dashboard";
    document.getElementById('exercise-screen').style.display = 'none';
    document.getElementById('welcome-screen').style.display = 'flex';
}

function goToProfile() {
    document.getElementById('exercise-screen').style.display = 'none';
    document.getElementById('profile-setup-card').style.display = 'block';
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
    }
}

// Global mapping scope setup
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