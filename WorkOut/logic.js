function toggleSettingsMenu() {
    const menu = document.getElementById('settings-menu');
    menu.classList.toggle('hidden');

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
    let currentVolume = e.target.value;
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
    document.body.classList.toggle('dark-mode');

    const themeBtn = document.getElementsById('theme-btn');
    if(document.body.classList.contains('dark-mode')){
        themeBtn.innerText = " 🌞 Light";
    }else {
        themeBtn.innerText = " 🌙 Dark";
    }
}

window.addEventListener('click',(e) => {
const settingsMenu = document.getElementsById('.settings-menu');
const settingsBtn = document.querySelector('.settings-icon-btr');

 
    if (!settingsMenu.contains(e.target) && !settingsBtn.contains(e.target) ) {
        settingsMenu.classList.add('settings-dropdown-hidden');
    }
});