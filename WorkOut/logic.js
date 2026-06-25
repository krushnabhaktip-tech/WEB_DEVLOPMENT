function toggleSettingsMenu() {
    const menu = document.getElementById('settings-menu');
    menu.classList.toggle('settings-dropdown-hidden');

}

function gotoAgePage(){
    const nameInput = document.getElementById('username').value.trim();
    if(nameInput === ""){
        alert("Please enter your name,Buddy! 😊");
        return;
    }
    alert("Welcome,"+ nameInput +"! Now let's go to the next page.");
    window.location.href = "age.html";
}
let restTime = 30;

function changeRestTime(amount) {
    restTime = restTime + amount;

    if (restTime < 5) {
        restTime = 5;
    }

    document.getElementById('rest-display').innerText = restTime + "s";
}

document.getElementById('volume').addEventListener('input',function(e){
    let currentVolume = e.target.Value;
    console.log("Current Volume: " + currentvolume);
});

document.getElementById('music-track').addEventListener('change',function(e){
    let selectedTrack = e.target.value;
    console.log("Selected Track: "+ selectedTrack);
});

 

function resetSettings() {
    restTime = 30;
    document.getElementById('rest-display').innerText = "30s";
}

function toggleTheme(){
     const body = document.body;
      
    body.classList.toggle('dark-mode');
    const themeBtn = document.getElementById('theme-btn');

    if(body.classList.contains('dark-mode')){
        themeBtn.innerText = " 🌞 Light";
    }else {
        themeBtn.innerText = " 🌙 Dark";
    }
}

window.addEventListener('click',(e) => {
const settingsmenu = document.getElementsById('settings-menu');
const settingsBtn = document.querySelector('.settings-icon-btr');
const dropdownContent = document.querySelector('.settings-dropdown-content')
 

 
    if (settingsMenu && !settingsMenu.classList.contains('settings-dropdown-hidden') ) {
        if (!settingsBtn.contains(e.target) && !settingsMenu.querySelector('.settings-dropdown-content').contains(e.target)) {
        settingsMenu.classList.add('settings-dropdown-hidden' );
        }
    }
});

let isMuted = false;
let preMuteVolume = 5; 

function toggleMute() {
    const volumeSlider = document.getElementById('volume');
    const muteIcon = document.getElementById('mute-btn');

    if (!isMuted) {
        
        preMuteVolume = volumeSlider.value;
        volumeSlider.value = 0;
        muteIcon.innerText = "🔇";
        isMuted = true;
    } else {
        // Unmute state: purani volume wapas laao
        volumeSlider.value = preMuteVolume > 0 ? preMuteVolume : 5;
        muteIcon.innerText = "🔊";
        isMuted = false;
    }
    
   
}
function startWorkout() {
    // Start screen ko chupa do
    document.getElementById('start-screen').style.display = 'none';
    // Main components ko dikha do
    document.getElementById('main-workout-content').style.display = 'block';
}