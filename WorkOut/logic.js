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
}