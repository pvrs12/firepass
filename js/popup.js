var background = chrome.extension.getBackgroundPage();

function generate_key_button() {
    background.kph.generate_new_key();
}

function get_login_button() {
    let url = document.getElementById("test_url").value;
    background.kph.get_logins(url, url).then((login_list) => {
        for(let i=0; i< login_list.length; ++i){
            console.log(login_list[i]);
        }
    });
}

function clear_button() {
    background.ls.clear();
}

document.getElementById("generate_key_button").onclick = generate_key_button;
document.getElementById("get_login_button").onclick = get_login_button;
document.getElementById("clear_button").onclick = clear_button;

console.log("loaded");