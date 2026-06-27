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
    hasProfileRegistered = false;
    document.getElementById('bg-audio').pause();
    document.getElementById('settings-panel').style.display = 'none';
    document.getElementById('exercise-options-panel').style.display = 'flex';
    document.getElementById('dashboard-title').innerText = "Exercise Dashboard";
    document.getElementById('exercise-screen').style.display = 'none';
    document.getElementById('welcome-screen').style.display = 'flex';
}

/* Clicking on the avatar launches profile configuration screen */
function goToProfile() {
    document.getElementById('profile-card-title').innerText = "Update Profile Details";
    document.getElementById('save-profile-btn').innerText = "Apply Updates 🔄";
    document.getElementById('back-to-dash-btn').style.display = 'block'; // Show cancel button
    
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

// 🏃 લાઈવ સ્ટેપ કાઉન્ટર લોજિક (ફાઈલની છેલ્લે ઉમેરવો)
let stepCount = 0;
let isTracking = false;
let lastAcceleration = { x: null, y: null, z: null };
let shakeThreshold = 12; 

function openStepTracker() {
    document.getElementById('exercise-options-panel').style.display = 'none';
    document.getElementById('settings-panel').style.display = 'none';
    document.getElementById('step-tracker-panel').style.display = 'block';
    document.getElementById('dashboard-title').innerText = "Running Tracker 🏁";
}

function closeStepTracker() {
    stopStepTracking();
    document.getElementById('step-tracker-panel').style.display = 'none';
    document.getElementById('exercise-options-panel').style.display = 'flex';
    document.getElementById('dashboard-title').innerText = "Exercise Dashboard";
}

function toggleStepTracking() {
    const btn = document.getElementById('start-track-btn');
    if (!isTracking) {
        startStepTracking();
        btn.innerText = "Stop Tracking 🛑";
        btn.style.backgroundColor = "#e74c3c";
    } else {
        stopStepTracking();
        btn.innerText = "Start Tracking 🟢";
        btn.style.backgroundColor = "#2ecc71";
    }
}

function startStepTracking() {
    isTracking = true;
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('devicemotion', handleMotion, true);
                } else {
                    alert("Permission denied! Clicking on the big step number will also count steps.");
                }
            }).catch(console.error);
    } else {
        window.addEventListener('devicemotion', handleMotion, true);
    }

    // લેપટોપમાં ટેસ્ટ કરવા માટે નંબર પર ક્લિક કરશો તો પણ સ્ટેપ વધશે
    document.getElementById('live-steps').onclick = function() {
        if(isTracking) countOneStep();
    };
}

function stopStepTracking() {
    isTracking = false;
    window.removeEventListener('devicemotion', handleMotion, true);
}

function handleMotion(event) {
    let acc = event.accelerationIncludingGravity;
    if (!acc.x || !acc.y || !acc.z) return;

    if (lastAcceleration.x !== null) {
        let deltaX = Math.abs(lastAcceleration.x - acc.x);
        let deltaY = Math.abs(lastAcceleration.y - acc.y);
        let deltaZ = Math.abs(lastAcceleration.z - acc.z);

        if ((deltaX > shakeThreshold && deltaY > shakeThreshold) || (deltaY > shakeThreshold && deltaZ > shakeThreshold)) {
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

    let goal = parseInt(document.getElementById('step-goal').value) || 5000;
    if (stepCount === goal) {
        alert("🎉 Congratulations! You reached your goal! 🥳🏆");
    }
}

// આ લાઈનો ખાસ જરૂરી છે જેથી HTML બટન આ ફંક્શનને શોધી શકે
window.openStepTracker = openStepTracker;
window.closeStepTracker = closeStepTracker;
window.toggleStepTracking = toggleStepTracking;

let stepCount = 0;
let isTracking = false;
let lastAcceleration = { x: null, y: null, z: null };
let shakeThreshold = 7; // આપણે સેન્સિટિવિટી થોડી વધારી દીધી (7 કરી દીધી) જેથી હળવા ઝટકા પણ પકડાય

function openStepTracker() {
    document.getElementById('exercise-options-panel').style.display = 'none';
    document.getElementById('settings-panel').style.display = 'none';
    document.getElementById('step-tracker-panel').style.display = 'block';
    document.getElementById('dashboard-title').innerText = "Running Tracker 🏁";
}

function closeStepTracker() {
    stopStepTracking();
    document.getElementById('step-tracker-panel').style.display = 'none';
    document.getElementById('exercise-options-panel').style.display = 'flex';
    document.getElementById('dashboard-title').innerText = "Exercise Dashboard";
}

function toggleStepTracking() {
    const btn = document.getElementById('start-track-btn');
    if (!isTracking) {
        startStepTracking();
        btn.innerText = "Stop Tracking 🛑";
        btn.style.backgroundColor = "#e74c3c";
    } else {
        stopStepTracking();
        btn.innerText = "Start Tracking 🟢";
        btn.style.backgroundColor = "#2ecc71";
    }
}

function startStepTracking() {
    isTracking = true;
    
    // આ બંને ઇવેન્ટ્સ (devicemotion અને deviceorientation) એડ કરી દઈએ જેથી એન્ડ્રોઇડ ૧૦૦% સેન્સર ડેટા આપે
    if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', handleMotion);
    }
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', handleOrientation);
    }

    // લેપટોપ કે મેન્યુઅલ ટેસ્ટિંગ માટે ટૅપ ઓપ્શન
    document.getElementById('live-steps').onclick = function() {
        if(isTracking) countOneStep();
    };
}

