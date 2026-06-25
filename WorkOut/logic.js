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

function startWorkout() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('main-workout-content').style.display = 'flex';
    
    const slider = document.getElementById('volume');
    if (slider) {
        bgMusic.volume = slider.value / 10;
    } else {
        bgMusic.volume = 0.5;
    }
    
    let playPromise = bgMusic.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            console.log("Audio bypass setup successful");
        }).catch(err => {
            console.log("Audio waiting for interactive permissions:", err);
        });
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
        bgMusic.play().catch(e => console.log("Music swap tracker:", e));
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
        applyAvatarToHeader();
        goToExerciseSelection();
    } else {
        const fileInput = document.getElementById('user-avatar');
        if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                userProfile.avatarValue = e.target.result;
                applyAvatarToHeader();
                goToExerciseSelection();
            }
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            userProfile.avatarValue = "👤";
            applyAvatarToHeader();
            goToExerciseSelection();
        }
    }
}

function applyAvatarToHeader() {
    const btn = document.getElementById('header-avatar-btn');
    if (userProfile.avatarType === "anime" || userProfile.avatarValue === "👤") {
        btn.innerHTML = `<span style="font-size:22px;">${userProfile.avatarValue}</span>`;
    } else {
        btn.innerHTML = `<img src="${userProfile.avatarValue}">`;
    }

    document.getElementById('view-name').innerText = userProfile.name;
    document.getElementById('view-age').innerText = userProfile.age;
    document.getElementById('view-gender').innerText = userProfile.gender;
    document.getElementById('view-email').innerText = userProfile.email;
    document.getElementById('view-phone').innerText = userProfile.phone;
    document.getElementById('view-address').innerText = userProfile.address;
}

function goToExerciseSelection() {
    document.getElementById('profile-setup-card').style.display = 'none';
    document.getElementById('exercise-screen').style.display = 'block';
}

function selectExerciseCategory(category) {
    currentCategory = category;
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
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
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
        if (!