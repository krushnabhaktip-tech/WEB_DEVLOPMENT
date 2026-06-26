import { db } from "./firebase.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let restTime = 30;
let isMuted = false;
let preMuteVolume = 5;

let userProfile = {
    name: "", age: "", gender: "", email: "", password: "", phone: "", address: "", avatarType: "upload", avatarValue: ""
};

const bgMusic = document.getElementById('bg-music');
const volumeSlider = document.getElementById('volume');

/* Start button logic */
window.startWorkout = function() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('main-workout-content').style.display = 'block';
    bgMusic.volume = volumeSlider.value / 10;
    bgMusic.play().catch(e => console.log("Audio update notification:", e));
};

window.toggleSettingsMenu = function() {
    document.getElementById('settings-menu').classList.toggle('settings-dropdown-hidden');
};

window.toggleUserInfoMenu = function() {
    document.getElementById('user-info-menu').classList.toggle('info-dropdown-hidden');
};

window.switchAvatarView = function() {
    const type = document.querySelector('input[name="avatar-type"]:checked').value;
    document.getElementById('avatar-input-container').style.display = (type === "upload") ? "block" : "none";
    document.getElementById('anime-select-container').style.display = (type === "anime") ? "block" : "none";
};

/* Form check and save */
window.validateAndSaveProfile = async function() {
    const name = document.getElementById('username').value.trim();
    const age = document.getElementById('user-age').value.trim();
    const gender = document.getElementById('user-gender').value;
    const email = document.getElementById('user-email').value.trim();
    const password = document.getElementById('user-password').value;
    const phone = document.getElementById('user-phone').value.trim();
    const address = document.getElementById('user-address').value.trim();
    const avatarType = document.querySelector('input[name="avatar-type"]:checked').value;

    if (!name || !age || !gender || !email || !password || !phone || !address) {
        alert("Please complete all details (including password) before moving forward! ⚠️");
        return;
    }
    if (password.length < 6) {
        alert("Password must be at least 6 characters long! 🔐");
        return;
    }

    userProfile = { name, age, gender, email, password, phone, address, avatarType };

    if (avatarType === "anime") {
        userProfile.avatarValue = document.getElementById('anime-dp-select').value;
        await sendDataToFirebase();
    } else {
        const fileInput = document.getElementById('user-avatar');
        if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = async function(e) {
                userProfile.avatarValue = e.target.result; 
                await sendDataToFirebase();
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            userProfile.avatarValue = "👤";
            await sendDataToFirebase();
        }
    }
};

/* Sending to cloud firestore */
async function sendDataToFirebase() {
    try {
        const docRef = await addDoc(collection(db, "users"), {
            name: userProfile.name,
            age: userProfile.age,
            gender: userProfile.gender,
            email: userProfile.email,
            phone: userProfile.phone,
            address: userProfile.address,
            avatarType: userProfile.avatarType,
            avatarValue: userProfile.avatarValue,
            createdAt: new Date()
        });
        console.log("Saved: ", docRef.id);
        showExerciseScreen();
    } catch (error) {
        console.error("Error: ", error);
        showExerciseScreen();
    }
}

function showExerciseScreen() {
    document.getElementById('view-name').innerText = userProfile.name;
    document.getElementById('view-age').innerText = userProfile.age;
    document.getElementById('view-gender').innerText = userProfile.gender;
    document.getElementById('view-email').innerText = userProfile.email;
    document.getElementById('view-phone').innerText = userProfile.phone;
    document.getElementById('view-address').innerText = userProfile.address;

    const avatarDiv = document.getElementById('view-avatar-div');
    if (userProfile.avatarType === "anime") {
        avatarDiv.innerHTML = `<span style="font-size: 40px;">${userProfile.avatarValue}</span>`;
    } else {
        avatarDiv.innerHTML = `<img src="${userProfile.avatarValue}" style="width:50px; height:50px; border-radius:50%; object-fit:cover;">`;
    }

    document.getElementById('profile-setup-card').style.display = 'none';
    document.getElementById('exercise-screen').style.display = 'block';
    document.getElementById('app-navigation').style.display = 'flex';
}

window.selectExerciseCategory = function(category) {
    alert(`⚡ Routine Initiated: '${category}' track timeline is synchronizing!`);
};

window.switchTab = function(tabName) {
    console.log(`Tab: ${tabName}`);
};

window.enableProfileEditing = function() {
    toggleUserInfoMenu();
    document.getElementById('profile-setup-card').style.display = 'block';
    document.getElementById('exercise-screen').style.display = 'none';
};

/* Rest counter settings */
window.changeRestTime = function(amount) {
    restTime = Math.max(5, restTime + amount);
    document.getElementById('rest-display').innerText = restTime + "s";
};

volumeSlider.addEventListener('input', function(e) {
    bgMusic.volume = e.target.value / 10;
    document.getElementById('mute-btn').innerText = bgMusic.volume > 0 ? "🔊" : "🔇";
});

window.toggleMute = function() {
    if (!isMuted) {
        preMuteVolume = volumeSlider.value;
        volumeSlider.value = 0;
        bgMusic.volume = 0;
        document.getElementById('mute-btn').innerText = "🔇";
        isMuted = true;
    } else {
        volumeSlider.value = preMuteVolume;
        bgMusic.volume = preMuteVolume / 10;
        document.getElementById('mute-btn').innerText = "🔊";
        isMuted = false;
    }
};

window.toggleTheme = function() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    body.classList.toggle('light-mode');
    const isDark = body.classList.contains('dark-mode');
    document.getElementById('theme-btn').innerText = isDark ? "☀️ Light" : "🌙 Dark";
};

/* Reset everything */
window.resetProfile = function() {
    document.getElementById('username').value = '';
    document.getElementById('user-age').value = '';
    document.getElementById('user-gender').value = '';
    document.getElementById('user-email').value = '';
    document.getElementById('user-password').value = '';
    document.getElementById('user-phone').value = '';
    document.getElementById('user-address').value = '';
    restTime = 30;
    document.getElementById('rest-display').innerText = "30s";
    location.reload();
};