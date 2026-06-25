let restTime = 30;
let isMuted = false;
let preMuteVolume = 5;

let currentCategory = "";
let currentDay = 1;
let currentExerciseIndex = 0;
let workoutTimer = null;
let workoutSecondsLeft = 30;
let isWorkoutPaused = false;
let totalDaysCompleted = 0;

let userProfile = {
    name: "", age: "", gender: "", email: "", phone: "", address: "", avatarType: "upload", avatarValue: ""
};

const exercisesDatabase = {
    "Before 18": [
        { name: "Easy Child Pose", emoji: "👶" },
        { name: "Gentle Cat-Cow", emoji: "🐈" },
        { name: "Tree Pose Balance", emoji: "🌴" },
        { name: "Butterfly Stretch", emoji: "🦋" },
        { name: "Cobra Pose Intro", emoji: "🐍" },
        { name: "Downward Dog Easy", emoji: "🐕" },
        { name: "Warrior I Pose", emoji: "🪖" },
        { name: "Triangle Stretch", emoji: "🔺" },
        { name: "Bridge Pose Flow", emoji: "🌉" },
        { name: "Deep Relaxation Savasana", emoji: "🛌" }
    ],
    "After 18": [
        { name: "Deep Sun Salutation", emoji: "☀️" },
        { name: "Advanced Warrior II", emoji: "⚔️" },
        { name: "Plank Hold Balance", emoji: "🪵" },
        { name: "Intense Camel Pose", emoji: "🐫" },
        { name: "Crow Pose Practice", emoji: "🦅" },
        { name: "King Cobra Stretch", emoji: "👑" },
        { name: "Wheel Pose Flow", emoji: "🎡" },
        { name: "Seated Forward Bend", emoji: "🧘‍♂️" },
        { name: "Shoulder Stand Hold", emoji: "🤸" },
        { name: "Final Meditation Savasana", emoji: "🌌" }
    ]
};

const bgMusic = document.getElementById('bg-music');

window.addEventListener('DOMContentLoaded', () => {
    loadSavedProfileData();
});

function startWorkout() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('main-workout-content').style.display = 'flex';
    
    try {
        const slider = document.getElementById('volume');
        if (slider) {
            bgMusic.volume = slider.value / 10;
        } else {
            bgMusic.volume = 0.5;
        }
        bgMusic.play().catch(err => {
            console.log("Browser music auto-play restricted, waiting for user click.");
        });
    } catch (e) {
        console.log("Safe bypass triggers active");
    }
}

function toggleSettingsMenu() {
    document.getElementById('settings-menu').classList.toggle('settings-dropdown-hidden');
}

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

function changeMusicTrack() {
    const selectedTrack = document.getElementById('music-track').value;
    bgMusic.src = selectedTrack;
    if (!isMuted) {
        bgMusic.play().catch(e => console.log("Track change handled"));
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

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        alert("Please enter a valid Email Address layout! 📧");
        return;
    }

    userProfile = { name, age, gender, email, phone, address, avatarType };

    if (avatarType === "anime") {
        userProfile.avatarValue = document.getElementById('anime-dp-select').value;
        saveDataToLocalStorage();
        applyAvatarToHeader();
        goToExerciseSelection();
    } else {
        const fileInput = document.getElementById('user-avatar');
        if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                userProfile.avatarValue = e.target.result;
                saveDataToLocalStorage();
                applyAvatarToHeader();
                goToExerciseSelection();
            }
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            if(!userProfile.avatarValue) {
                userProfile.avatarValue = "👤";
            }
            saveDataToLocalStorage();
            applyAvatarToHeader();
            goToExerciseSelection();
        }
    }
}

function saveDataToLocalStorage() {
    localStorage.setItem('yoga_userProfile', JSON.stringify(userProfile));
    localStorage.setItem('yoga_currentDay', currentDay);
    localStorage.setItem('yoga_totalDaysCompleted', totalDaysCompleted);
    localStorage.setItem('yoga_currentCategory', currentCategory);
}

function loadSavedProfileData() {
    const savedProfile = localStorage.getItem('yoga_userProfile');
    const savedDay = localStorage.getItem('yoga_currentDay');
    const savedCompleted = localStorage.getItem('yoga_totalDaysCompleted');
    const savedCategory = localStorage.getItem('yoga_currentCategory');

    if (savedProfile) {
        userProfile = JSON.parse(savedProfile);
        
        document.getElementById('username').value = userProfile.name;
        document.getElementById('user-age').value = userProfile.age;
        document.getElementById('user-gender').value = userProfile.gender;
        document.getElementById('user-email').value = userProfile.email;
        document.getElementById('user-phone').value = userProfile.phone;
        document.getElementById('user-address').value = userProfile.address;

        if (savedDay) currentDay = parseInt(savedDay);
        if (savedCompleted) totalDaysCompleted = parseInt(savedCompleted);
        if (savedCategory) currentCategory = savedCategory;

        applyAvatarToHeader();
    }
}