function stopStepTracking() {
    isTracking = false;
    window.removeEventListener('devicemotion', handleMotion);
    window.removeEventListener('deviceorientation', handleOrientation);
}

// એન્ડ્રોઇડ ક્રોમ માટે વધારે સેન્સિટિવ મોશન હેન્ડલર
function handleMotion(event) {
    if (!isTracking) return;

    // અહિયાં આપણે acceleration અથવા accelerationIncludingGravity બંનેમાંથી જે મળે તે ડેટા લઈશું
    let acc = event.acceleration || event.accelerationIncludingGravity;
    if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

    if (lastAcceleration.x !== null) {
        let deltaX = Math.abs(lastAcceleration.x - acc.x);
        let deltaY = Math.abs(lastAcceleration.y - acc.y);
        let deltaZ = Math.abs(lastAcceleration.z - acc.z);

        // જો કોઈપણ બે ડાયરેક્શનમાં મુવમેન્ટ થ્રેશોલ્ડ કરતા વધુ હોય તો સ્ટેપ ગણો
        if ((deltaX > shakeThreshold && deltaY > shakeThreshold) || 
            (deltaY > shakeThreshold && deltaZ > shakeThreshold) ||
            (deltaX > shakeThreshold && deltaZ > shakeThreshold)) {
            countOneStep();
        }
    }
    lastAcceleration = { x: acc.x, y: acc.y, z: acc.z };
}

// બેકઅપ હેન્ડલર: જો મોશન કામ ન કરે તો ફોન રોટેટ (ટિલ્ટ) થાય ત્યારે પણ આ પકડી લેશે
function handleOrientation(event) {
    if (!isTracking) return;
    // હળવા રોટેશન ફેરફારથી પણ સ્ટેપ સિમ્યુલેટ થશે
    let totalRotation = Math.abs(event.alpha || 0) + Math.abs(event.beta || 0) + Math.abs(event.gamma || 0);
    if (totalRotation % 15 === 0) { // દર ૧૫ ડિગ્રીના ચેન્જ પર (વર્કઅરાઉન્ડ)
        // countOneStep(); // આ લાઈન કમેન્ટ રાખી છે, જો જરૂર પડે તો જ ખોલવી
    }
}

function countOneStep() {
    stepCount++;
    document.getElementById('live-steps').innerText = stepCount;
    let distance = stepCount * 0.00075;
    document.getElementById('live-distance').innerText = distance.toFixed(2);

    let goal = parseInt(document.getElementById('step-goal').value) || 5000;
    if (stepCount === goal) {
        alert("🎉 Congratulations! You reached your goal! 🥳🏆");
    }
}

// ગ્લોબલ વિન્ડો બાઈન્ડિંગ્સ
window.openStepTracker = openStepTracker;
window.closeStepTracker = closeStepTracker;
window.toggleStepTracking = toggleStepTracking;