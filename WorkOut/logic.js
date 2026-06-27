 let restTime = 30;

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

function validateAndSaveProfile() {
    const avatarType = document.querySelector('input[name="avatar-type"]:checked').value;
    let avatarSrc = "images/naruto.png"; // Default fallback

    if (avatarType === 'anime') {
        avatarSrc = document.getElementById('anime-dp-select').value;
    }
    
    // ડેશબોર્ડના સર્કલમાં ફોટો સેટ કરો
    document.getElementById('view-avatar-div').style.backgroundImage = `url('${avatarSrc}')`;

    // સ્ક્રીન ચેન્જ કરો
    document.getElementById('profile-setup-card').style.display = 'none';
    document.getElementById('exercise-screen').style.display = 'block';
}

function selectExerciseCategory(category) {
    alert(category + " Training Selected!");
}

function changeRestTime(amount) {
    restTime = Math.max(0, restTime + amount);
    document.getElementById('rest-display').innerText = restTime + "s";
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
}

function resetProfile() {
    document.getElementById('exercise-screen').style.display = 'none';
    document.getElementById('welcome-screen').style.display = 'block';
}

function goToProfile() {
    document.getElementById('exercise-screen').style.display = 'none';
    document.getElementById('profile-setup-card').style.display = 'block';
}