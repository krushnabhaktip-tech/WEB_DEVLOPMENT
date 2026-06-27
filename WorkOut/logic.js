import { db } from "./firebase.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let restTime = 30;
let isMuted = false;
let preMuteVolume = 5;

let userProfile = {
    name: "", age: "", gender: "", email: "", password: "", phone: "", address: "", avatarType: "upload", avatarValue: ""
};

let bgMusic;
let volumeSlider;

/* DOM Element binding checks */
document.addEventListener("DOMContentLoaded", () => {
    bgMusic = document.getElementById('bg-music');
    volumeSlider = document.getElementById('volume');

    if (volumeSlider) {
        volumeSlider.addEventListener('input', function(e) {
            if (bgMusic) {
                bgMusic.volume = e.target.value / 10;
                document.getElementById('mute-btn').innerText = bgMusic.volume > 0 ? "🔊" : "🔇";
            }
        });
    }
});

/* Explicit mapping for direct click execution in Chrome windows */
window.startworkout = function() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('main-workout-content').style.display = 'block';

    if (bgMusic && volumeSlider) {
        bgMusic.volume = volumeSlider.value / 10;
        bgMusic.play().catch(e => console.log("Audio play update notification:", e));
    }
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

/* Primary profile processing step */
window.validateAndSaveProfile = async function() {
    const name = document.getElementById('username').value.trim();
    const age = document.getElementById('user-age').value.trim();
    const gender = document.getElementById('user-gender').value;
    const email = document.getElementById('user-email').value.trim();
    const password = document.getElementById('user-password').value.trim();
    const phone = document.getElementById('user-phone').value.trim();
    const address = document.getElementById('user-address').value.trim();
    const avatarType = document.querySelector('input[name="avatar-type"]:checked').value;

    if (!name || !age || !gender || !email || !password || !phone || !address) {
        alert("Please complete all details before moving forward! ⚠️");
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters long! 🔐");
        return;
    }

    userProfile = { name, age, gender, email, password, phone, address, avatarType };

    if (avatarType === "anime") {
        // Dynamic Character Selected Image Path assigned perfectly
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

/* Database synchronization function */
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
        console.log("Saved Doc ID: ", docRef.id);
        showExerciseScreen();
    } catch (error) {
        console.error("Database status tracking error:", error);
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
    const mainProfileBtn = document.querySelector('.info-icon-btn');

    // Circle Image Avatar Render Logic
    if (userProfile.avatarType === "anime") {
        avatarDiv.innerHTML = `<img src="${userProfile.avatarValue}" style="width:50px; height:50px; border-radius:50%; object-fit:cover; border: 2px solid var(--accent-color);">`;
        if (mainProfileBtn) {
            mainProfileBtn.innerHTML = `<img src="${userProfile.avatarValue}" style="width:22px; height:22px; border-radius:50%; object-fit:cover; vertical-align:middle; margin-right:6px;"> Profile`;
        }
    } else {
        if (userProfile.avatarValue && (userProfile.avatarValue.startsWith("data:image") || userProfile.avatarValue.includes("/"))) {
            avatarDiv.innerHTML = `<img src="${userProfile.avatarValue}" style="width:50px; height:50px; border-radius:50%; object-fit:cover; border: 2px solid var(--accent-color);">`;
            if (mainProfileBtn) {
                mainProfileBtn.innerHTML = `<img src="${userProfile.avatarValue}" style="width:22px; height:22px; border-radius:50%; object-fit:cover; vertical-align:middle; margin-right:6px;"> Profile`;
            }
        } else {
            avatarDiv.innerHTML = `<span style="font-size: 40px;">👤</span>`;
            if (mainProfileBtn) {
                mainProfileBtn.innerHTML = `👤 Profile`;
            }
        }
    }

    document.getElementById('profile-setup-card').style.display = 'none';
    document.getElementById('exercise-screen').style.display = 'block';
    document.getElementById('app-navigation').style.display = 'flex';
}

window.selectExerciseCategory = function(category) {
    alert(`🏋️ Routine Initiated: '${category}' track timing sequence active!`);
};

window.switchTab = function(tabName) {
    console.log(`Tab event: ${tabName}`);
};

window.enableProfileEditing = function() {
    toggleUserInfoMenu();
    document.getElementById('profile-setup-card').style.display = 'block';
    document.getElementById('exercise-screen').style.display = 'none';
};

window.changeRestTime = function(amount) {
    restTime = Math.max(5, restTime + amount);
    document.getElementById('rest-display').innerText = restTime + "s";
};

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

window.resetProfile = function() {
    location.reload();
};