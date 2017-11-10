var background = chrome.extension.getBackgroundPage();

function generate_key_button() {
    background.kph.generate_new_key();
}

function get_login_button() {
    let url = document.getElementById("test_url").value;
    background.kph.get_logins(url, url);
}

document.getElementById("generate_key_button").onclick = generate_key_button;
document.getElementById("get_login_button").onclick = get_login_button;

console.log("loaded");