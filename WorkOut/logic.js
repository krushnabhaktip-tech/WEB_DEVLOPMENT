 let restTime = 30;
let isMuted = false;
let preMuteVolume = 5;

let userProfile = {
    name: "", age: "", gender: "", email: "", phone: "", address: "", avatarType: "upload", avatarValue: ""
};

const bgMusic = document.getElementById('bg-music');
const volumeSlider = document.getElementById('volume');

function startWorkout() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('main-workout-content').style.display = 'flex';
    bgMusic.volume = volumeSlider.value / 10;
    bgMusic.play().catch(e => console.log("Audio play update error:", e));
}

function toggleSettingsMenu() {
    document.getElementById('settings-menu').classList.toggle('settings-dropdown-hidden');
}

// Left side user profile panel trigger
function toggleUserInfoMenu() {
    document.getElementById('user-info-menu').classList.toggle('info-dropdown-hidden');
}

function switchAvatarView() {
    const type = document.querySelector('input[name="avatar-type"]:checked').value;
    if (type === "upload") {
        document.getElementById('avatar-input-container').style.display = "block";
        document.getElementById('anime-select-container').style.display = "none";
    } else {
        document.getElementById('avatar-input-container').style.display = "none";
        document.getElementById('anime-select-container').style.display = "block";
    }
}

function validateAndSaveProfile() {
    const name = document.getElementById('username').value.trim();
    const age = document.getElementById('user-age').value.trim();
    const gender = document.getElementById('user-gender').value;
    const email = document.getElementById('user-email').value.trim();
    const phone = document.getElementById('user-phone').value.trim();
    const address = document.getElementById('user-address').value.trim();
    const avatarType = document.querySelector('input[name="avatar-type"]:checked').value;

    if (!name || !age || !gender || !email || !phone || !address) {
        alert("Please complete all profile details before moving forward! ⚠️");
        return;
    }

    userProfile = { name, age, gender, email, phone, address, avatarType };

    if (avatarType === "anime") {
        userProfile.avatarValue = document.getElementById('anime-dp-select').value;
        showExerciseScreen();
    } else {
        const fileInput = document.getElementById('user-avatar');
        if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                userProfile.avatarValue = e.target.result;
                showExerciseScreen();
            }
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            userProfile.avatarValue = "👤";
            showExerciseScreen();
        }
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
    if (userProfile.avatarType === "anime" || userProfile.avatarValue === "👤") {
        avatarDiv.innerHTML = `<span style="font-size: 40px;">${userProfile.avatarValue}</span>`;
    } else {
        avatarDiv.innerHTML = `<img src="${userProfile.avatarValue}" style="width:45px; height:45px; border-radius:50%; object-fit:cover;">`;
    }

    document.getElementById('profile-setup-card').style.display = 'none';
    document.getElementById('exercise-screen').style.display = 'block';
    document.getElementById('app-navigation').style.display = 'flex';
}

function selectExerciseCategory(category) {
    alert("You selected " + category + " track! Your timeline navigation is ready.");
}

function switchTab(tabName) {
    alert("Navigating to " + tabName.toUpperCase() + " section.");
}

function enableProfileEditing() {
    document.getElementById('profile-setup-card').style.display = 'block';
    document.getElementById('exercise-screen').style.display = 'none';
    
    document.getElementById('username').value = userProfile.name;
    document.getElementById('user-age').value = userProfile.age;
    document.getElementById('user-gender').value = userProfile.gender;
    document.getElementById('user-email').value = userProfile.email;
    document.getElementById('user-phone').value = userProfile.phone;
    document.getElementById('user-address').value = userProfile.address;
    
    toggleUserInfoMenu();
}

function changeRestTime(amount) {
    restTime = Math.max(5, restTime + amount);
    document.getElementById('rest-display').innerText = restTime + "s";
}

volumeSlider.addEventListener('input', function(e) {
    bgMusic.volume = e.target.value / 10;
    document.getElementById('mute-btn').innerText = e.target.value > 0 ? "🔊" : "🔇";
});

function toggleMute() {
    if (!isMuted) {
        preMuteVolume = volumeSlider.value;
        volumeSlider.value = 0; bgMusic.volume = 0;
        document.getElementById('mute-btn').innerText = "🔇";
        isMuted = true;
    } else {
        volumeSlider.value = preMuteVolume || 5;
        bgMusic.volume = volumeSlider.value / 10;
        document.getElementById('mute-btn').innerText = "🔊";
        isMuted = false;
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    document.getElementById('theme-btn').innerText = document.body.classList.contains('dark-mode') ? "☀️ Light" : "🌙 Dark";
}

function resetProfile() {
    restTime = 30; document.getElementById('rest-display').innerText = "30s";
    volumeSlider.value = 5; bgMusic.volume = 0.5;
    document.getElementById('mute-btn').innerText = "🔊";
}