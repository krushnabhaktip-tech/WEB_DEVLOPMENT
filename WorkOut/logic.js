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
    console.log("Firebase setup skipped or generic layout mode active.");
}

let restTime = 30;
let uploadedAvatarData = null;

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
        alert("Please fill in all the profile details correctly.");
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

    if (db && firebaseConfig.apiKey !== "YOUR_API_KEY") {
        try {
            await setDoc(doc(db, "users", "workout_profile"), profileData);
        } catch (error) {
            console.error("Firebase save skipped, using offline flow.");
        }
    }

    applyProfileToDashboard(profileData);
    document.getElementById('profile-setup-card').style.display = 'none';
    document.getElementById('exercise-screen').style.display = 'block';
    startBackgroundMusic();
}

function applyProfileToDashboard(data) {
    document.getElementById('view-avatar-div').style.backgroundImage = `url('${data.avatarSrc}')`;
}

async function loadProfileData() {
    const localData = localStorage.getItem('localWorkoutProfile');
    if (localData) {
        const data = JSON.parse(localData);
        fillFormFields(data);
        applyProfileToDashboard(data);
    }

    if (db && firebaseConfig.apiKey !== "YOUR_API_KEY") {
        try {
            const docRef = doc(db, "users", "workout_profile");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                fillFormFields(data);
                applyProfileToDashboard(data);
            }
        } catch (error) {
            console.log("Offline mode sync active.");
        }
    }
}

function fillFormFields(data) {
    document.getElementById('user-name').value = data.name || '';
    document.getElementById('user-age').value = data.age || '';
    document.getElementById('user-gender').value = data.gender || 'Male';
    document.getElementById('user-email').value = data.email || '';
    document.getElementById('user-phone').value = data.phone || '';
    document.getElementById('user-address').value = data.address || '';
    
    if (data.avatarType === 'anime') {
        document.querySelectorAll('input[name="avatar-type"]')[1].checked = true;
        document.getElementById('anime-dp-select').value = data.avatarSrc;
        switchAvatarView();
    } else {
        document.querySelectorAll('input[name="avatar-type"]')[0].checked = true;
        uploadedAvatarData = data.avatarSrc;
        switchAvatarView();
    }
}

function toggleSettingsPanel() {
    const panel = document.getElementById('settings-panel');
    panel.style.display = (panel.style.display === 'none' || panel.style.display === '') ? 'block' : 'none';
}

function selectExerciseCategory(category) {
    document.querySelectorAll('.exercise-choice-btn').forEach(btn => btn.style.borderColor = 'var(--border-color)');
    if (category === 'Cardio') document.getElementById('btn-cardio').style.borderColor = 'var(--btn-primary)';
    if (category === 'Strength') document.getElementById('btn-strength').style.borderColor = 'var(--btn-primary)';
    if (category === 'Yoga') document.getElementById('btn-yoga').style.borderColor = 'var(--btn-primary)';
    alert(`${category} Session Initialized! Ready, Set, Go!`);
}

function changeRestTime(amount) {
    restTime = Math.max(0, restTime + amount);
    document.getElementById('rest-display').innerText = restTime + "s";
}

function startBackgroundMusic() {
    const audio = document.getElementById('bg-audio');
    audio.play().catch(() => {});
}

function adjustVolume(val) {
    const audio = document.getElementById('bg-audio');
    audio.volume = val;
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
}

function resetProfile() {
    localStorage.removeItem('localWorkoutProfile');
    uploadedAvatarData = null;
    document.getElementById('bg-audio').pause();
    document.getElementById('settings-panel').style.display = 'none';
    document.getElementById('exercise-screen').style.display = 'none';
    document.getElementById('welcome-screen').style.display = 'block';
}

function goToProfile() {
    document.getElementById('exercise-screen').style.display = 'none';
    document.getElementById('profile-setup-card').style.display = 'block';
}

window.startApp = startApp;
window.switchAvatarView = switchAvatarView;
window.previewUploadedFile = previewUploadedFile;
window.validateAndSaveProfile = validateAndSaveProfile;
window.toggleSettingsPanel = toggleSettingsPanel;
window.selectExerciseCategory = selectExerciseCategory;
window.changeRestTime = changeRestTime;
window.adjustVolume = adjustVolume;
window.toggleTheme = toggleTheme;
window.resetProfile = resetProfile;
window.goToProfile = goToProfile;