// Global states
let restTime = 30;
let isMuted = false;
let preMuteVolume = 5;

// Elements
const bgMusic = document.getElementById('bg-music');
const volumeSlider = document.getElementById('volume');

function toggleSettingsMenu() {
    const menu = document.getElementById('settings-menu');
    menu.classList.toggle('settings-dropdown-hidden');
}

function startWorkout() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('main-workout-content').style.display = 'flex';
    
    // Background music starts playing when workout starts!
    bgMusic.volume = volumeSlider.value / 10;
    bgMusic.play().catch(error => console.log("Music play blocked by browser:", error));
}

function gotoAgePage() {
    const nameInput = document.getElementById('username').value.trim();
    if (nameInput === "") {
        alert("Please enter your name, Buddy! 😊");
        return;
    }
    alert("Welcome, " + nameInput + "! Now let's go to the next page.");
    // window.location.href = "age.html"; // Jene tame aagad page banavso
}

function changeRestTime(amount) {
    restTime += amount;
    if (restTime < 5) {
        restTime = 5;
    }
    document.getElementById('rest-display').innerText = restTime + "s";
}

// Live Volume Control
volumeSlider.addEventListener('input', function(e) {
    let currentVolume = e.target.value;
    bgMusic.volume = currentVolume / 10;
    if(currentVolume > 0) {
        isMuted = false;
        document.getElementById('mute-btn').innerText = "🔊";
    } else {
        isMuted = true;
        document.getElementById('mute-btn').innerText = "🔇";
    }
});

function toggleMute() {
    if (!isMuted) {
        preMuteVolume = volumeSlider.value;
        volumeSlider.value = 0;
        bgMusic.volume = 0;
        document.getElementById('mute-btn').innerText = "🔇";
        isMuted = true;
    } else {
        volumeSlider.value = preMuteVolume > 0 ? preMuteVolume : 5;
        bgMusic.volume = volumeSlider.value / 10;
        document.getElementById('mute-btn').innerText = "🔊";
        isMuted = false;
    }
}

function toggleTheme() {
    const body = document.body;
    const themeBtn = document.getElementById('theme-btn');
    
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        themeBtn.innerText = "☀️ Light";
    } else {
        themeBtn.innerText = "🌙 Dark";
    }
}

function resetProfile() {
    restTime = 30;
    document.getElementById('rest-display').innerText = "30s";
    volumeSlider.value = 5;
    bgMusic.volume = 0.5;
    document.getElementById('mute-btn').innerText = "🔊";
    document.getElementById('username').value = "";
    alert("Settings reset successfully!");
}

// Close dropdown if clicked outside
window.addEventListener('click', function(e) {
    const menu = document.getElementById('settings-menu');
    const iconBtn = document.querySelector('.settings-icon-btn');
    if (menu && !menu.classList.contains('settings-dropdown-hidden') && !iconBtn.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.add('settings-dropdown-hidden');
    }
});