function applyAvatarToHeader() {
    const btn = document.getElementById('header-avatar-btn');
    if (userProfile.avatarType === "anime" || userProfile.avatarValue === "👤" || !userProfile.avatarValue) {
        btn.innerHTML = `<span style="font-size:22px;">${userProfile.avatarValue || "👤"}</span>`;
    } else {
        btn.innerHTML = `<img src="${userProfile.avatarValue}">`;
    }

    document.getElementById('view-name').innerText = userProfile.name || "-";
    document.getElementById('view-age').innerText = userProfile.age || "-";
    document.getElementById('view-gender').innerText = userProfile.gender || "-";
    document.getElementById('view-email').innerText = userProfile.email || "-";
    document.getElementById('view-phone').innerText = userProfile.phone || "-";
    document.getElementById('view-address').innerText = userProfile.address || "-";
}

function goToExerciseSelection() {
    document.getElementById('profile-setup-card').style.display = 'none';
    if (currentCategory === "") {
        document.getElementById('exercise-screen').style.display = 'block';
    } else {
        document.getElementById('calendar-screen').style.display = 'block';
        document.getElementById('app-navigation').style.display = 'flex';
        generateCalendarGrid();
    }
}

function selectExerciseCategory(category) {
    currentCategory = category;
    saveDataToLocalStorage();
    document.getElementById('exercise-screen').style.display = 'none';
    document.getElementById('calendar-screen').style.display = 'block';
    document.getElementById('app-navigation').style.display = 'flex';
    generateCalendarGrid();
}

function generateCalendarGrid() {
    const container = document.getElementById('calendar-days-box');
    container.innerHTML = "";
    for (let i = 1; i <= 30; i++) {
        const dayBtn = document.createElement('div');
        dayBtn.classList.add('day-box');
        dayBtn.innerText = "Day " + i;
        
        if (i < currentDay) {
            dayBtn.classList.add('completed');
        } else if (i > currentDay) {
            dayBtn.classList.add('locked');
        }

        dayBtn.onclick = () => {
            if (i === currentDay) {
                startDayWorkout(i);
            }
        };
        container.appendChild(dayBtn);
    }
    document.getElementById('streak-count').innerText = totalDaysCompleted;
}

function speakVoice(text) {
    try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    } catch(e) {
        console.log("Voice synth feedback note");
    }
}

function startDayWorkout(dayNum) {
    document.getElementById('calendar-screen').style.display = 'none';
    document.getElementById('workout-play-screen').style.display = 'block';
    currentExerciseIndex = 0;
    playCountdownAndStartExercise();
}

function playCountdownAndStartExercise() {
    clearInterval(workoutTimer);
    isWorkoutPaused = false;
    document.getElementById('pause-btn').innerText = "⏸️ Pause";
    
    let count = 3;
    document.getElementById('timer-number-display').innerText = count;
    document.getElementById('current-ex-title').innerText = "Get Ready!";
    
    speakVoice("Get ready. Three. Two. One. Start.");

    let countdown = setInterval(() => {
        count--;
        if (count > 0) {
            document.getElementById('timer-number-display').innerText = count;
        } else {
            clearInterval(countdown);
            loadExercise();
        }
    }, 1000);
}

function loadExercise() {
    const list = exercisesDatabase[currentCategory];
    const ex = list[currentExerciseIndex];
    
    document.getElementById('current-ex-title').innerText = ex.name;
    document.getElementById('animation-emoji-graphic').innerText = ex.emoji;
    document.getElementById('ex-progress-count').innerText = `Exercise ${currentExerciseIndex + 1} of 10`;
    
    workoutSecondsLeft = 30;
    document.getElementById('timer-number-display').innerText = workoutSecondsLeft;
    
    speakVoice(`Next pose is ${ex.name}. Hold for thirty seconds.`);

    workoutTimer = setInterval(() => {
        if (!isWorkoutPaused) {
            workoutSecondsLeft--;
            document.getElementById('timer-number-display').innerText = workoutSecondsLeft;
            
            if (workoutSecondsLeft <= 0) {
                clearInterval(workoutTimer);
                handleExerciseComplete();
            }
        }
    }, 1000);
}

function togglePauseResume() {
    isWorkoutPaused = !isWorkoutPaused;
    document.getElementById('pause-btn').innerText = isWorkoutPaused ? "▶️ Resume" : "⏸️ Pause";
}

function skipExercise() {
    clearInterval(workoutTimer);
    handleExerciseComplete();
}

function handleExerciseComplete() {
    currentExerciseIndex++;
    if (currentExerciseIndex < 10) {
        showRestScreen();
    } else {
        finishDayWorkout();
    }
}

function showRestScreen() {
    document.getElementById('workout-play-screen').style.display = 'none';
    document.getElementById('rest-screen').style.display = 'block';
    
    workoutSecondsLeft = restTime;
    document.getElementById('rest-number-display').innerText = workoutSecondsLeft;
    speakVoice("Take a break.");

    workoutTimer = setInterval(() => {
        workoutSecondsLeft--;
        document.getElementById('rest-number-display').innerText = workoutSecondsLeft;
        if (workoutSecondsLeft <= 0) {
            clearInterval(workoutTimer);
            skipRest();
        }
    }, 1000);
}

function skipRest() {
    clearInterval(workoutTimer);
    document.getElementById('rest-screen').style.display = 'none';
    document.getElementById('workout-play-screen').style.display = 'block';
    loadExercise();
}

function finishDayWorkout() {
    document.getElementById('workout-play-screen').style.display = 'none';
    document.getElementById('calendar-screen').style.display = 'block';
    
    speakVoice("Congratulations, Buddy! Today workout is completed.");
    alert("Day " + currentDay + " workout completed successfully! 🎉");
    
    totalDaysCompleted++;
    currentDay++;
    saveDataToLocalStorage();
    generateCalendarGrid();
    updateCharts3D();
}

function updateCharts3D() {
    document.getElementById('report-total-days').innerText = totalDaysCompleted;
    
    const h1 = Math.min(100, 10 + (Math.min(totalDaysCompleted, 7) * 12));
    const h2 = Math.min(100, 10 + (Math.max(0, Math.min(totalDaysCompleted - 7, 7)) * 12));
    const h3 = Math.min(100, 10 + (Math.max(0, Math.min(totalDaysCompleted - 14, 7)) * 12));
    const h4 = Math.min(100, 10 + (Math.max(0, Math.min(totalDaysCompleted - 21, 9)) * 10));

    document.getElementById('bar-wk1').style.height = h1 + "%";
    document.getElementById('bar-wk2').style.height = h2 + "%";
    document.getElementById('bar-wk3').style.height = h3 + "%";
    document.getElementById('bar-wk4').style.height = h4 + "%";
}

function switchTab(tabName) {
    document.getElementById('profile-setup-card').style.display = 'none';
    document.getElementById('exercise-screen').style.display = 'none';
    document.getElementById('calendar-screen').style.display = 'none';
    document.getElementById('workout-play-screen').style.display = 'none';
    document.getElementById('rest-screen').style.display = 'none';
    document.getElementById('report-screen').style.display = 'none';

    if (tabName === 'home') {
        if (currentCategory === "") {
            document.getElementById('exercise-screen').style.display = 'block';
        } else {
            document.getElementById('calendar-screen').style.display = 'block';
            generateCalendarGrid();
        }
    } else if (tabName === 'report') {
        document.getElementById('report-screen').style.display = 'block';
        updateCharts3D();
    }
}

function enableProfileEditing() {
    switchTab('clear-all');
    document.getElementById('profile-setup-card').style.display = 'block';
    toggleUserInfoMenu();
}

function changeRestTime(amount) {
    restTime = Math.max(5, restTime + amount);
    document.getElementById('rest-display').innerText = restTime + "s";
}

function changeVolumeFromSettings() {
    const slider = document.getElementById('volume');
    bgMusic.volume = slider.value / 10;
    document.getElementById('mute-btn').innerText = slider.value > 0 ? "🔊" : "🔇";
}

function toggleMute() {
    const slider = document.getElementById('volume');
    if (!isMuted) {
        preMuteVolume = slider.value;
        slider.value = 0; bgMusic.volume = 0;
        document.getElementById('mute-btn').innerText = "🔇";
        isMuted = true;
    } else {
        slider.value = preMuteVolume || 5;
        bgMusic.volume = slider.value / 10;
        document.getElementById('mute-btn').innerText = "🔊";
        isMuted = false;
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('Light-mode');
    document.getElementById('theme-btn').innerText = document.body.classList.contains('dark-mode') ? "☀️ Light" : "🌙 Dark";
}

function resetProfile() {
    localStorage.clear();
    restTime = 30; document.getElementById('rest-display').innerText = "30s";
    const slider = document.getElementById('volume');
    if (slider) { slider.value = 5; }
    bgMusic.volume = 0.5;
    document.getElementById('mute-btn').innerText = "🔊";
    alert("Profile storage reset completed!");
    location.reload();
}